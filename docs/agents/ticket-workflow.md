# Ticket Workflow

How an agent works one `ready-for-agent` ticket to a merged PR, and how an orchestrator hands tickets out AFK. Tickets are **tracer bullets**: each one is sized for a single fresh context window and carries its own spec, epic, blockers and acceptance criteria. One ticket, one agent, one PR.

## Working a ticket

1. **Claim.** `gh issue view <N> --comments`. Start only if every issue under "Blocked by" is closed. Comment "Working on this" so a parallel agent skips it. Done when: the claim comment is posted.
2. **Read the domain, then the ticket's parents.** `CONTEXT.md` and the ADRs the ticket names (see `docs/agents/domain.md`); the spec and epic it links. Done when: you can name the glossary term for every noun in the ticket title.
3. **Branch from fresh `main`** in your own worktree: `<kind>/<slug>` (`primitive/tabs`, `block/kpi-card`, `screen/cart`, `flow/auth`). Done when: `git log main..HEAD` is empty and `pnpm -r build` passes before you change anything.
4. **Deliver every acceptance criterion.** Tick each checkbox in the issue body as it lands (`gh issue edit`). The criteria are the definition of done; a ticket with an unticked box is not done. Done when: every box is ticked and `pnpm typecheck`, `pnpm test`, `pnpm theme:build`, `pnpm docs:parity`, `pnpm agent:check-drift` and the lint over the registry are green locally.
5. **Rebase on `main` right before the PR.** Shared files (`components.css`, `registry.json`, the parity matrix, docs navigation, screenshot baselines) collide between parallel tickets; resolve by keeping both sides, then rerun step 4's checks. Done when: the branch is a fast-forward of `main`.
6. **Open the PR.** Title = ticket title. Body: what changed, `Closes #N`, and a screenshot of the docs preview at 375 and 1280 for anything visual. Comment the issue with the PR link. Done when: CI is green or you have posted the failing job's log excerpt on the PR and stopped.
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

- **Frontier** = open `ready-for-agent` issues in the current epic whose blockers are all closed. Recompute it from `gh` each round; never from memory.
- **Epics in order** (`#71` → `#72` → `#73` → `#74`, all under `#70`). Epic A is the pipeline the other hundred tickets stand on; finish and merge it before dispatching Epic C or D.
- **Concurrency 3.** Not a token limit: a merge-conflict limit on the shared files listed in step 5.
- **One fresh agent per ticket**, in its own worktree, with the implement prompt below and nothing else. The agent returns one line; record it and move on.
- **One fresh agent per green PR** with the review prompt below, once the implementing agent has returned. A `CHANGES` verdict dispatches one more implementing agent on the same branch (at most twice per PR).
- **Round done when** the frontier is empty and every open PR carries a `Review:` comment. Then list the PRs by verdict and the tickets still blocked, and stop. Merging is the maintainer's; it never happens in the loop.

Prompts handed to agents:

```
Implement issue #N of anothernocoder/moderno-ds following docs/agents/ticket-workflow.md, "Working a ticket".
Return one line: PR number, CI state, anything left unticked.
```

```
Review PR #P of anothernocoder/moderno-ds following docs/agents/ticket-workflow.md, "Reviewing a PR".
Return one line: PR number, verdict, finding count.
```

```
Address the "Review: CHANGES" comment on PR #P of anothernocoder/moderno-ds following docs/agents/ticket-workflow.md
("Reviewing a PR", last paragraph). Return one line: PR number, CI state, findings left open.
```
