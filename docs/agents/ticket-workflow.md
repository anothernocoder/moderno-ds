# Ticket Workflow

How an agent works one `ready-for-agent` ticket onto its epic's branch, how a second agent judges that landing, and how an orchestrator runs a whole epic AFK. Tickets are **tracer bullets**: each one is sized for a single fresh context window and carries its own spec, epic, blockers and acceptance criteria. One epic, one branch, one draft PR. One ticket, one fresh agent, one commit on that branch, in order. A human merges the epic PR; nothing else is merged by a person.

Why one branch and no parallelism: every ticket touches the shared files (`components.css`, `registry.json`, the docs nav, the parity matrix, the e2e seams). Two agents on two branches meet in a rebase nobody asked for, and the maintainer ends up juggling the PRs. One agent at a time on one branch means a conflict can only happen against `main`, once, at the start of a ticket — and the agent that owns the ticket resolves it with full context.

## Working a ticket

1. **Claim.** `gh issue view <N> --comments`. A blocker is **settled** when its issue is closed or its PR is merged. Start only if every issue under "Blocked by" is settled. Comment "Working on this" so a parallel agent skips it. Done when: the claim comment is posted and you know the epic branch (`epic/<epic>-<slug>`, named in the epic's draft PR; the orchestrator also hands it to you).
2. **Read the domain, then the ticket's parents.** `CONTEXT.md` and the ADRs the ticket names (see `docs/agents/domain.md`); the spec and epic it links. Done when: you can name the glossary term for every noun in the ticket title.
3. **Sit on the epic branch and integrate `main` first.** In this checkout: `git switch <epic branch> && git pull`, then `git merge origin/main`. Resolve any conflict keeping both sides, and rerun the checks in step 4 before touching anything else — a conflict is `main`'s change meeting the epic's, and it is yours to settle now, not the finalizer's. Done when: the tree is clean, `git log origin/main..HEAD` shows only the epic's own commits, and `pnpm install --offline && pnpm -r build` pass.
4. **Deliver every acceptance criterion.** Tick each checkbox in the issue body as it lands (`gh issue edit`). The criteria are the definition of done; a ticket with an unticked box is not done. Done when: every box is ticked and `pnpm typecheck`, `pnpm test`, `pnpm theme:build`, `pnpm docs:parity`, `pnpm docs:e2e`, `pnpm agent:check-drift` and the lint over the registry are green locally.
5. **Land one commit.** Subject = ticket title with the number: `Primitive: Callout (#98)`. Body: what changed and anything a reviewer needs to know. Do not push partial work: if a criterion cannot be delivered, leave the branch at its pushed tip and report instead. Done when: `git push` succeeds and the epic's draft PR shows the commit (CI runs there on every push).
6. **Comment the landing on the issue**: the sha, and for anything visual a screenshot of the docs preview at 375 and 1280. Done when: the comment is posted.
7. **Report one line**: sha, CI state on the epic PR, anything left unticked and why. Do not close the issue — the reviewer does, on `PASS`.

A ticket that belongs to no epic is worked the same way on a branch of its own (`<kind>/<slug>` from `main`) with a PR to `main`; the review below then reads that PR instead of a landing.

## Reviewing a landing

A review agent is as fresh as an implementing agent: it has read nothing but the landing, the ticket and the domain docs. It judges; it never edits the branch.

1. **Load the landing and its ticket**: `gh issue view <N> --comments` for the criteria and the landing sha; on the epic branch, `git show <sha>` (and any later `fix(#N)` commit). Done when: you hold the ticket's acceptance criteria and the exact diff that claims to satisfy them.
2. **Run `/code-review` over that diff** along its two axes. _Standards_: CONTRACT.md's golden rule (components themed via variables, varied via props, never edited), `CONTEXT.md` vocabulary, the ADRs the ticket names, the responsive policy (ADR-0005). _Spec_: every acceptance criterion in the ticket, checked against the diff and the epic PR's CI, not against the checkbox. Done when: each criterion has a verdict and each finding has a file, a line and a failure scenario.
3. **Post one comment on the issue.** First line `Review: PASS` or `Review: CHANGES`, then the sha reviewed, then findings most severe first, then the criteria you could not verify from the diff (screenshots, container behaviour) flagged for the human. On `PASS`, close the issue with that comment (`gh issue close <N> --comment`): a closed ticket is a settled blocker, and the epic PR lists it as landed. Done when: the comment is posted and its first line matches one of the two verdicts.
4. **Report one line**: ticket number, verdict, finding count.

When the verdict is `CHANGES`, a fresh implementing agent takes the same branch: it treats every finding in the review comment as an extra acceptance criterion, lands one `fix(#N): <what>` commit following steps 3–6 of "Working a ticket", and a fresh reviewer judges again. Two review rounds per landing; after the second `CHANGES` the ticket stays open, its commits stay on the branch (history is never rewritten), and the epic PR says so for the human.

## Orchestrating an epic AFK

The orchestrator's only job is dispatch. Reading diffs, code or CI logs pulls the work into its own context and ends in hallucinated status; every token it spends must be about _which ticket_, never _how_.

- **Setup.** Once per epic, and idempotent: create `epic/<epic>-<slug>` from `origin/main`, push it, and open a **draft** PR against `main` titled with the epic's title and listing its sub-issues. The draft is what gives every landing CI — `ci.yml` runs on `main` and on pull requests, not on branch pushes — and it is the one PR the maintainer will see. Comment its link on the epic. If the branch and PR already exist, check the branch out and continue.
- **Order.** The epic's open `ready-for-agent` sub-issues in topological order of their "Blocked by" chains, ties by ascending number. Computed once, from `gh`, never from memory. A blocker outside the epic must be settled (closed, or merged) before its ticket runs; a blocker inside the epic must have landed with `Review: PASS`.
- **One ticket at a time, in that order.** A fresh implementing agent, then a fresh reviewer, then at most one fix and one re-review. `PASS` settles the ticket for its dependants; anything else leaves it open, and every ticket blocked on it is skipped and reported — the epic does not stop for one ticket.
- **No worktrees.** The checkout the orchestrator runs in sits on the epic branch from Setup to Finalize; agents commit and push there in sequence. Start from a clean tree, and expect to be left on the epic branch.
- **Finalize.** Once the order is exhausted: merge `origin/main` into the epic branch one last time (conflicts kept both sides, checks rerun), push, rewrite the PR body from the ledger — landed tickets with their shas first, then everything that did not land or did not pass, with why — and mark the PR ready for review. The orchestrator never merges it.
- **Saved workflow**: `.claude/workflows/dispatch-epic.js` implements this; launch it from a clean session with `Workflow({name: "dispatch-epic", args: {epic: 218}})`. It resumes: a rerun with the same args skips every ticket already landed.

Prompts handed to agents:

```
Implement issue #N of anothernocoder/moderno-ds following docs/agents/ticket-workflow.md, "Working a ticket",
on the epic branch <branch> in this checkout. Return one line: sha, CI state, anything left unticked.
```

```
Review the landing of issue #N of anothernocoder/moderno-ds on the epic branch <branch> following
docs/agents/ticket-workflow.md, "Reviewing a landing". Return one line: ticket number, verdict, finding count.
```

```
Address the "Review: CHANGES" comment on issue #N of anothernocoder/moderno-ds following
docs/agents/ticket-workflow.md ("Reviewing a landing", last paragraph), on the epic branch <branch>.
Return one line: sha, CI state, findings left open.
```
