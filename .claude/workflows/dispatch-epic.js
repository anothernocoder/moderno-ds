export const meta = {
  name: 'dispatch-epic',
  description: 'AFK dispatch of one epic: tickets built in parallel worktrees, landed one at a time on one epic branch, one draft PR, human merges',
  whenToUse: 'Working an epic unattended. args: {epic: <issue number>, workers?: tickets in flight (default 3, max 6), basePort?: first docs e2e port (default 4400), model?: "opus"|"sonnet" for implement/land/review/fix agents}',
  phases: [
    { title: 'Setup', detail: 'epic branch from main and the draft PR that gives every landing CI' },
    { title: 'Order', detail: 'one cheap agent orders the tickets by their Blocked-by chains', model: 'sonnet' },
    { title: 'Recheck', detail: 'before skipping a ticket, one cheap agent re-reads its outside blockers live', model: 'sonnet' },
    { title: 'Implement', detail: 'one fresh agent per ticket in its own worktree, on ticket/<N> cut from the epic tip' },
    { title: 'Land', detail: 'one agent at a time cherry-picks a finished ticket onto the epic branch and pushes' },
    { title: 'Review', detail: 'one fresh reviewer per landing; posts Review: PASS|CHANGES on the issue' },
    { title: 'Fix', detail: 'one more fresh agent per CHANGES verdict, landed the same way, then one re-review' },
    { title: 'Finalize', detail: 'merge main once more, mark the PR ready, report what did not land' },
  ],
}

// ---- args & guards -------------------------------------------------------
const EPIC = args && args.epic
if (!EPIC) throw new Error('args.epic is required, e.g. {epic: 218}')
// Implement/land/review/fix inherit the session model unless args.model says otherwise.
const WORK = args && args.model ? { model: args.model } : {}
const WORKERS = Math.max(1, Math.min(6, (args && args.workers) || 3))
const BASE_PORT = (args && args.basePort) || 4400
const REPO = 'anothernocoder/moderno-ds'
const DOC = 'docs/agents/ticket-workflow.md'

// Tickets are built in parallel, each in its own worktree on its own
// ticket/<N> branch, and landed one at a time: the lander is the only agent
// that writes the epic branch, so a conflict with a sibling ticket is met once,
// by one agent, on the current tip. Each ticket in flight owns a slot, and the
// slot owns a port: the docs e2e server reuses whatever answers on its port,
// so two worktrees on one port would test each other's build.

// ---- schemas ---------------------------------------------------------------
const SETUP = { type: 'object', properties: {
  branch: { type: 'string' }, pr: { type: 'number', description: '0 when nothing could be set up' },
  created: { type: 'boolean', description: 'false when the branch and PR already existed (resume)' }, note: { type: 'string' },
}, required: ['branch', 'pr', 'created'] }
const ORDER = { type: 'object', properties: {
  tickets: { type: 'array', items: { type: 'object', properties: {
    number: { type: 'number' }, title: { type: 'string' },
    blockedBy: { type: 'array', items: { type: 'number' }, description: 'every issue or PR number under Blocked by' },
    openBlockers: { type: 'array', items: { type: 'number' }, description: 'ONLY the blockers this workflow will not land itself: the subset of blockedBy that is unresolved right now (issue open, or PR unmerged) AND is not one of the tickets you are returning. A blocker that is another ticket in your own list NEVER belongs here, however open it looks right now.' },
  }, required: ['number', 'title', 'blockedBy', 'openBlockers'] } },
}, required: ['tickets'] }
const GATE = { type: 'object', properties: {
  stillOpen: { type: 'array', items: { type: 'number' }, description: 'the subset still unsettled right now; empty means the ticket is clear to run' },
  note: { type: 'string' },
}, required: ['stillOpen'] }
const BUILT = { type: 'object', properties: {
  ready: { type: 'boolean', description: 'true only when the ticket branch is pushed with every criterion delivered, or the ticket already landed' },
  alreadyLanded: { type: 'boolean', description: 'true when the epic branch already holds this ticket\'s commit; sha is then that commit' },
  ticketBranch: { type: 'string' }, sha: { type: 'string' },
  unticked: { type: 'array', items: { type: 'string' } }, note: { type: 'string' },
}, required: ['ready', 'sha', 'unticked'] }
const LANDED = { type: 'object', properties: {
  landed: { type: 'boolean', description: 'true only when the commit is pushed to the epic branch' },
  conflict: { type: 'boolean', description: 'true when the cherry-pick met a conflict that is not mechanical and was aborted' },
  sha: { type: 'string', description: 'the commit as it sits on the epic branch' },
  ci: { type: 'string', enum: ['green', 'red', 'pending', 'none'] }, note: { type: 'string' },
}, required: ['landed', 'sha'] }
const REVIEWED = { type: 'object', properties: {
  verdict: { type: 'string', enum: ['PASS', 'CHANGES', 'SKIPPED'] }, findings: { type: 'number' }, note: { type: 'string' },
}, required: ['verdict', 'findings'] }
const FINAL = { type: 'object', properties: {
  pr: { type: 'number' }, ready: { type: 'boolean' }, conflicts: { type: 'boolean' },
  ci: { type: 'string', enum: ['green', 'red', 'pending', 'none'] }, note: { type: 'string' },
}, required: ['pr', 'ready', 'conflicts'] }

// ---- prompts (the doc is the source of truth; prompts only point at it) ----
const setupPrompt = () => `Set up epic #${EPIC} of ${REPO} following ${DOC}, "Orchestrating an epic AFK", step Setup.
Idempotent: if the epic branch and its draft PR already exist and the PR is still open, check the branch out in this checkout, pull, and return them with created=false.
If the epic's previous PR is already merged or closed, the epic continues on a new branch: the same name with the next free -2, -3… suffix.
Otherwise require a clean tree (return pr=0 with a note if it is dirty), create the branch from origin/main, push it, open the draft PR against main, comment its link on the epic.
Return the structured result.`

const orderPrompt = () => `Order the tickets of epic #${EPIC} of ${REPO} following ${DOC}, "Orchestrating an epic AFK", step Order.
Use gh only; never guess from memory. Return every open ready-for-agent sub-issue of the epic in topological order of its Blocked-by chain (ties by ascending number), with blockedBy listing every number under Blocked by.
You read the repo before a single ticket has run, so every ticket you return is open by definition and its openness proves nothing. Judge only the blockers you are not returning: openBlockers is the subset of blockedBy that is unsettled right now and is not itself one of your tickets. Never put one of your own tickets in another ticket's openBlockers — the workflow lands those and tracks when each settles.
Return the structured result only.`

const gatePrompt = (t, blockers) => `Re-read the blockers of issue #${t.number} of ${REPO} right now with gh: ${blockers.map((n) => `#${n}`).join(', ')}.
The ordering step read them before any ticket of this epic had run, so that read is old. For each number say whether it is settled as ${DOC} defines it — issue closed, or PR merged — at this moment.
Return stillOpen: only the numbers that are neither. Judge nothing else and never touch any branch.`

const implementPrompt = (t, port) => `Implement issue #${t.number} of ${REPO} ("${t.title}") following ${DOC}, "Working a ticket", in this worktree, on ticket/${t.number} cut from origin/${branch} (the epic branch).
This worktree is yours alone; other agents are building sibling tickets in theirs at the same time. Never push to ${branch} and never merge origin/main — the lander does both. Run the docs e2e suite with PORT=${port}.
Idempotent: if ${branch} already holds a commit whose subject ends with (#${t.number}), return ready=true, alreadyLanded=true with that sha and do nothing else. If origin already has ticket/${t.number} with one commit that delivers every criterion, return it as ready without rebuilding.
Push ticket/${t.number} only when every acceptance criterion is delivered; otherwise return ready=false with what is missing.
Return the structured result: ready, ticketBranch, sha, unticked criteria, a one-line note.`

const landPrompt = (t, ticketBranch) => `Land ${ticketBranch} (issue #${t.number} of ${REPO}, "${t.title}") onto the epic branch ${branch} following ${DOC}, "Landing a ticket", in this checkout.
You are the only agent writing ${branch}; siblings may have landed since this ticket was cut. Resolve only mechanical conflicts as the doc defines them; on anything else abort the cherry-pick, leave ${branch} at its pushed tip and return landed=false, conflict=true with the files.
Return the structured result: landed, conflict, sha as it sits on ${branch}, ci, a one-line note.`

const rebasePrompt = (t, ticketBranch, note, port) => `The lander could not put ${ticketBranch} (issue #${t.number} of ${REPO}) on the tip of ${branch}: ${note}
In this worktree, check out ${ticketBranch}, rebase it onto origin/${branch}, resolve the conflicts with the ticket's full context (read the issue), rerun the checks of ${DOC} "Working a ticket" step 4 with PORT=${port}, and force-push ${ticketBranch}. Keep it one commit. Never push to ${branch}.
Return the structured result: ready, ticketBranch, sha, unticked, note.`

const reviewPrompt = (t, sha, round) => `Review the landing of issue #${t.number} of ${REPO} ("${t.title}") — commit ${sha} on the epic branch ${branch} — following ${DOC}, "Reviewing a landing"${round === 2 ? ' (second round: judge the fix commit against the findings of your predecessor\'s comment as well as the criteria)' : ''}.
This worktree is yours alone; fetch and check out ${sha} detached if you need to run anything. Judge only; never commit or push. Idempotent: if the issue already carries a Review verdict for ${sha}, return that verdict without posting again. Post the single "Review: PASS" or "Review: CHANGES" comment on the issue as the doc says — a PASS closes the issue — then return the structured result.`

const fixPrompt = (t, port) => `Address the "Review: CHANGES" comment on issue #${t.number} of ${REPO} following ${DOC}, "Reviewing a landing", last paragraph, in this worktree, on ticket/${t.number}-fix cut from origin/${branch}.
Treat every finding as an acceptance criterion and make one fix(#${t.number}) commit. Run the docs e2e suite with PORT=${port}. Push ticket/${t.number}-fix, never ${branch}. Return the structured result: ready, ticketBranch, sha, unticked, note.`

const finalizePrompt = (pr, ledger) => `Finalize epic #${EPIC} of ${REPO} following ${DOC}, "Orchestrating an epic AFK", step Finalize.
Epic branch ${branch}, draft PR #${pr}. Outcome per ticket: ${JSON.stringify(ledger)}.
Merge origin/main once more (mechanical conflicts as "Landing a ticket" defines them, rerun the checks), push, delete every ticket/<N> and ticket/<N>-fix branch of this epic left on origin, rewrite the PR body from the ledger (landed with shas, then everything else with why), mark the PR ready for review. Never merge it.
Return the structured result.`

// ---- setup ------------------------------------------------------------------
phase('Setup')
const setup = await agent(setupPrompt(), { ...WORK, phase: 'Setup', label: `epic #${EPIC}: branch + draft PR`, schema: SETUP })
if (!setup || !setup.pr) throw new Error(`setup failed: ${setup ? setup.note : 'agent died'}`)
const branch = setup.branch
log(`${branch} → draft PR #${setup.pr}${setup.created ? '' : ' (already existed; resuming on it)'}`)

phase('Order')
const order = await agent(orderPrompt(), { phase: 'Order', label: 'order tickets', model: 'sonnet', effort: 'low', schema: ORDER })
if (!order) throw new Error('ordering agent died')
const inEpic = new Set(order.tickets.map((t) => t.number))
log(`${order.tickets.length} tickets, ${WORKERS} in flight at most: ${order.tickets.map((t) => `#${t.number}`).join(' ')}`)

// ---- landing: one at a time, in the order tickets finish --------------------
let landTail = Promise.resolve()
const serially = (fn) => {
  const run = landTail.then(fn, fn)
  landTail = run.then(() => {}, () => {})
  return run
}

// Land a pushed ticket branch; when the lander meets a conflict it will not
// settle mechanically, the ticket's own context rebases it once and it queues again.
async function land(t, built, port, phaseName) {
  const attempt = () => serially(() => agent(landPrompt(t, built.ticketBranch), { ...WORK, phase: phaseName, label: `land #${t.number}`, schema: LANDED }))
  let landed = await attempt()
  if (landed && !landed.landed && landed.conflict) {
    const rebased = await agent(rebasePrompt(t, built.ticketBranch, landed.note || 'conflict', port), { ...WORK, phase: phaseName, label: `rebase #${t.number}`, isolation: 'worktree', schema: BUILT })
    if (rebased && rebased.ready) landed = await attempt()
  }
  return landed && landed.landed ? landed : null
}

// ---- one ticket, start to verdict ------------------------------------------
async function runTicket(t, slot) {
  const port = BASE_PORT + slot
  // A blocker outside the epic is nobody's to land here, so it is re-read at the
  // moment it would cost the ticket its turn — hours can pass between Order and here.
  let outside = (t.openBlockers || []).filter((b) => !inEpic.has(b))
  if (outside.length) {
    const gate = await agent(gatePrompt(t, outside), { phase: 'Recheck', label: `recheck #${t.number}`, model: 'sonnet', effort: 'low', schema: GATE })
    if (gate) outside = gate.stillOpen.filter((b) => !inEpic.has(b))
    if (outside.length) return { ticket: t.number, outcome: 'SKIPPED', waitingOn: outside }
  }

  const built = await agent(implementPrompt(t, port), { ...WORK, phase: 'Implement', label: `#${t.number} ${t.title}`, isolation: 'worktree', schema: BUILT })
  if (!built || !built.ready) {
    return { ticket: t.number, outcome: 'NOT-LANDED', note: built ? `${built.note} unticked: ${built.unticked.join('; ')}` : 'agent died' }
  }
  let sha = built.sha
  if (!built.alreadyLanded) {
    const landed = await land(t, built, port, 'Land')
    if (!landed) return { ticket: t.number, outcome: 'NOT-LANDED', note: `built on ${built.ticketBranch} but could not be landed` }
    sha = landed.sha
  }

  let review = await agent(reviewPrompt(t, sha, 1), { ...WORK, phase: 'Review', label: `review #${t.number}`, isolation: 'worktree', schema: REVIEWED })
  if (review && review.verdict === 'CHANGES') {
    const fix = await agent(fixPrompt(t, port), { ...WORK, phase: 'Fix', label: `fix #${t.number}`, isolation: 'worktree', schema: BUILT })
    const landed = fix && fix.ready ? await land(t, fix, port, 'Fix') : null
    if (landed) {
      sha = landed.sha
      review = await agent(reviewPrompt(t, sha, 2), { ...WORK, phase: 'Review', label: `re-review #${t.number}`, isolation: 'worktree', schema: REVIEWED })
    }
  }
  // Second CHANGES waits for the human (doc: two review rounds per landing).
  // The commits stay on the branch either way — history is not rewritten.
  return { ticket: t.number, outcome: review ? review.verdict : 'REVIEW-FAILED', sha, findings: review && review.findings, note: review && review.note }
}

// ---- scheduler: start every ticket whose in-epic blockers passed ------------
// A ticket is *settled* — usable as a base by its dependants — only on
// Review: PASS. Anything else ends it, and every ticket waiting on it is skipped.
const settled = new Set()
const ended = new Set()
const ledger = [] // {ticket, outcome, sha?, findings?, waitingOn?, note?}
const freeSlots = Array.from({ length: WORKERS }, (_, i) => i)
const running = new Map() // ticket number -> promise resolving to that number
let pending = order.tickets.slice()

const record = (row) => {
  ledger.push(row)
  ended.add(row.ticket)
  if (row.outcome === 'PASS') settled.add(row.ticket)
  const where = row.sha ? ` at ${row.sha.slice(0, 7)}` : ''
  const why = row.waitingOn ? `: blocked by ${row.waitingOn.map((n) => `#${n}`).join(', ')}` : row.note && row.outcome !== 'PASS' ? `: ${row.note}` : ''
  log(`#${row.ticket}: ${row.outcome}${where}${why}`)
}

const start = (t) => {
  const slot = freeSlots.shift()
  const done = runTicket(t, slot)
    .catch((e) => ({ ticket: t.number, outcome: 'NOT-LANDED', note: `workflow error: ${e && e.message}` }))
    .then((row) => {
      record(row)
      freeSlots.push(slot)
      freeSlots.sort((a, b) => a - b)
      return t.number
    })
  running.set(t.number, done)
}

while (pending.length || running.size) {
  // A ticket whose in-epic blocker ended without passing can never run.
  for (const t of pending) {
    const dead = t.blockedBy.filter((b) => inEpic.has(b) && ended.has(b) && !settled.has(b))
    if (dead.length) record({ ticket: t.number, outcome: 'SKIPPED', waitingOn: dead })
  }
  pending = pending.filter((t) => !ended.has(t.number))

  for (const t of pending) {
    if (!freeSlots.length) break
    if (t.blockedBy.some((b) => inEpic.has(b) && !settled.has(b))) continue
    start(t)
  }
  pending = pending.filter((t) => !running.has(t.number))

  if (!running.size) {
    // Nothing in flight and nothing startable: what is left waits on itself.
    for (const t of pending) record({ ticket: t.number, outcome: 'SKIPPED', waitingOn: t.blockedBy.filter((b) => inEpic.has(b) && !settled.has(b)) })
    break
  }
  running.delete(await Promise.race(running.values()))
}

phase('Finalize')
const byTicket = ledger.slice().sort((a, b) => a.ticket - b.ticket)
const final = await agent(finalizePrompt(setup.pr, byTicket), { ...WORK, phase: 'Finalize', label: `PR #${setup.pr} ready`, schema: FINAL })

return {
  epic: EPIC,
  branch,
  pr: setup.pr,
  ready: !!(final && final.ready),
  conflictsResolved: !!(final && final.conflicts),
  settled: [...settled],
  needsHuman: byTicket.filter((r) => r.outcome !== 'PASS'),
  ledger: byTicket,
}
