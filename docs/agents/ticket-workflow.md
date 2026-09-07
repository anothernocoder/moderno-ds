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

## Orchestrating tickets AFK

The orchestrator's only job is dispatch. Reading diffs, code or CI logs pulls the work into its own context and ends in hallucinated status; every token it spends must be about *which ticket*, never *how*.

- **Frontier** = open `ready-for-agent` issues in the current epic whose blockers are all closed. Recompute it from `gh` each round; never from memory.
- **Epics in order** (`#71` → `#72` → `#73` → `#74`, all under `#70`). Epic A is the pipeline the other hundred tickets stand on; finish and merge it before dispatching Epic C or D.
- **Concurrency 3.** Not a token limit: a merge-conflict limit on the shared files listed in step 5.
- **One fresh agent per ticket**, in its own worktree, with the prompt below and nothing else. The agent returns one line; record it and move on.
- **Round done when** the frontier is empty. Then list the PRs awaiting review and the tickets still blocked, and stop. Merging is the maintainer's; it never happens in the loop.

Prompt handed to each agent:

```
Implement issue #N of anothernocoder/moderno-ds following docs/agents/ticket-workflow.md.
Return one line: PR number, CI state, anything left unticked.
```
