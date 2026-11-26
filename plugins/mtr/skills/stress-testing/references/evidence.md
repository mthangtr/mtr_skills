# Why the workflow is built this way

Each mechanism below is backed by evidence. The confidence levels reflect research done in 2026-11. Preprints are labelled as such, and claims whose figures were never fetched or checked against the source are marked unverified. Read this file when someone challenges the design, or before you change a mechanism.

| Mechanism | Evidence | Source |
|---|---|---|
| Finders run independently in parallel, with no meeting or debate before merging | About 95% of inspection defects are found in individual preparation; meetings added about 5% (Votta). Porter found a 30–33% meeting gain, so this is contested. Multi-agent debate does not reliably beat self-consistency, and it can turn correct answers into wrong ones. | Votta doi:10.1145/167049.167070; Porter TSE; arxiv 2311.17371; arxiv 2310.01798 |
| No reviewer personas ("hostile reader", devil's advocate) | Multi-persona angel/devil debate was among the weakest protocols tested. Stance assigned by prompt invites sycophancy and fabricated findings. | arxiv 2311.17371; Kenton et al. (DeepMind) |
| Each finder gets a different lens, not N copies of a generic reviewer | Defect- and scenario-based reading found about 35% more defects than ad hoc reading in one experiment. The PBR replication was mixed. Same-model ensembles make correlated errors: 9–10 judges give about 2–3.5 effective votes. | Porter/Votta/Basili TSE 1995; Carver EMSE 2006; arxiv 2605.29800; arxiv 2506.07962 |
| Verifiers are separate from finders, start cold, default to "refuted", and are told to use an oracle | Intrinsic self-correction lowers accuracy; gains come from external checks (Huang et al. 2023; CRITIC). Ten reviewers unanimously endorsed a non-existent bug, and only an empirical test killed it. A verifier that saw the upstream reasoning confirmed it 100% of the time (preprints). | arxiv 2310.01798; arxiv 2604.19049; arxiv 2603.21454 |
| Evidence ladder: execution > computation > quote > reasoning | Polling in domains with no verifier gives no consistent gain. Extra samples help when a verifier filters them. An in-band judge accepted 44% of real regressions (preprint). | arxiv 2603.06612; arxiv 2607.25152 |
| Only critical/major DEFECTs gate. IMPROVEMENT and QUESTION are recorded but never start another round. | Only 14% of review comments at Microsoft were about defects. Checking trivia gives about 90% minor findings (Gilb). "A reviewer asked to find problems will always find something" (Claude Code docs). | Bacchelli & Bird ICSE 2013; Gilb; code.claude.com/docs/en/best-practices |
| Full discovery runs once. Later rounds review only the changed regions (delta) and verify the fixes. | Re-running full rounds produced non-monotonic defect counts on a 7,152-line spec: 15, 8, 12, 2, 8, 1, 4, 1, 0, with cascading edits. Multi-turn review lowered F1 (0.376 → 0.303) and added 62% more false positives (preprints). | arxiv 2605.12280; arxiv 2603.16244 |
| One writer applies all fixes. A fix needing an unsupported value becomes DECISION_NEEDED instead of an invented value. | Parallel writers act on conflicting unstated assumptions (Cognition). Observed in this skill's RED baseline: the fixer added redesigns and "proposed defaults", which gave reviewers new surface to dispute. | cognition.com/blog/dont-build-multi-agents; RED baseline A |
| Finding ledger with stable IDs; dedup against every entry ever seen, rejected ones included; one reopen allowed, and only with new evidence | Anthropic's long-running harness keeps a JSON state file that agents may only change in status fields. Deduplicating against confirmed findings only, and not rejected ones, lets rejected findings come back every round. | anthropic.com/engineering/effective-harnesses-for-long-running-agents; workflow-authoring reference |
| Capture-recapture estimate (jackknife, model Mh) of defects not yet found | Briand et al.: estimates tend to be too low, and none is within ±20% with fewer than 4 inspectors. With 3 inspectors the median error was −27%. Gilb exits at ≤0.2 remaining majors per page. | doi:10.1109/32.852741; Gilb, "Planning to get the most out of inspection" |
| Calibrate by planting known defects and measuring the panel's recall | Planted-error evaluation is the best-supported adversarial method (CriticGPT tamper data). 73% of real faults are coupled to mutants. Qodo's benchmark injected 580 issues. | CriticGPT (OpenAI 2024); Just et al. FSE 2014; qodo.ai benchmark |
| Dispute test: cold agents see only the output files | This puts the user's acceptance criterion ("a fresh agent cannot dispute it") into practice as a test. A second review helps only in a fresh session: F1 28.6% vs 21.7% for repeating in the same session (preprint). | arxiv 2603.16244; Claude Code /code-review design |
| Hard agent cap, with a reserve for the dispute test and the report | Anthropic lists over-spawning and "continuing after sufficient results" as failure modes, and multi-agent setups cost about 15× the tokens. Using 4 reviewers was no better than 2 for detection. | anthropic.com/engineering/multi-agent-research-system; Porter et al. TSE 1997 |
| The verdict is computed from gates in code, never judged by an agent | The self-verdict gate degraded to accept-all (preprint). Gilb: exit on a measured residual, not on a vote. | arxiv 2607.25152; Gilb |

## Thresholds that are judgement calls

These are heuristics, not measured values. Change them if your own calibration runs say otherwise.

- A calibration recall below 0.6 caps the verdict at CONDITIONAL.
- An estimated remaining count of 1 or more caps the verdict at CONDITIONAL.
- Each finding gets one reopen, and each fix gets two attempts.
- Tier sizes come from the evidence that 2–4 independent reviewers capture most of the value.

## Contested or weak evidence

- Votta's meeting gain conflicts with Porter's.
- PBR's advantage did not replicate.
- "Steelman then attack" has no controlled evaluation.
- Cross-model verification may find different errors (Jaccard 41%), but that comes from a single-author preprint.
- Most LLM-review numbers come from 2026 preprints or vendor reports, and are mostly abstracts.
