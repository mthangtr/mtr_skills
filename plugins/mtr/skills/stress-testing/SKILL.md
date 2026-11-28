---
name: stress-testing
description: Use when an artifact (code, design or architecture doc, spec, plan, prompt or skill, report) must hold up so well that a fresh agent with no context cannot dispute it; when asked to stress-test, harden, red-team, audit or "make airtight" something; or when a review→fix loop keeps adding rounds without converging or spawns too many reviewers.
---

# Stress-testing

**Skill folder:** `${CLAUDE_PLUGIN_ROOT}/skills/stress-testing/`, the base directory shown when this skill loads. Always use its absolute path for the script and references. The paths `scripts/…` and `references/…` below are relative to this folder.

## Overview

"Cannot be disputed" means four things you can check:

- Every finding carries evidence that a cold reader can recheck.
- Every claim in the artifact has a verdict.
- Every check that did not run is named.
- The verdict is computed from gates, not judged.

Two rules hold for every agent the workflow spawns:

- **Research, never guess.** A fact the artifact depends on that lies outside it, such as a law, a standard, an API, a vendor's behaviour, a price or a date, is checked against its primary source with web or documentation tools and quoted with its URL. A fact that cannot be sourced is marked UNVERIFIABLE, never asserted from memory.
- **The right model for each role.** Cheap models do mechanical steps, a mid model reads and judges, and the strongest model is used only for the single writer.

The bundled workflow enforces this in code. Every independent finder runs once over the whole artifact. Verifiers start cold and default to "refuted". A single writer fixes. After that, only the changed regions are re-reviewed. Cold agents then try to dispute the output files themselves. Agent count has a hard cap.

Why each mechanism exists, with sources: `references/evidence.md`.

## Running it

1. **Pick the args.**

   | arg | value |
   |---|---|
   | `artifact` | absolute path, or an array of paths |
   | `out` | absolute output directory, e.g. `<artifact dir>/stress-test-<name>/` |
   | `skillDir` | the skill folder above, as an absolute path |
   | `goal` | what the artifact must achieve, in the user's words. Pass it whenever the user said it; it becomes the contract. |
   | `sources` | requirements docs, the code a doc describes, anything the artifact must agree with |
   | `tier` | `quick` (cap 24 agents), `standard` (cap 45, the default), `max` (cap 90). `quick` runs no calibration, so its PASS carries the note "panel not calibrated"; use `standard` or above when the result must be trusted. Measured cost: `quick` on a 50-line design doc took 16 agents, about 1M subagent tokens and 17 minutes. Scale your expectations from that. |
   | `fix` | `copy` (default; writes `out/fixed/`), `inplace` (code in a git repo with a clean tree, so tests run against the real tree), `none` (report only) |
   | `maxAgents` | lower the cap if needed. The script refuses a cap below its tier's minimum. |
   | `models` | optional `{mech, read, fix}` override. Default: `haiku` for mechanical steps (dedup, report rendering, calibration match), `sonnet` for reading and judging (scope, finders, claims, verifiers, regression and delta checks, disputers, planting calibration defects), `opus` for the single writer. Running every role on the top model exhausts usage limits mid-run. |
   | `calibrationThreshold` | recall on planted defects required for PASS, default `0.8` (one miss of five allowed). |
   | `researcherType` | agent type for read and judge roles, default `agent-researcher` (needs web and docs tools). Pass `null` where no such agent type exists; the default agent then still receives the research rule. |

2. **Opt-in.** Run the workflow directly when the user typed `/stress-testing` or asked for a stress test, workflow or ultracode. Otherwise, state the tier, the agent cap and the fact that it spawns subagents, then ask before running.
3. **Run.** Call `Workflow({scriptPath: "<skillDir>/scripts/stress-test.js", args: {...}})`. Pass `args` as a JSON object, not a string.
4. **Report.** Give the user the verdict exactly as returned, each condition verbatim, and the open blockers and decisions needed. Include the paths to `REPORT.md`, `ledger.json` and the fixed artifact. Also state agents spawned against the cap, and anything the run skipped for budget.

## Verdict

The verdict has two gates. The artifact must have no open blocker, and the review must have shown, on this same artifact, that it can find defects.

| Status | Meaning | Your next move |
|---|---|---|
| PASS | No open blocker, and the panel caught at least the calibration threshold of planted defects (default 80%, `calibrationThreshold`). | Deliver, and pass the notes on as known risks. |
| FAIL | A critical or major defect is still open: unfixed, its fix not independently checked, its candidate never verified, or DECISION_NEEDED. | Show the open blockers with their evidence, and the options for each DECISION_NEEDED. Once the user decides, a fresh run checks the result. |
| UNPROVEN | No open blocker was found, but the panel missed too many planted defects, or calibration did not run. "No blocker" is not trustworthy. | Redo the review, not the artifact: a fresh run with a stronger read model (`models: {read: 'opus'}`) or the `max` tier. Never deliver an UNPROVEN result as a pass. |

Calibration agents are reserved in the budget like the report writers, so a run cannot skip calibration and still claim a result.

**Notes** are reported under "Known risks" but never change the status. They cover unverifiable claims, the capture-recapture residual estimate and budget skips. A residual estimate is a known risk, not a reason to run again. Chasing a zero residual is the round-17 trap, because LLM finders always find some edge case that only one of them sees.

### Across runs: the way out

Each run ends at its verdict. The loop that improves an artifact is:

1. Run.
2. On FAIL, the user decides the DECISION_NEEDED items, or the open fixes are applied.
3. Start a fresh run, with the previous `ledger.json` in `sources` so settled findings are not raised again.
4. Stop at PASS.

Quality is shown to be rising when each fresh run confirms fewer new blockers while calibration holds. Escalate instead of running again when either of these happens:

- **The same region yields confirmed blockers in three runs.** The design of that part is wrong, not its wording. Stop patching and redesign that part with the user.
- **The count of new confirmed blockers stops falling across three runs while calibration holds.** The artifact is too big for one panel. Split it and stress-test the parts separately.

## Without the Workflow tool

Inside a subagent or another harness, run the same phases yourself with the Agent tool, keeping the same rules:

- One finder per lens (see `references/lenses.md`), then one claims checker.
- Dedup against everything already seen.
- For each critical or major defect, three cold verifiers, each with a different job: re-derive the evidence, reproduce the failure, check scope and severity.
- One writer applies the fixes.
- After the fix, one agent checks the fixes and one reviews the changed regions.
- Three cold disputers read only the outputs.
- Give read and judge roles web and documentation tools, and apply the research rule.
- Calibrate: plant 5 realistic defects in a copy, run the lens finders cold on it, and count how many they catch.
- Compute the verdict by the table above.
- Cap the run at the tier's agent count.

## Common mistakes

These failures were observed in baseline runs without this skill:

| Mistake | What to do instead |
|---|---|
| Running full discovery again every round and stopping only at "zero findings". LLM reviewers always find something, so the run never converges. | Run full discovery once. Later rounds look only at the delta, and they end when no open blocker remains or the cycle cap is hit. |
| The fixer invents defaults, redesigns or "proposed values". Each one is new surface for reviewers to dispute. | A fix may use only facts already present. Anything else becomes DECISION_NEEDED, with options. |
| Treating "no findings" as done | Use the claims inventory: every claim gets HOLDS, FAILS or UNVERIFIABLE. |
| Adding more reviewers, debate rounds, or "hostile reader" personas to increase confidence | Use distinct lenses, cold verifiers and oracles (run it, compute it). Same-model panels repeat each other's errors. |
| Fanning out 100 reviewers | The tier cap is enforced in code. Pick a tier rather than a count. |
| Writing the verdict as prose ("looks solid") | Quote the computed status, its conditions and its notes verbatim. |
| Agents asserting laws, API behaviour or vendor facts from memory | Every agent researches primary sources and cites URLs; unsourced facts are UNVERIFIABLE. |
| Running every agent on the top model | Use model tiering by role; the top model is for the single writer only. |
