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
   | `tier` | `quick` (cap 24 agents), `standard` (cap 45, the default), `max` (cap 90). Measured cost: `quick` on a 50-line design doc took 16 agents, about 1M subagent tokens and 17 minutes. Scale your expectations from that. |
   | `fix` | `copy` (default; writes `out/fixed/`), `inplace` (code in a git repo with a clean tree, so tests run against the real tree), `none` (report only) |
   | `maxAgents` | lower the cap if needed. The script refuses a cap below its tier's minimum. |

2. **Opt-in.** Run the workflow directly when the user typed `/stress-testing` or asked for a stress test, workflow or ultracode. Otherwise, state the tier, the agent cap and the fact that it spawns subagents, then ask before running.
3. **Run.** Call `Workflow({scriptPath: "<skillDir>/scripts/stress-test.js", args: {...}})`. Pass `args` as a JSON object, not a string.
4. **Report.** Give the user the verdict exactly as returned, each condition verbatim, and the open blockers and decisions needed. Include the paths to `REPORT.md`, `ledger.json` and the fixed artifact. Also state agents spawned against the cap, and anything the run skipped for budget.

## Verdict

| Status | Meaning | Your next move |
|---|---|---|
| PASS | No open blocker. Every claim was checked. No residual estimate, calibration miss or skipped step. | Deliver. |
| CONDITIONAL | No open blocker, but listed conditions hold (unverifiable claims, an estimated residual, low calibration recall, budget skips). | Hand the conditions to the user. |
| FAIL | A confirmed critical or major defect is still in the delivered artifact: unfixed, fix not independently checked, or DECISION_NEEDED. | Show the open blockers with their evidence, and the options for each DECISION_NEEDED. The user decides; once they do, a fresh run checks the result. |

A CONDITIONAL or FAIL ends the run. Any follow-up is a fresh run the user asks for, after they supply the decisions or facts the conditions name. That boundary is what keeps the work from reaching round 17.

## Without the Workflow tool

Inside a subagent or another harness, run the same phases yourself with the Agent tool, keeping the same rules:

- One finder per lens (see `references/lenses.md`), then one claims checker.
- Dedup against everything already seen.
- For each critical or major defect, three cold verifiers, each with a different job: re-derive the evidence, reproduce the failure, check scope and severity.
- One writer applies the fixes.
- After the fix, one agent checks the fixes and one reviews the changed regions.
- Three cold disputers read only the outputs.
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
| Writing the verdict as prose ("looks solid") | Quote the computed status and its conditions verbatim. |
