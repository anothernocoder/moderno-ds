# Ticket Workflow

How an agent works one `ready-for-agent` ticket to a merged PR, and how an orchestrator hands tickets out AFK. Tickets are **tracer bullets**: each one is sized for a single fresh context window and carries its own spec, epic, blockers and acceptance criteria. One ticket, one agent, one PR.

## Working a ticket

1. **Claim.** `gh issue view <N> --comments`. A blocker is **settled** when its issue is closed, or when its PR carries a `Review: PASS` comment with green CI (then you build on that PR's branch: **stacked**). Start only if every issue under "Blocked by" is settled. Comment "Working on this" so a parallel agent skips it. Done when: the claim comment is posted and you know your base branch: `main`, or the branch of the newest unmerged blocker PR.
2. **Read the domain, then the ticket's parents.** `CONTEXT.md` and the ADRs the ticket names (see `docs/agents/domain.md`); the spec and epic it links. Done when: you can name the glossary term for every noun in the ticket title.
3. **Branch from your fresh base** (`main`, or the stacked blocker branch) in a worktree: `<kind>/<slug>` (`primitive/tabs`, `block/kpi-card`, `screen/cart`, `flow/auth`). Use the worktree the orchestrator handed you; otherwise `git worktree add` your own. Done when: `git log <base>..HEAD` is empty and `pnpm install --offline && pnpm -r build` pass before you change anything.
4. **Deliver every acceptance criterion.** Tick each checkbox in the issue body as it lands (`gh issue edit`). The criteria are the definition of done; a ticket with an unticked box is not done. Done when: every box is ticked and `pnpm typecheck`, `pnpm test`, `pnpm theme:build`, `pnpm docs:parity`, `pnpm agent:check-drift` and the lint over the registry are green locally.
5. **Rebase on your base right before the PR.** Shared files (`components.css`, `registry.json`, the parity matrix, docs navigation, screenshot baselines) collide between parallel tickets; resolve by keeping both sides, then rerun step 4's checks. Done when: the branch is a fast-forward of its base.
6. **Open the PR** with `--base <your base>`: `main`, or the blocker's branch for a stacked PR (GitHub retargets it to `main` when the base PR merges). Title = ticket title. Body: what changed, `Closes #N`, `Stacked on #<PR>` when stacked, and a screenshot of the docs preview at 375 and 1280 for anything visual. Comment the issue with the PR link. If you created the worktree yourself, `git worktree remove` it once the push is confirmed; the branch lives on `origin`. Done when: CI is green or you have posted the failing job's log excerpt on the PR and stopped.
7. **Report one line**: PR number, CI state, anything left unticked and why. A human merges; leave the PR open.

## Reviewing a PR

A review agent is as fresh as an implementing agent: it has read nothing but the PR, the ticket and the domain docs. It judges; it never edits the branch.

1. **Load the PR and its ticket**: `gh pr view <PR> --comments`, `gh pr diff <PR>`, the issue it closes. Done when: you hold the ticket's acceptance criteria and the PR's merge-base with `main`.
2. **Run `/code-review` from the merge-base** along its two axes. *Standards*: CONTRACT.md's golden rule (components themed via variables, varied via props, never edited), `CONTEXT.md` vocabulary, the ADRs the ticket names, the responsive policy (ADR-0005). *Spec*: every acceptance criterion in the ticket, checked against the diff and CI, not against the checkbox. Done when: each criterion has a verdict and each finding has a file, a line and a failure scenario.
3. **Post one comment on the PR** (approving or requesting changes on a PR from the same account is refused by GitHub, so the comment is the verdict). First line `Review: PASS` or `Review: CHANGES`, then findings most severe first, then the criteria you could not verify from the diff (screenshots, container behaviour) flagged for the human. Done when: the comment is posted and its first line matches one of the two verdicts.
4. **Report one line**: PR number, verdict, finding count.

When the verdict is `CHANGES`, a fresh implementing agent takes the same branch: it addresses every finding in the review comment as extra acceptance criteria, then continues from step 5 of "Working a ticket". Two review rounds per PR; after the second `CHANGES`, the PR waits for the human.

## Orchestrating tickets AFK

The orchestrator's only job is dispatch. Reading diffs, code or CI logs pulls the work into its own context and ends in hallucinated status; every token it spends must be about *which ticket*, never *how*.

- **Frontier** = open `ready-for-agent` issues in the current epic, not yet claimed, whose blockers are all settled (closed, or `Review: PASS` + green CI, in which case the ticket is dispatched stacked on that PR's branch). Recompute it from `gh` each round; never from memory. Stacking is what lets a dependency chain finish in one AFK run; the maintainer merges the stack bottom-up.
- **Epics in order** (`#71` → `#72` → `#73` → `#74`, all under `#70`). Epic A is the pipeline the other hundred tickets stand on; finish and merge it before dispatching Epic C or D.
- **Concurrency 3** for agents that write (implement, fix). Not a token limit: a merge-conflict limit on the shared files listed in step 5. Reviewers are read-only and unbounded.
- **One fresh agent per ticket**, in its own worktree, with the implement prompt below and nothing else. The agent returns one line; record it and move on.
- **One fresh agent per green PR** with the review prompt below, once the implementing agent has returned. A `CHANGES` verdict dispatches one more implementing agent on the same branch (at most twice per PR).
- **Round done when** every dispatched PR carries a `Review:` comment. A `PASS` can settle blockers, so recompute the frontier and go again; the run ends when a round dispatches nothing. Then `git worktree prune` and remove worktrees whose branch is on `origin` with a clean tree, list the PRs by verdict in merge order (stacks bottom-up) and the tickets still blocked, and stop. Merging is the maintainer's; it never happens in the loop.
- **Saved workflow**: `.claude/workflows/dispatch-epic.js` implements this loop; launch it from a clean session with `Workflow({name: "dispatch-epic", args: {epic: 71}})`.

Prompts handed to agents:

```
Implement issue #N of anothernocoder/moderno-ds following docs/agents/ticket-workflow.md, "Working a ticket".
Base branch: <main | stacked blocker branch>. Return one line: PR number, CI state, anything left unticked.
```

```
Review PR #P of anothernocoder/moderno-ds following docs/agents/ticket-workflow.md, "Reviewing a PR".
Return one line: PR number, verdict, finding count.
```

```
Address the "Review: CHANGES" comment on PR #P of anothernocoder/moderno-ds following docs/agents/ticket-workflow.md
("Reviewing a PR", last paragraph). Return one line: PR number, CI state, findings left open.
```
