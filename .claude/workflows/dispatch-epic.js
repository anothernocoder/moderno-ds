export const meta = {
  name: 'dispatch-epic',
  description: 'AFK dispatch of one epic: tickets in order on one epic branch, one draft PR, human merges',
  whenToUse: 'Working an epic unattended. args: {epic: <issue number>, model?: "opus"|"sonnet" for implement/review/fix agents}',
  phases: [
    { title: 'Setup', detail: 'epic branch from main and the draft PR that gives every landing CI' },
    { title: 'Order', detail: 'one cheap agent orders the tickets by their Blocked-by chains', model: 'sonnet' },
    { title: 'Implement', detail: 'one fresh agent per ticket, in order, one commit on the epic branch' },
    { title: 'Review', detail: 'one fresh reviewer per landing; posts Review: PASS|CHANGES on the issue' },
    { title: 'Fix', detail: 'one more fresh agent per CHANGES verdict, then one re-review' },
    { title: 'Finalize', detail: 'merge main once more, mark the PR ready, report what did not land' },
  ],
}

// ---- args & guards -------------------------------------------------------
const EPIC = args && args.epic
if (!EPIC) throw new Error('args.epic is required, e.g. {epic: 218}')
// Implement/review/fix inherit the session model unless args.model says otherwise.
const WORK = args && args.model ? { model: args.model } : {}
const REPO = 'anothernocoder/moderno-ds'
const DOC = 'docs/agents/ticket-workflow.md'

// No concurrency, by design: every ticket touches the shared files
// (components.css, registry.json, the docs nav, the parity matrix), and two
// agents on two branches meet in a rebase nobody asked for. One agent at a
// time on one branch means a conflict can only happen against origin/main,
// once, at the start of a ticket. Worktrees go with it: the checkout this
// workflow runs in sits on the epic branch from Setup to Finalize.

// ---- schemas ---------------------------------------------------------------
const SETUP = { type: 'object', properties: {
  branch: { type: 'string' }, pr: { type: 'number', description: '0 when nothing could be set up' },
  created: { type: 'boolean', description: 'false when the branch and PR already existed (resume)' }, note: { type: 'string' },
}, required: ['branch', 'pr', 'created'] }
const ORDER = { type: 'object', properties: {
  tickets: { type: 'array', items: { type: 'object', properties: {
    number: { type: 'number' }, title: { type: 'string' },
    blockedBy: { type: 'array', items: { type: 'number' }, description: 'every issue or PR number under Blocked by' },
    settled: { type: 'boolean', description: 'true when every blocker outside this epic is closed or merged now' },
  }, required: ['number', 'title', 'blockedBy', 'settled'] } },
}, required: ['tickets'] }
const LANDED = { type: 'object', properties: {
  landed: { type: 'boolean', description: 'true only when the commit is pushed to the epic branch' },
  sha: { type: 'string' }, ci: { type: 'string', enum: ['green', 'red', 'pending', 'none'] },
  unticked: { type: 'array', items: { type: 'string' } }, note: { type: 'string' },
}, required: ['landed', 'sha', 'unticked'] }
const REVIEWED = { type: 'object', properties: {
  verdict: { type: 'string', enum: ['PASS', 'CHANGES', 'SKIPPED'] }, findings: { type: 'number' }, note: { type: 'string' },
}, required: ['verdict', 'findings'] }
const FINAL = { type: 'object', properties: {
  pr: { type: 'number' }, ready: { type: 'boolean' }, conflicts: { type: 'boolean' },
  ci: { type: 'string', enum: ['green', 'red', 'pending', 'none'] }, note: { type: 'string' },
}, required: ['pr', 'ready', 'conflicts'] }

// ---- prompts (the doc is the source of truth; prompts only point at it) ----
const setupPrompt = () => `Set up epic #${EPIC} of ${REPO} following ${DOC}, "Orchestrating an epic AFK", step Setup.
Idempotent: if the epic branch and its draft PR already exist, check the branch out in this checkout, pull, and return them with created=false.
Otherwise require a clean tree (return pr=0 with a note if it is dirty), create the branch from origin/main, push it, open the draft PR against main, comment its link on the epic.
Return the structured result.`

const orderPrompt = () => `Order the tickets of epic #${EPIC} of ${REPO} following ${DOC}, "Orchestrating an epic AFK", step Order.
Use gh only; never guess from memory. Return every open ready-for-agent sub-issue of the epic in topological order of its Blocked-by chain (ties by ascending number), with blockedBy listing every number under Blocked by and settled=true only when each blocker outside the epic is closed (issue) or merged (PR) right now.
Return the structured result only.`

const implementPrompt = (t, branch) => `Implement issue #${t.number} of ${REPO} ("${t.title}") following ${DOC}, "Working a ticket", on the epic branch ${branch} in this checkout.
Idempotent: if the issue is already closed with a landing comment, return landed=true with that sha and do nothing else.
Push only when every acceptance criterion is delivered; otherwise leave the branch at its pushed tip and return landed=false with what is missing.
Return the structured result: landed, sha, ci (the epic PR's checks if visible), unticked criteria, a one-line note.`

const reviewPrompt = (t, branch, round) => `Review the landing of issue #${t.number} of ${REPO} ("${t.title}") on the epic branch ${branch} following ${DOC}, "Reviewing a landing"${round === 2 ? ' (second round: judge the fix commit against the findings of your predecessor\'s comment as well as the criteria)' : ''}.
Judge only; never edit the branch. Post the single "Review: PASS" or "Review: CHANGES" comment on the issue as the doc says — a PASS closes the issue with the landing note — then return the structured result.`

const fixPrompt = (t, branch) => `Address the "Review: CHANGES" comment on issue #${t.number} of ${REPO} following ${DOC}, "Reviewing a landing", last paragraph, on the epic branch ${branch} in this checkout.
Treat every finding as an acceptance criterion, land one fix commit, push. Return the structured result.`

const finalizePrompt = (branch, pr, ledger) => `Finalize epic #${EPIC} of ${REPO} following ${DOC}, "Orchestrating an epic AFK", step Finalize.
Epic branch ${branch}, draft PR #${pr}. Outcome per ticket so far: ${JSON.stringify(ledger)}.
Merge origin/main once more (resolve conflicts keeping both sides, rerun the checks), push, rewrite the PR body from the ledger (landed with shas, then everything else with why), mark the PR ready for review. Never merge it.
Return the structured result.`

// ---- the run ---------------------------------------------------------------
phase('Setup')
const setup = await agent(setupPrompt(), { ...WORK, phase: 'Setup', label: `epic #${EPIC}: branch + draft PR`, schema: SETUP })
if (!setup || !setup.pr) throw new Error(`setup failed: ${setup ? setup.note : 'agent died'}`)
const branch = setup.branch
log(`${branch} → draft PR #${setup.pr}${setup.created ? '' : ' (already existed; resuming on it)'}`)

phase('Order')
const order = await agent(orderPrompt(), { phase: 'Order', label: 'order tickets', model: 'sonnet', effort: 'low', schema: ORDER })
if (!order) throw new Error('ordering agent died')
const inEpic = new Set(order.tickets.map((t) => t.number))
log(`${order.tickets.length} tickets in order: ${order.tickets.map((t) => `#${t.number}`).join(' ')}`)

// A ticket lands when its commit is pushed; it is *settled* — usable as a
// base by its dependants — only on Review: PASS, which is what closes it.
const settled = new Set()
const ledger = [] // {ticket, outcome, sha?, findings?, waitingOn?, note?}
for (const t of order.tickets) {
  const waitingOn = t.blockedBy.filter((b) => inEpic.has(b) && !settled.has(b))
  if (!t.settled || waitingOn.length) {
    ledger.push({ ticket: t.number, outcome: 'SKIPPED', waitingOn: t.settled ? waitingOn : t.blockedBy })
    log(`#${t.number} skipped: blocked by ${(t.settled ? waitingOn : t.blockedBy).map((n) => `#${n}`).join(', ')}`)
    continue
  }

  const impl = await agent(implementPrompt(t, branch), { ...WORK, phase: 'Implement', label: `#${t.number} ${t.title}`, schema: LANDED })
  if (!impl || !impl.landed) {
    ledger.push({ ticket: t.number, outcome: 'NOT-LANDED', note: impl ? `${impl.note} unticked: ${impl.unticked.join('; ')}` : 'agent died' })
    log(`#${t.number} did not land; its dependants will be skipped`)
    continue
  }

  let review = await agent(reviewPrompt(t, branch, 1), { ...WORK, phase: 'Review', label: `review #${t.number}`, schema: REVIEWED })
  let sha = impl.sha
  if (review && review.verdict === 'CHANGES') {
    const fix = await agent(fixPrompt(t, branch), { ...WORK, phase: 'Fix', label: `fix #${t.number}`, schema: LANDED })
    if (fix && fix.landed) {
      sha = fix.sha
      review = await agent(reviewPrompt(t, branch, 2), { ...WORK, phase: 'Review', label: `re-review #${t.number}`, schema: REVIEWED })
    }
  }
  // Second CHANGES waits for the human (doc: two review rounds per landing).
  // The commits stay on the branch either way — history is not rewritten —
  // so the PR body has to say which landings are unreviewed-clean.
  const outcome = review ? review.verdict : 'REVIEW-FAILED'
  if (outcome === 'PASS') settled.add(t.number)
  ledger.push({ ticket: t.number, outcome, sha, findings: review && review.findings, note: review && review.note })
  log(`#${t.number}: ${outcome} at ${sha.slice(0, 7)}`)
}

phase('Finalize')
const final = await agent(finalizePrompt(branch, setup.pr, ledger), { ...WORK, phase: 'Finalize', label: `PR #${setup.pr} ready`, schema: FINAL })

return {
  epic: EPIC,
  branch,
  pr: setup.pr,
  ready: !!(final && final.ready),
  conflictsResolved: !!(final && final.conflicts),
  settled: [...settled],
  needsHuman: ledger.filter((r) => r.outcome !== 'PASS'),
  ledger,
}
