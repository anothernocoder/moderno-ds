export const meta = {
  name: 'dispatch-epic',
  description: 'AFK dispatch of one epic: frontier -> implement -> review -> fix, stacked PRs, human merges',
  whenToUse: 'Working the absorption tickets (spec #69) unattended. args: {epic: <issue number>, concurrency?: 3, maxRounds?: 12, model?: "opus"|"sonnet" for implement/review/fix agents}',
  phases: [
    { title: 'Frontier', detail: 'one cheap agent computes the dispatchable tickets from gh', model: 'sonnet' },
    { title: 'Implement', detail: 'one fresh agent per ticket, own worktree, stacked base when the blocker is only reviewed' },
    { title: 'Review', detail: 'one fresh reviewer per PR; posts a Review: PASS|CHANGES comment' },
    { title: 'Fix', detail: 'one more fresh agent per CHANGES verdict, then one re-review' },
    { title: 'Cleanup', detail: 'prune worktrees whose branch is pushed and clean', model: 'sonnet' },
  ],
}

// ---- args & guards -------------------------------------------------------
const EPIC = args && args.epic
if (!EPIC) throw new Error('args.epic is required, e.g. {epic: 71}')
const CONCURRENCY = (args && args.concurrency) || 3
const MAX_ROUNDS = (args && args.maxRounds) || 12
// Implement/review/fix inherit the session model unless args.model says otherwise.
const WORK = args && args.model ? { model: args.model } : {}
const REPO = 'anothernocoder/moderno-ds'
const DOC = 'docs/agents/ticket-workflow.md'

// ---- write-slot semaphore: bounds implement/fix agents, not reviewers -------
let active = 0
const waiters = []
const acquire = () => (active < CONCURRENCY ? (active++, Promise.resolve()) : new Promise((r) => waiters.push(r)))
const release = () => { const next = waiters.shift(); if (next) next(); else active-- }
const withSlot = async (fn) => { await acquire(); try { return await fn() } finally { release() } }

// ---- schemas ---------------------------------------------------------------
const FRONTIER = {
  type: 'object',
  properties: {
    frontier: { type: 'array', items: { type: 'object', properties: {
      number: { type: 'number' }, title: { type: 'string' },
      base: { type: 'string', description: 'main, or the head branch of the newest unmerged blocker PR (stacked)' },
      stackedOn: { type: 'number', description: 'PR number the base branch belongs to, 0 when base is main' },
    }, required: ['number', 'title', 'base', 'stackedOn'] } },
    blocked: { type: 'array', items: { type: 'object', properties: {
      number: { type: 'number' }, waitingOn: { type: 'array', items: { type: 'number' } },
    }, required: ['number', 'waitingOn'] } },
    inFlight: { type: 'array', items: { type: 'number' }, description: 'tickets already claimed or with an open PR' },
  },
  required: ['frontier', 'blocked', 'inFlight'],
}
const IMPLEMENTED = { type: 'object', properties: {
  pr: { type: 'number', description: '0 when no PR could be opened' }, ci: { type: 'string', enum: ['green', 'red', 'pending', 'none'] },
  unticked: { type: 'array', items: { type: 'string' } }, note: { type: 'string' },
}, required: ['pr', 'ci', 'unticked'] }
const REVIEWED = { type: 'object', properties: {
  pr: { type: 'number' }, verdict: { type: 'string', enum: ['PASS', 'CHANGES', 'SKIPPED'] }, findings: { type: 'number' }, note: { type: 'string' },
}, required: ['pr', 'verdict', 'findings'] }

// ---- prompts (the doc is the source of truth; prompts only point at it) ----
const frontierPrompt = (round) => `Round ${round}. Compute the dispatch frontier for epic #${EPIC} of ${REPO} following ${DOC}, "Orchestrating tickets AFK".
Use gh only; never guess from memory. Steps:
1. List the epic's open sub-issues labelled ready-for-agent (GraphQL subIssues on issue #${EPIC}, or the "Epic: #${EPIC}" line in bodies).
2. For each, parse the "Blocked by" section. A blocker is settled when its issue is closed, OR its PR (the open PR whose body contains "Closes #<blocker>") has a comment starting "Review: PASS" and green checks. Unsettled otherwise.
3. Exclude tickets that have a "Working on this" comment or an open PR already (report them as inFlight).
4. A ticket is in the frontier when every blocker is settled. base = "main" if all blockers are closed; otherwise the head branch of the newest unmerged blocker PR, and stackedOn = that PR number.
Return the structured result only.`

const implementPrompt = (t) => `Implement issue #${t.number} of ${REPO} ("${t.title}") following ${DOC}, "Working a ticket".
Base branch: ${t.base}${t.stackedOn ? ` (stacked on PR #${t.stackedOn}; open your PR with --base ${t.base} and say "Stacked on #${t.stackedOn}" in the body)` : ''}.
You are already inside a dedicated git worktree; do not create or remove worktrees. Run pnpm install --offline first.
When done, return the structured result: pr (0 if none), ci, unticked criteria, a one-line note.`

const reviewPrompt = (pr, t) => `Review PR #${pr} of ${REPO} (ticket #${t.number}) following ${DOC}, "Reviewing a PR".
Judge only; never edit the branch. Post the single "Review: PASS" or "Review: CHANGES" comment as the doc says, then return the structured result.`

const fixPrompt = (pr, t) => `Address the "Review: CHANGES" comment on PR #${pr} of ${REPO} (ticket #${t.number}) following ${DOC}, "Reviewing a PR", last paragraph.
Check out the PR's branch in this worktree (gh pr checkout ${pr}), treat every finding as an acceptance criterion, rebase on the PR's base, push. Return the structured result.`

// ---- the loop --------------------------------------------------------------
const ledger = [] // {ticket, pr, verdict, ci, stackedOn}
const seenBlocked = new Map()
let round = 0

while (round < MAX_ROUNDS) {
  round++
  const f = await agent(frontierPrompt(round), { phase: 'Frontier', label: `frontier r${round}`, model: 'sonnet', effort: 'low', schema: FRONTIER })
  if (!f) { log(`round ${round}: frontier agent failed; stopping`); break }
  f.blocked.forEach((b) => seenBlocked.set(b.number, b.waitingOn))
  log(`round ${round}: ${f.frontier.length} dispatchable, ${f.blocked.length} blocked, ${f.inFlight.length} in flight`)
  if (f.frontier.length === 0) break

  const results = await pipeline(
    f.frontier,
    (t) => withSlot(() => agent(implementPrompt(t), { ...WORK, phase: 'Implement', label: `#${t.number} ${t.title}`, isolation: 'worktree', schema: IMPLEMENTED })),
    async (impl, t) => {
      if (!impl || !impl.pr) return { ticket: t.number, pr: 0, verdict: 'NO-PR', ci: impl ? impl.ci : 'none', stackedOn: t.stackedOn, note: impl && impl.note }
      if (impl.ci === 'red') return { ticket: t.number, pr: impl.pr, verdict: 'CI-RED', ci: 'red', stackedOn: t.stackedOn, note: impl.note }
      const r1 = await agent(reviewPrompt(impl.pr, t), { ...WORK, phase: 'Review', label: `review #${impl.pr}`, schema: REVIEWED })
      if (!r1 || r1.verdict !== 'CHANGES') return { ticket: t.number, pr: impl.pr, verdict: r1 ? r1.verdict : 'REVIEW-FAILED', ci: impl.ci, stackedOn: t.stackedOn, findings: r1 && r1.findings }
      const fix = await withSlot(() => agent(fixPrompt(impl.pr, t), { ...WORK, phase: 'Fix', label: `fix #${impl.pr}`, isolation: 'worktree', schema: IMPLEMENTED }))
      if (!fix || fix.ci === 'red') return { ticket: t.number, pr: impl.pr, verdict: 'CHANGES', ci: fix ? fix.ci : 'none', stackedOn: t.stackedOn, findings: r1.findings }
      const r2 = await agent(reviewPrompt(impl.pr, t), { ...WORK, phase: 'Review', label: `re-review #${impl.pr}`, schema: REVIEWED })
      // Second CHANGES waits for the human (doc: two rounds per PR).
      return { ticket: t.number, pr: impl.pr, verdict: r2 ? r2.verdict : 'REVIEW-FAILED', ci: fix.ci, stackedOn: t.stackedOn, findings: r2 && r2.findings }
    },
  )
  results.filter(Boolean).forEach((r) => ledger.push(r))
  const passes = results.filter(Boolean).filter((r) => r.verdict === 'PASS').length
  log(`round ${round}: ${passes} PASS of ${results.length}; a PASS settles blockers, recomputing`)
  if (passes === 0) { log('no PASS this round: nothing new can unblock; stopping'); break }
}

phase('Cleanup')
await agent(`In ${REPO}'s main checkout run: git fetch --prune; git worktree prune; then for every worktree other than the main one whose branch exists on origin and whose tree is clean, git worktree remove it. Never touch a dirty worktree or one whose branch is not on origin. Return one line: removed N, kept M (list kept paths with reason).`, { phase: 'Cleanup', label: 'prune worktrees', model: 'sonnet', effort: 'low' })

// ---- report: PRs in merge order (stacks bottom-up), then what is still blocked
const byPr = new Map(ledger.filter((r) => r.pr).map((r) => [r.pr, r]))
const depth = (r) => (r.stackedOn && byPr.has(r.stackedOn) ? 1 + depth(byPr.get(r.stackedOn)) : 0)
const mergeOrder = [...byPr.values()].sort((a, b) => depth(a) - depth(b) || a.pr - b.pr)
return {
  epic: EPIC,
  rounds: round,
  mergeOrder: mergeOrder.map((r) => ({ pr: r.pr, ticket: r.ticket, verdict: r.verdict, ci: r.ci, stackedOn: r.stackedOn || null })),
  needsHuman: ledger.filter((r) => r.verdict !== 'PASS'),
  stillBlocked: [...seenBlocked.entries()].map(([number, waitingOn]) => ({ number, waitingOn })),
}
