export const meta = {
  name: 'stress-test',
  description: 'Stress-test an artifact: scope, independent discovery, adversarial verify, single-writer fix, delta regression, cold dispute test, canary calibration. Hard agent cap.',
  whenToUse: 'Run by the stress-testing skill with args {artifact, out, goal?, sources?, tier?, fix?, maxAgents?, skillDir}',
  phases: [
    { title: 'Scope' },
    { title: 'Discover' },
    { title: 'Verify' },
    { title: 'Fix' },
    { title: 'Dispute' },
    { title: 'Calibrate' },
    { title: 'Report' },
  ],
}

// ---------------------------------------------------------------- config
const A = args || {}
if (!A.artifact || !A.out || !A.skillDir) throw new Error('args.artifact, args.out and args.skillDir are required')
const ARTS = [].concat(A.artifact)
const OUT = A.out.replace(/\/$/, '')
const FIX = A.fix || 'copy'                       // 'copy' | 'inplace' | 'none'
const TIERS = {
  //          finders  claimChunks votes cycles disputers disputePasses calibrate maxAgents
  quick:    { lenses: 3, claimChunks: 1, votes: 1, cycles: 1, disputers: 2, disputePasses: 1, calibrate: false, maxAgents: 24 },
  standard: { lenses: 4, claimChunks: 2, votes: 3, cycles: 2, disputers: 3, disputePasses: 2, calibrate: true,  maxAgents: 45 },
  max:      { lenses: 6, claimChunks: 4, votes: 3, cycles: 3, disputers: 3, disputePasses: 2, calibrate: true,  maxAgents: 90 },
}
const T = TIERS[A.tier || 'standard']
if (!T) throw new Error(`unknown tier ${A.tier}`)
const MAX_AGENTS = A.maxAgents || T.maxAgents
const RESERVE = T.disputePasses + 1                // always kept for the report writers (one draft per dispute pass + final)
const LATE_RESERVE = T.disputers + 1 + T.votes + (FIX === 'none' ? 0 : 3)  // kept for the dispute test: disputers + dedup + one verify batch + fix/regress/delta
const FIX_RESERVE = FIX === 'none' ? 0 : 3         // kept for the first fix cycle: fix + regress + delta
let late = false                                   // set when the dispute test begins
let fixStarted = false                             // set when the first fix cycle begins
const VERIFY_BATCH = 4                             // findings per verifier agent
const TOKEN_RESERVE = 60000                        // stop spawning when the user's +Nk budget gets this low
const LENSES_FILE = `${A.skillDir}/references/lenses.md`
const base = p => p.split('/').pop()
const TARGETS = FIX === 'copy' ? ARTS.map(p => `${OUT}/fixed/${base(p)}`) : ARTS
let fixedOnce = false
const current = () => (FIX === 'copy' && fixedOnce ? TARGETS : ARTS)

// ---------------------------------------------------------------- agent budget (hard, enforced in code)
// Smallest run that still does every step once: scope, finders, claims, dedup, one verify batch, fix, regress+delta.
const MIN_AGENTS = 1 + T.lenses + T.claimChunks + 1 + T.votes + FIX_RESERVE + LATE_RESERVE + RESERVE
if (MAX_AGENTS < MIN_AGENTS) throw new Error(`maxAgents ${MAX_AGENTS} is below the ${A.tier || 'standard'} tier minimum of ${MIN_AGENTS}; raise it or pick a smaller tier`)
let spawned = 0, reservedUsed = 0
const dropped = []                                 // every piece of work skipped for budget, reported verbatim
function canSpawn(n, reserved) {
  if (reserved) return spawned + n <= MAX_AGENTS
  const held = (RESERVE - reservedUsed) + (late ? 0 : LATE_RESERVE) + (fixStarted ? 0 : FIX_RESERVE)
  if (spawned + n > MAX_AGENTS - held) return false
  if (budget.total && budget.remaining() < TOKEN_RESERVE) return false
  return true
}
async function run(prompt, opts, reserved) {
  if (!canSpawn(1, reserved)) { dropped.push(opts.label); log(`budget: skipped ${opts.label}`); return null }
  spawned++
  if (reserved) reservedUsed++
  return agent(prompt, opts)
}

// ---------------------------------------------------------------- schemas
const S = (properties, required) => ({ type: 'object', properties, required: required || Object.keys(properties) })
const str = { type: 'string' }
const strs = { type: 'array', items: str }
const KIND = { type: 'string', enum: ['DEFECT', 'IMPROVEMENT', 'QUESTION'] }
const SEV = { type: 'string', enum: ['critical', 'major', 'minor'] }
const EVT = { type: 'string', enum: ['execution', 'computation', 'quote', 'source', 'reasoning'] }

const SCOPE_SCHEMA = S({
  artifactType: str, purpose: str, sourcesOfTruth: strs,
  requirements: { type: 'array', items: S({ id: str, text: str, source: str }) },
  claims: { type: 'array', items: S({ id: str, location: str, text: str }) },
  oracles: strs,
  lenses: { type: 'array', items: S({ key: str, focus: str }) },
  outOfScope: strs,
})
const FINDING = S({ title: str, location: str, quote: str, kind: KIND, severity: SEV, evidenceType: EVT, evidence: str, failureScenario: str, requirementId: str })
const FINDINGS_SCHEMA = S({ findings: { type: 'array', items: FINDING } })
const CLAIMS_SCHEMA = S({ results: { type: 'array', items: S({ claimId: str, verdict: { type: 'string', enum: ['HOLDS', 'FAILS', 'UNVERIFIABLE'] }, evidenceType: EVT, evidence: str, severityIfFails: SEV }) } })
const DEDUP_SCHEMA = S({ clusters: { type: 'array', items: S({ members: { type: 'array', items: { type: 'integer' } }, ledgerId: str, newEvidence: { type: 'boolean' }, title: str, location: str, kind: KIND, severity: SEV, evidence: str, failureScenario: str }) } })
const VERDICTS_SCHEMA = S({ verdicts: { type: 'array', items: S({ id: str, upheld: { type: 'boolean' }, kind: KIND, severity: SEV, evidenceType: EVT, evidence: str }) } })
const FIX_SCHEMA = S({ results: { type: 'array', items: S({ id: str, status: { type: 'string', enum: ['FIXED', 'DECISION_NEEDED'] }, change: str, changedLocations: strs, options: strs }) } })
const REGRESS_SCHEMA = S({ results: { type: 'array', items: S({ id: str, fixed: { type: 'boolean' }, evidence: str }) } })
const DISPUTE_SCHEMA = S({ disputes: { type: 'array', items: S({ type: { type: 'string', enum: ['REMAINING_DEFECT', 'WRONG_CONFIRMATION', 'WRONG_REJECTION', 'UNSUPPORTED_REPORT_CLAIM', 'INVENTED_CONTENT'] }, findingId: str, title: str, location: str, quote: str, severity: SEV, evidenceType: EVT, evidence: str, failureScenario: str }) } })
const PLANT_SCHEMA = S({ canaryPaths: strs, planted: { type: 'array', items: S({ location: str, description: str }) } })
const MATCH_SCHEMA = S({ caught: { type: 'array', items: { type: 'integer' } } })

// ---------------------------------------------------------------- shared prompt parts
const COLD = 'You start cold: you know only this prompt and the files it names. Do not assume anything the files do not say.'
const EVIDENCE_RULE = `Evidence ladder, strongest first: execution (you ran it) > computation (you calculated it, show the numbers) > quote (exact text at a location) > source (an external reference you opened) > reasoning. Use the strongest rung the artifact allows. Every finding names its location and quotes the exact text it is about.`
const KIND_RULE = `Kinds: DEFECT = wrong, self-contradictory, unsupported, or fails a requirement/purpose in the contract. IMPROVEMENT = would make it better but nothing is wrong. QUESTION = needs a decision or fact the artifact and its sources cannot supply. Severity (impact if left as is): critical = a stated guarantee/requirement is false or the artifact cannot be used safely; major = fails under realistic use or misleads a reader into a wrong action; minor = everything else.`

// ---------------------------------------------------------------- ledger
const ledger = []          // the single source of truth for every finding ever raised
let nextId = 1
const newId = () => `F-${String(nextId++).padStart(3, '0')}`
const BLOCKER = e => e.kind === 'DEFECT' && (e.severity === 'critical' || e.severity === 'major')
const brief = e => `${e.id} [${e.status}] ${e.kind}/${e.severity} @ ${e.location}: ${e.title}`
const ledgerText = () => ledger.map(brief).join('\n') || '(empty)'
const notes = []           // report corrections from the dispute test
const history = []

// ---------------------------------------------------------------- Scope
phase('Scope')
const scope = await run(
  `${COLD}
Build the review contract for: ${ARTS.join(', ')}.
Stated goal from the user: ${A.goal || '(none given; infer the purpose from the artifact and say so)'}
Sources of truth to check against: ${[].concat(A.sources || []).join(', ') || '(none given; list any the artifact itself references, e.g. requirements docs, code it describes)'}
Lens catalog: ${LENSES_FILE}. Read it.

Return:
- requirements: every requirement, acceptance criterion or promise the artifact must satisfy, from the goal, the sources, and the artifact's own stated requirements. Cite the source of each.
- claims: every checkable statement the artifact makes (facts, numbers, guarantees, behaviours, causal "therefore"s, code behaviour). Exhaustive: a claim missing here is a claim nobody checks. Give each an id C1.. and a location.
- oracles: the mechanical checks available (commands to run, code to execute, arithmetic, files to grep). Say "none" only after looking.
- lenses: exactly ${T.lenses} lenses chosen from the catalog for this artifact type, each with a one-line focus tailored to this artifact. Always include "consistency" and "failure-scenarios".
- outOfScope: what this review will not judge (style, preferences, redesigns the contract does not demand).`,
  { label: 'scope', phase: 'Scope', schema: SCOPE_SCHEMA, effort: 'high' },
)
if (!scope) throw new Error('scope agent failed; nothing to review')
const lenses = scope.lenses.slice(0, T.lenses)
if (scope.lenses.length > T.lenses) log(`scope proposed ${scope.lenses.length} lenses; tier allows ${T.lenses}, kept: ${lenses.map(l => l.key).join(', ')}`)
const CONTRACT = `Purpose: ${scope.purpose}
Requirements:\n${scope.requirements.map(r => `${r.id}: ${r.text} (source: ${r.source})`).join('\n') || '(none)'}
Oracles: ${scope.oracles.join('; ') || 'none'}
Out of scope: ${scope.outOfScope.join('; ') || 'none'}`
log(`contract: ${scope.requirements.length} requirements, ${scope.claims.length} claims, ${lenses.length} lenses`)

// ---------------------------------------------------------------- dedup + verify (used by every round)
async function ingest(raw, label) {
  // raw: [{finder, f}]; returns ledger entries that need verification
  if (!raw.length) return []
  const res = await run(
    `Merge duplicate findings. One cluster = one required fix. Map each cluster to an existing ledger id when it is the same problem as a ledger entry (any status, including REJECTED), else ledgerId "".
Set newEvidence=true only when a finding that matches a REJECTED or VERIFIED entry brings evidence that entry did not have.
Keep kind/severity as the most defensible value among the members; do not invent new findings.
Ledger:\n${ledgerText()}
Findings:\n${raw.map((r, i) => `[${i}] (${r.finder}) ${r.f.kind}/${r.f.severity} @ ${r.f.location}: ${r.f.title} | quote: ${r.f.quote} | evidence (${r.f.evidenceType}): ${r.f.evidence} | scenario: ${r.f.failureScenario}`).join('\n')}`,
    { label: `${label} dedup`, phase: 'Verify', schema: DEDUP_SCHEMA },
  )
  if (!res) { log(`${label}: dedup skipped (budget); ${raw.length} raw findings unprocessed`); dropped.push(`${label}: ${raw.length} raw findings never deduplicated or verified`); return [] }
  const toVerify = []
  for (const c of res.clusters) {
    const finders = [...new Set(c.members.map(i => raw[i] && raw[i].finder).filter(Boolean))]
    const known = c.ledgerId && ledger.find(e => e.id === c.ledgerId)
    if (known) {
      known.finders = [...new Set([...known.finders, ...finders])]
      const reopenable = (known.status === 'REJECTED' || known.status === 'VERIFIED') && c.newEvidence && known.reopens < 1
      if (reopenable) { known.reopens++; known.status = 'PENDING'; known.evidence += ` | new: ${c.evidence}`; known.history.push(`${label}: reopened with new evidence`); toVerify.push(known) }
      continue
    }
    const e = { id: newId(), title: c.title, location: c.location, kind: c.kind, severity: c.severity, evidence: c.evidence, failureScenario: c.failureScenario, finders, round: label, status: 'PENDING', votes: [], fixAttempts: 0, reopens: 0, change: '', options: [], history: [`${label}: raised by ${finders.join(', ')}`] }
    ledger.push(e)
    if (e.kind === 'DEFECT') toVerify.push(e)
    else { e.status = 'NOTED' }
  }
  return toVerify
}

const VERIFY_LENSES = [
  { key: 'evidence', ask: 'Re-derive the evidence yourself from the artifact and sources. Does the quoted text exist and say what the finding claims? Is the claimed fact true?' },
  { key: 'reproduce', ask: 'Make the failure scenario concrete: run it, compute it, or trace it step by step with real values. If an oracle exists, use it; a finding that an available oracle does not confirm is refuted.' },
  { key: 'scope', ask: 'Is this a defect against the contract, or a preference, a redesign request, or something out of scope? Is the severity right by the definitions?' },
]
async function verify(entries, label) {
  const minors = entries.filter(e => !BLOCKER(e))
  minors.forEach(e => { e.status = 'NOTED'; e.history.push(`${label}: minor, recorded without verification`) })
  const blockers = entries.filter(BLOCKER).sort((a, b) => (a.severity === 'critical' ? 0 : 1) - (b.severity === 'critical' ? 0 : 1))
  if (!blockers.length) return []
  const batches = []
  for (let i = 0; i < blockers.length; i += VERIFY_BATCH) batches.push(blockers.slice(i, i + VERIFY_BATCH))
  const vl = VERIFY_LENSES.slice(0, T.votes)
  const needed = batches.length * vl.length
  if (!canSpawn(needed)) log(`${label}: verification needs ${needed} agents, budget has ${MAX_AGENTS - RESERVE - spawned}; overflow stays UNVERIFIED`)
  await parallel(batches.flatMap((b, bi) => vl.map(v => () => run(
    `${COLD}
You are a verifier. Your default is REFUTED: uphold a finding only when you established it yourself. Judge each finding independently.
Lens: ${v.ask}
Artifact: ${current().join(', ')}${fixedOnce ? ` (original: ${ARTS.join(', ')})` : ''}
Contract:\n${CONTRACT}
${KIND_RULE}
${EVIDENCE_RULE}
Findings:\n${b.map(e => `${e.id} ${e.kind}/${e.severity} @ ${e.location}: ${e.title}\n  evidence: ${e.evidence}\n  scenario: ${e.failureScenario}`).join('\n')}
Return one verdict per id, with your own evidence. If you uphold it but the kind or severity is wrong, say the right one.`,
    { label: `${label} verify:${v.key} #${bi + 1}`, phase: 'Verify', schema: VERDICTS_SCHEMA, effort: 'high' },
  ).then(r => { if (r) r.verdicts.forEach(x => { const e = b.find(y => y.id === x.id); if (e) e.votes.push({ lens: v.key, ...x }) }) }))))
  const confirmed = []
  for (const e of blockers) {
    const vs = e.votes.slice(-vl.length)
    if (!vs.length) { e.status = 'UNVERIFIED'; e.history.push(`${label}: no verifier ran (budget)`); continue }
    const up = vs.filter(x => x.upheld)
    if (up.length * 2 > vs.length) {
      const sevs = up.map(x => x.severity), kinds = up.map(x => x.kind)
      const mode = xs => xs.sort((a, b) => xs.filter(v => v === b).length - xs.filter(v => v === a).length)[0]
      e.severity = mode(sevs); e.kind = mode(kinds)
      if (BLOCKER(e)) { e.status = 'CONFIRMED'; confirmed.push(e) } else e.status = 'NOTED'
      e.history.push(`${label}: upheld ${up.length}/${vs.length} -> ${e.kind}/${e.severity}`)
    } else { e.status = 'REJECTED'; e.history.push(`${label}: refuted ${vs.length - up.length}/${vs.length}`) }
  }
  return confirmed
}

// ---------------------------------------------------------------- Discover (round 1: whole artifact, independent finders)
phase('Discover')
const claimChunks = []
const per = Math.max(1, Math.ceil(scope.claims.length / T.claimChunks))
for (let i = 0; i < scope.claims.length; i += per) claimChunks.push(scope.claims.slice(i, i + per))
const claimResults = []
const finderOutputs = await parallel([
  ...lenses.map(l => () => run(
    `${COLD}
You are an independent finder. Lens: ${l.key} — ${l.focus}. The lens catalog entry for "${l.key}" in ${LENSES_FILE} lists what to probe; read it.
Artifact: ${ARTS.join(', ')}
Contract:\n${CONTRACT}
${KIND_RULE}
${EVIDENCE_RULE}
Report every DEFECT you can establish through this lens, plus IMPROVEMENTs and QUESTIONs you meet on the way. Out-of-scope items are not findings.`,
    { label: `find:${l.key}`, phase: 'Discover', schema: FINDINGS_SCHEMA, effort: 'high' },
  ).then(r => (r ? r.findings.map(f => ({ finder: l.key, f })) : []))),
  ...claimChunks.map((chunk, ci) => () => run(
    `${COLD}
Check each claim below against the artifact, its sources and any oracle. Verdict HOLDS (you established it), FAILS (you established it is false or unsupported where support is required), or UNVERIFIABLE (no way to check from here; say what would check it).
Artifact: ${ARTS.join(', ')}
Oracles: ${scope.oracles.join('; ') || 'none'}
${EVIDENCE_RULE}
Claims:\n${chunk.map(c => `${c.id} @ ${c.location}: ${c.text}`).join('\n')}`,
    { label: `claims #${ci + 1}`, phase: 'Discover', schema: CLAIMS_SCHEMA, effort: 'high' },
  ).then(r => {
    if (!r) { chunk.forEach(c => claimResults.push({ claimId: c.id, verdict: 'NOT_CHECKED', evidence: 'skipped: agent budget', evidenceType: 'reasoning' })); return [] }
    claimResults.push(...r.results)
    return r.results.filter(x => x.verdict === 'FAILS').map(x => {
      const c = chunk.find(y => y.id === x.claimId) || { location: '?', text: x.claimId }
      return { finder: 'claims', f: { title: `Claim fails: ${c.text}`, location: c.location, quote: c.text, kind: 'DEFECT', severity: x.severityIfFails, evidenceType: x.evidenceType, evidence: x.evidence, failureScenario: 'A reader relies on this claim.', requirementId: '' } }
    })
  })),
])
const raw1 = finderOutputs.filter(Boolean).flat()
const findersRun = [...new Set([...lenses.map(l => l.key), ...(claimChunks.length ? ['claims'] : [])])]
log(`round 1: ${raw1.length} raw findings from ${findersRun.length} finders`)
await verify(await ingest(raw1, 'R1'), 'R1')

// capture-recapture (jackknife, model Mh) on confirmed blockers from round 1 only
let estimate = null
{
  const k = findersRun.length
  const found = ledger.filter(e => e.round === 'R1' && BLOCKER(e) && ['CONFIRMED'].includes(e.status))
  const S1 = found.length, f1 = found.filter(e => e.finders.length === 1).length
  if (k >= 4 && S1 > 0) {
    const N = S1 + f1 * (k - 1) / k
    estimate = { finders: k, found: S1, foundByOne: f1, estimatedTotal: Math.round(N * 10) / 10, estimatedRemaining: Math.round((N - S1) * 10) / 10 }
  }
  history.push({ step: 'R1', raw: raw1.length, confirmedBlockers: S1, estimate })
}

// ---------------------------------------------------------------- Fix cycles (single writer, then targeted regression on changed regions only)
async function fixCycle(n) {
  const open = ledger.filter(e => e.status === 'CONFIRMED' && BLOCKER(e))
  if (!open.length || FIX === 'none') return false
  fixStarted = true
  const fx = await run(
    `You are the only writer. Fix these confirmed defects in ${current().join(', ')}${FIX === 'copy' && !fixedOnce ? `. First copy the originals to ${TARGETS.join(', ')} and edit only those copies` : ''}.
Contract:\n${CONTRACT}
Defects:\n${open.map(e => `${e.id} ${e.severity} @ ${e.location}: ${e.title}\n  evidence: ${e.evidence}\n  scenario: ${e.failureScenario}`).join('\n')}
Each fix is the smallest change that makes the failure scenario impossible, using only facts present in the artifact, its sources or the contract. When a correct fix needs a value, policy or product decision those do not contain, do not choose one: leave the text, mark DECISION_NEEDED, and list 2-3 concrete options with their consequences. Keep every other part of the artifact byte-identical. Report the changed locations precisely.`,
    { label: `fix #${n}`, phase: 'Fix', schema: FIX_SCHEMA, effort: 'high' },
  )
  if (!fx) return false
  if (FIX === 'copy') fixedOnce = true
  const changed = []
  for (const r of fx.results) {
    const e = ledger.find(x => x.id === r.id); if (!e) continue
    e.fixAttempts++
    if (r.status === 'DECISION_NEEDED') { e.status = 'DECISION_NEEDED'; e.options = r.options; e.history.push(`fix #${n}: needs decision`); continue }
    e.status = 'FIXED'; e.change = r.change; changed.push({ e, locs: r.changedLocations })
  }
  if (!changed.length) return true
  phase('Fix')
  const [reg, delta] = await parallel([
    () => run(
      `${COLD}
Check fixes. The fixer's account is a claim, not evidence: read ${current().join(', ')} yourself (originals: ${ARTS.join(', ')}; diff them) and use any oracle (${scope.oracles.join('; ') || 'none'}).
For each id, fixed=true only if the failure scenario is now impossible.
${changed.map(c => `${c.e.id} @ ${c.e.location}: ${c.e.title}\n  scenario: ${c.e.failureScenario}\n  fixer says: ${c.e.change}`).join('\n')}`,
      { label: `regress #${n}`, phase: 'Fix', schema: REGRESS_SCHEMA, effort: 'high' },
    ),
    () => run(
      `${COLD}
Review only what changed: diff ${current().join(', ')} against ${ARTS.join(', ')}. Changed locations: ${changed.flatMap(c => c.locs).join('; ')}.
Find defects the changes introduced: contradictions with untouched text, broken cross-references, facts or values the change asserts without support in the artifact/sources/contract (INVENTED content), lost information. Do not review unchanged text on its own merits.
Contract:\n${CONTRACT}
${KIND_RULE}
${EVIDENCE_RULE}`,
      { label: `delta #${n}`, phase: 'Fix', schema: FINDINGS_SCHEMA, effort: 'high' },
    ),
  ])
  if (reg) for (const r of reg.results) {
    const c = changed.find(x => x.e.id === r.id); if (!c) continue
    if (r.fixed) { c.e.status = 'VERIFIED'; c.e.history.push(`regress #${n}: verified — ${r.evidence}`) }
    else { c.e.status = c.e.fixAttempts >= 2 ? 'UNRESOLVED' : 'CONFIRMED'; c.e.history.push(`regress #${n}: not fixed — ${r.evidence}`) }
  }
  else changed.forEach(c => c.e.history.push(`regress #${n}: not run (budget); stays FIXED-unverified`))
  const newConfirmed = delta ? await verify(await ingest(delta.findings.map(f => ({ finder: 'delta', f })), `D${n}`), `D${n}`) : []
  history.push({ step: `fix #${n}`, fixed: changed.length, newBlockers: newConfirmed.length })
  return true
}
let cycle = 0
while (cycle < T.cycles && ledger.some(e => e.status === 'CONFIRMED' && BLOCKER(e)) && FIX !== 'none') {
  cycle++
  if (!(await fixCycle(cycle))) break
}

// ---------------------------------------------------------------- verdict (computed, never judged)
let calibration = null
const disputeLog = []
function verdict() {
  const blockers = ledger.filter(BLOCKER)
  const openStatuses = FIX === 'none' ? ['CONFIRMED', 'FIXED', 'UNRESOLVED', 'VERIFIED', 'DECISION_NEEDED'] : ['CONFIRMED', 'FIXED', 'UNRESOLVED', 'DECISION_NEEDED']
  const open = blockers.filter(e => openStatuses.includes(e.status))
  const unverified = blockers.filter(e => e.status === 'UNVERIFIED' || e.status === 'PENDING')
  const decisions = blockers.filter(e => e.status === 'DECISION_NEEDED')
  const unverifiableClaims = [...new Map(claimResults.filter(c => c.verdict === 'UNVERIFIABLE' || c.verdict === 'NOT_CHECKED').map(c => [c.claimId, c])).values()]
  const conditions = []
  if (decisions.length) conditions.push(`${decisions.length} open blocker(s) remain until a decision is made: ${decisions.map(e => e.id).join(', ')}`)
  const unchecked = blockers.filter(e => e.status === 'FIXED')
  if (unchecked.length) conditions.push(`${unchecked.length} fix(es) never independently checked: ${unchecked.map(e => e.id).join(', ')}`)
  if (unverified.length) conditions.push(`${unverified.length} blocker candidate(s) never verified: ${unverified.map(e => e.id).join(', ')}`)
  if (unverifiableClaims.length) conditions.push(`${unverifiableClaims.length} claim(s) unverifiable or not checked: ${unverifiableClaims.map(c => c.claimId).join(', ')}`)
  if (estimate && estimate.estimatedRemaining >= 1) conditions.push(`capture-recapture estimates ~${estimate.estimatedRemaining} undiscovered blocker(s)`)
  if (calibration && calibration.recall < 0.6) conditions.push(`panel caught only ${calibration.caught}/${calibration.planted} planted defects`)
  if (dropped.length) conditions.push(`${dropped.length} step(s) skipped for agent budget`)
  const status = open.length ? 'FAIL' : conditions.length ? 'CONDITIONAL' : 'PASS'
  return { status, openBlockers: open.map(e => `${e.id} ${e.status}`), conditions }
}
const snapshot = () => JSON.stringify({
  verdict: verdict(), artifact: ARTS, output: current(), fixMode: FIX, tier: A.tier || 'standard',
  agents: { spawned, cap: MAX_AGENTS, dropped }, contract: scope, claimResults, estimate, calibration, disputes: disputeLog, reportCorrections: notes, history, ledger,
}, null, 1)

async function writeReport(label) {
  return run(
    `Write two files. Do not add findings, verdicts or opinions of your own; render the data.
1. ${OUT}/ledger.json: exactly this JSON, unmodified:
${snapshot()}
2. ${OUT}/REPORT.md, rendered from that JSON, in this order:
   - Verdict line: status, and each condition verbatim. One sentence on what the status means: PASS = no open blocker and every gate clean; CONDITIONAL = no open blocker but the listed conditions hold; FAIL = critical/major defects remain in the delivered artifact (unfixed, unchecked, or waiting on a decision).
   - Blockers table: id, severity, location, title, status, evidence type, evidence (short), what changed. Every CONFIRMED/FIXED/VERIFIED/UNRESOLVED/DECISION_NEEDED blocker.
   - Decisions needed: each with its options. These defects are still present in the delivered artifact; say so.
   - Rejected findings: id, title, why refuted (from votes). A reader must see what was considered and dismissed.
   - Claims coverage: count by verdict; list every FAILS, UNVERIFIABLE and NOT_CHECKED claim with what would check it.
   - Noted (not gating): improvements, questions, minor defects, one line each.
   - Method and limits: tier, agents spawned/cap, steps skipped for budget (verbatim), finders run, verification votes, capture-recapture estimate (a lower-biased estimate, roughly ±30%), calibration result or "not measured", dispute passes and outcomes, report corrections.
Write for a reader with no other context: every statement in the report must be traceable to an entry in ledger.json.`,
    { label, phase: 'Report', effort: 'low' }, true,
  )
}

// ---------------------------------------------------------------- Dispute test: cold agents see only the outputs
const DISPUTE_LENSES = [
  'the artifact as it now stands: find any remaining critical/major defect against the contract',
  'the report: find a confirmed finding that is wrong, a rejected finding that is real, or a report statement ledger.json does not support',
  'coverage and fixes: find a requirement or claim nobody checked, or a fix that asserts a fact/value with no support (invented content)',
]
late = true
for (let pass = 1; pass <= T.disputePasses; pass++) {
  phase('Report')
  await writeReport(`report draft #${pass}`)
  phase('Dispute')
  const lensSet = DISPUTE_LENSES.slice(0, T.disputers)
  if (!canSpawn(lensSet.length)) { dropped.push(`dispute pass ${pass}`); log(`budget: dispute pass ${pass} skipped`); break }
  const outs = await parallel(lensSet.map((d, i) => () => run(
    `${COLD}
A stress-test claims the files below are correct. Dispute them. Focus: ${d}.
Files: ${current().join(', ')} (artifact as delivered), ${ARTS.join(', ')} (original), ${OUT}/REPORT.md, ${OUT}/ledger.json.
Report only disputes you can establish with evidence; critical/major only (minor issues are already listed as known).
${EVIDENCE_RULE}`,
    { label: `dispute ${pass}.${i + 1}`, phase: 'Dispute', schema: DISPUTE_SCHEMA, effort: 'high' },
  )))
  const disputes = outs.filter(Boolean).flatMap(o => o.disputes)
  const reportClaims = disputes.filter(d => d.type === 'UNSUPPORTED_REPORT_CLAIM')
  notes.push(...reportClaims.map(d => `${d.location}: ${d.title} — ${d.evidence}`))
  const flips = disputes.filter(d => d.type === 'WRONG_CONFIRMATION' || d.type === 'WRONG_REJECTION')
  for (const d of flips) {
    const e = ledger.find(x => x.id === d.findingId)
    if (!e || e.reopens >= 1) continue
    e.reopens++
    e.history.push(`dispute ${pass}: ${d.type} — ${d.evidence}`)
    if (d.type === 'WRONG_REJECTION') { e.status = 'PENDING'; e.evidence += ` | dispute: ${d.evidence}`; e.votes = [] }
    else e.pendingOverturn = d.evidence
  }
  // re-verify flipped entries (a WRONG_CONFIRMATION survives only if verifiers still uphold it)
  const recheck = ledger.filter(e => e.status === 'PENDING' || e.pendingOverturn)
  recheck.forEach(e => { if (e.pendingOverturn) { e.evidence += ` | counter-evidence: ${e.pendingOverturn}`; delete e.pendingOverturn; e.status = 'PENDING' } })
  await verify(recheck, `X${pass}`)
  const fresh = disputes.filter(d => d.type === 'REMAINING_DEFECT' || d.type === 'INVENTED_CONTENT')
  const newConfirmed = await verify(await ingest(fresh.map(d => ({ finder: `dispute${pass}`, f: { ...d, kind: 'DEFECT', requirementId: '' } })), `X${pass}`), `X${pass}+`)
  const reopened = ledger.filter(e => e.status === 'CONFIRMED' && BLOCKER(e))
  disputeLog.push({ pass, raised: disputes.length, reportCorrections: reportClaims.length, flipsChecked: recheck.length, newBlockers: newConfirmed.length, openAfter: reopened.length })
  log(`dispute pass ${pass}: ${disputes.length} raised, ${newConfirmed.length} new blockers confirmed`)
  if (!reopened.length && !reportClaims.length) break
  if (reopened.length && FIX !== 'none') { cycle++; await fixCycle(cycle) }
}

// ---------------------------------------------------------------- Calibrate: measured recall of this panel on this artifact
if (T.calibrate && (A.calibrate !== false)) {
  phase('Calibrate')
  if (!canSpawn(lenses.length + 2)) { dropped.push('calibration'); log('budget: calibration skipped') }
  else {
    const plant = await run(
      `Copy ${current().join(', ')} into ${OUT}/calibration/ and plant 5 realistic defects in the copies, spread across these kinds: ${lenses.map(l => l.key).join(', ')}. Each must be as subtle as a real author mistake (a wrong number, a contradiction with another section, a missing failure case, an off-by-one, an unsupported guarantee), not a typo. Return the copy paths and where each defect is. Do not mark them in the files.`,
      { label: 'calibrate:plant', phase: 'Calibrate', schema: PLANT_SCHEMA, effort: 'high' },
    )
    if (plant) {
      const outs = await parallel(lenses.map(l => () => run(
        `${COLD}
You are an independent finder. Lens: ${l.key} — ${l.focus}. See ${LENSES_FILE}.
Artifact: ${plant.canaryPaths.join(', ')}
Contract:\n${CONTRACT}
${KIND_RULE}
${EVIDENCE_RULE}
Report every critical/major DEFECT you can establish.`,
        { label: `calibrate:${l.key}`, phase: 'Calibrate', schema: FINDINGS_SCHEMA, effort: 'high' },
      )))
      const got = outs.filter(Boolean).flatMap(o => o.findings)
      const m = await run(
        `Planted defects:\n${plant.planted.map((p, i) => `[${i}] @ ${p.location}: ${p.description}`).join('\n')}
Reported findings:\n${got.map(f => `@ ${f.location}: ${f.title}`).join('\n') || '(none)'}
Return the indexes of planted defects that some reported finding identifies (same problem, same place).`,
        { label: 'calibrate:match', phase: 'Calibrate', schema: MATCH_SCHEMA, effort: 'low' },
      )
      if (m) {
        const caught = new Set(m.caught.filter(i => i >= 0 && i < plant.planted.length)).size
        calibration = { planted: plant.planted.length, caught, recall: plant.planted.length ? caught / plant.planted.length : 0, missed: plant.planted.filter((_, i) => !m.caught.includes(i)) }
        log(`calibration: caught ${caught}/${plant.planted.length} planted defects`)
      }
    }
  }
}

// ---------------------------------------------------------------- final report
phase('Report')
await writeReport('report final')
const v = verdict()
log(`verdict ${v.status}; agents ${spawned}/${MAX_AGENTS}; skipped ${dropped.length}`)
return { verdict: v, report: `${OUT}/REPORT.md`, ledger: `${OUT}/ledger.json`, output: current(), agents: { spawned, cap: MAX_AGENTS, dropped }, estimate, calibration, disputes: disputeLog }
