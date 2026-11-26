# Lens catalog

A lens is a defect class one finder hunts for. Each finder gets one lens, so finders stay independent and their overlap means something (capture-recapture needs independent finders).

## Default lenses by artifact type

The scope agent picks the tier's number of lenses from the top of each list, and must always include `consistency` and `failure-scenarios`.

| Artifact | Lenses, in priority order |
|---|---|
| Design / architecture doc | consistency, failure-scenarios, claims-evidence, completeness, quality-attributes, security |
| Spec / requirements | consistency, failure-scenarios, precision, completeness, claims-evidence, interfaces |
| Plan / roadmap / proposal | consistency, failure-scenarios, feasibility, completeness, claims-evidence, decision-rationale |
| Code / diff | consistency, failure-scenarios, execution, security, interfaces, claims-evidence |
| Prompt / skill / agent instructions | consistency, failure-scenarios, execution, precision, completeness, claims-evidence |
| Analysis / report / research write-up | consistency, failure-scenarios, claims-evidence, completeness, decision-rationale, precision |

## Lenses

### consistency
Find places where two parts of the artifact cannot both be true. Check the artifact against itself, then against its sources:
- One section's guarantee contradicts another's mechanism.
- The prose and a diagram, table or code block disagree.
- A name, number, unit or default changes between sections.
- A "therefore" whose conclusion does not follow from what came before it.

### claims-evidence
Find claims that are false, or that need support and have none. Recompute every number: units, orders of magnitude, sums and rates. Follow every reference and citation and confirm it says what the artifact says it does. Watch for absolute words with no mechanism behind them: "never", "always", "guarantees", "exactly-once", "no data is lost", "secure".

### completeness
Trace every requirement in the contract to the place in the artifact that satisfies it. Each one is met, partly met or missing, and gets a location. Also look for whole sections the artifact's own purpose needs but omits, such as recovery, rollback, migration, limits or ownership. This lens does not ask for features the contract does not ask for.

### failure-scenarios
Assume the artifact was followed exactly and the result failed in production. Work out the most likely ways that happened. Apply these guidewords to each component, step or assumption:
- **no / none:** the dependency is absent, the input is empty, the response is lost.
- **more / less:** load is 10×, the payload is huge, there are zero items, the time budget is exceeded.
- **early / late / out-of-order:** timeouts, retries, reordering, clock skew.
- **twice:** duplicates, replays, double-submit, re-entrancy.
- **partial:** a crash mid-operation, a half-applied change, a partial deploy.
- **wrong:** malformed input, a wrong version, a stale cache, a wrong person or permission.

For each failure, ask what the artifact says happens. "Nothing is said" is a finding only when the failure is realistic and the artifact's purpose covers it.

### precision
Find wording that two competent readers would implement differently. Look for:
- vague terms ("quickly", "large", "appropriate", "as needed", "etc.");
- missing units or bounds;
- passive voice that hides who does something;
- "should" where "must" is meant;
- pronouns with unclear referents;
- lists that end in "and so on".

Report a finding only when the two readings lead to different behaviour.

### execution
Run whatever runs: tests, the code, its examples, commands quoted in docs. Prompts and skills run by giving them to a fresh agent on a realistic task. Compare observed behaviour with stated behaviour. Every result comes from execution. If something cannot be run, give the reason.

### security
Look at:
- trust boundaries and who can reach each entry point;
- authentication, authorization and replay;
- injection: SQL, shell, prompt and path;
- how secrets are handled and rotated;
- timing side channels and data exposure in logs or errors.

Give each finding a concrete attacker and a concrete step.

### interfaces
Check that both sides of every boundary agree. That covers API, schema and file formats, plus versioning, error contracts, nullability, encodings, limits and backward compatibility. Check every caller and producer the artifact names against the contract it states.

### quality-attributes
Write a concrete scenario for each quality the artifact promises, such as latency, throughput, availability, durability, cost or operability: stimulus, environment, expected response, measure. Then check that the design meets it. The check can be arithmetic (Little's law, capacity, storage growth) or a trace through the mechanism. Record the tradeoff points too: the places where improving one quality worsens another.

### feasibility
Check that the plan can actually be carried out:
- dependencies and their order;
- who owns each step;
- whether the time and resource estimates add up;
- steps that depend on things outside the plan's control;
- missing rollback or exit points;
- milestones that cannot be verified.

### decision-rationale
For each significant decision, check that the alternatives were named, the reason fits the stated constraints, and the consequences (including the downsides) are stated. A decision is only a defect when its rationale contradicts the contract or the artifact's own facts. That alternatives exist is not a defect.
