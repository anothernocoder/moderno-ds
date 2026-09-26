# Ticket Workflow

How an agent works one `ready-for-agent` ticket onto its epic's branch, how a second agent judges that landing, and how an orchestrator runs a whole epic AFK. Tickets are **tracer bullets**: each one is sized for a single fresh context window and carries its own spec, epic, blockers and acceptance criteria. One epic, one branch, one draft PR. One ticket, one fresh agent, one commit on that branch. Tickets are built in parallel and landed one at a time. A human merges the epic PR; nothing else is merged by a person.

Why one branch, parallel builds and serial landings: every ticket touches shared files (`components.css`, `registry.json`, the package barrels, the docs nav, the parity matrix, the e2e seams). Two epic PRs would meet in a rebase nobody asked for, and the maintainer would end up juggling them — so there is still one branch and one PR. Building a ticket is the slow part (most of its time is implementation and checks), and it happens on a `ticket/<N>` branch in a worktree of its own, beside its siblings. Landing is short and happens one ticket at a time, by one agent — the **lander** — that alone writes the epic branch. A conflict between siblings is therefore met once, on the current tip, and it is almost always two tickets appending to the same list: a mechanical conflict, settled without judgement (see "Landing a ticket").

## Working a ticket

1. **Claim.** `gh issue view <N> --comments`. A blocker is **settled** when its issue is closed or its PR is merged. Start only if every issue under "Blocked by" is settled. Comment "Working on this" so a parallel agent skips it. Done when: the claim comment is posted and you know the epic branch (`epic/<epic>-<slug>`, named in the epic's draft PR; the orchestrator also hands it to you).
2. **Read the domain, then the ticket's parents.** `CONTEXT.md` and the ADRs the ticket names (see `docs/agents/domain.md`); the spec and epic it links. Done when: you can name the glossary term for every noun in the ticket title.
3. **Cut a ticket branch from the epic tip.** In your worktree: `git fetch origin && git switch -c ticket/<N> origin/<epic branch>`. Do not merge `origin/main` and do not push to the epic branch: the lander does both, one ticket at a time. Siblings are being built at the same time in other worktrees, so run the docs e2e suite on the port you were handed (`PORT=<port> pnpm docs:e2e`) — the suite reuses whatever server answers on its port. Done when: the tree is clean on `ticket/<N>` and `pnpm install --offline && pnpm -r build` pass.
4. **Deliver every acceptance criterion.** Tick each checkbox in the issue body as it lands (`gh issue edit`). The criteria are the definition of done; a ticket with an unticked box is not done. Done when: every box is ticked and `pnpm gen --check`, `pnpm typecheck`, `pnpm test`, `pnpm theme:build`, `pnpm docs:parity`, `pnpm docs:e2e`, `pnpm agent:check-drift` and the lint over the registry are green locally.
5. **Make one commit and push the ticket branch.** Subject = ticket title with the number: `Primitive: Callout (#98)`. Body: what changed and anything a reviewer needs to know. Do not push partial work: if a criterion cannot be delivered, push nothing and report instead. Done when: `git push -u origin ticket/<N>` succeeds with exactly one commit over the epic tip you cut from.
6. **Land it.** Under an orchestrator, stop here: the lander takes `ticket/<N>` from its queue. Working alone, land it yourself following "Landing a ticket". Done when: the lander (or you) reports the commit on the epic branch.
7. **Report one line**: ticket branch and sha, anything left unticked and why. Do not close the issue — the reviewer does, on `PASS`.

A ticket that belongs to no epic is worked the same way on a branch of its own (`<kind>/<slug>` from `main`) with a PR to `main`; the review below then reads that PR instead of a landing.

## Landing a ticket

The lander is the only agent that writes the epic branch, and it lands one ticket at a time, in the order they finish. It works in the orchestrator's checkout, which sits on the epic branch; everything else happens in worktrees.

1. **Sit on the current tip.** `git switch <epic branch> && git pull --ff-only && git fetch origin`. If `origin/main` has commits the epic lacks, merge it first (`git merge origin/main`), settle conflicts as in step 3, rerun the checks of step 4, and push that merge on its own. Done when: the tree is clean and `git log origin/main..HEAD` shows only the epic's own commits.
2. **Cherry-pick the ticket's one commit.** `git cherry-pick origin/ticket/<N>` (or `ticket/<N>-fix`). Done when: the commit applies, or the conflicts are listed.
3. **Settle only mechanical conflicts.** A conflict is **mechanical** when both sides appended entries to the same list or section — an export in a package barrel, a recipe, a CSS scope, a manifest entry or agent example, a parity section, a registry item, a playground mount, an SSR case, a test case — and nothing else changed in the hunk: keep both, the epic's side first. A file that says it is generated is never resolved by hand: take either side and rerun its generator (`pnpm gen`, or `pnpm theme:build` for a theme; ADR-0009). Anything else is not mechanical: `git cherry-pick --abort`, leave the epic branch at its pushed tip, and report the files — the ticket is rebased by an agent that holds its context, and queues again. Done when: the cherry-pick is committed with its original message, or aborted.
4. **Check only what the conflict touched.** A clean cherry-pick is pushed as it is: its builder ran every check on a tip that differs only by siblings' own files, and CI runs the full suite on the push. After settling any conflict, run `pnpm install --offline && pnpm gen --check && pnpm -r build && pnpm typecheck && pnpm test && pnpm agent:check-drift && pnpm docs:parity` before pushing. Done when: they pass, or the cherry-pick is undone (`git reset --hard origin/<epic branch>`) and reported.
5. **Push and comment the landing on the issue**: `git push`, then the sha as it sits on the epic branch and the builder's notes for the reviewer. No screenshots: `gh` cannot attach an image to a comment, and the visual result is checked by the human on the epic PR. Delete the ticket branch from origin (`git push origin --delete ticket/<N>`). Done when: the epic's draft PR shows the commit and the comment is posted.
6. **Report one line**: ticket number, sha on the epic branch, conflicts met and how they were settled.

## Reviewing a landing

A review agent is as fresh as an implementing agent: it has read nothing but the landing, the ticket and the domain docs. It judges; it never edits the branch.

1. **Load the landing and its ticket**: `gh issue view <N> --comments` for the criteria and the landing sha; `git fetch origin && git show <sha>` (and any later `fix(#N)` commit). Under an orchestrator you review in a worktree of your own while other tickets land: check out the sha detached if you need to run anything, never the epic branch. Done when: you hold the ticket's acceptance criteria and the exact diff that claims to satisfy them.
2. **Run `/code-review` over that diff** along its two axes. _Standards_: CONTRACT.md's golden rule (components themed via variables, varied via props, never edited), `CONTEXT.md` vocabulary, the ADRs the ticket names, the responsive policy (ADR-0005). _Spec_: every acceptance criterion in the ticket, checked against the diff and the epic PR's CI, not against the checkbox. Done when: each criterion has a verdict and each finding has a file, a line and a failure scenario.
3. **Post one comment on the issue.** First line `Review: PASS` or `Review: CHANGES`, then the sha reviewed, then findings most severe first, then the criteria you could not verify from the diff (how it looks, container behaviour) flagged for the human. On `PASS`, close the issue with that comment (`gh issue close <N> --comment`): a closed ticket is a settled blocker, and the epic PR lists it as landed. Done when: the comment is posted and its first line matches one of the two verdicts.
4. **Report one line**: ticket number, verdict, finding count.

When the verdict is `CHANGES`, a fresh implementing agent cuts `ticket/<N>-fix` from the epic tip: it treats every finding in the review comment as an extra acceptance criterion, makes one `fix(#N): <what>` commit following steps 3–6 of "Working a ticket", the lander lands it, and a fresh reviewer judges again. Two review rounds per landing; after the second `CHANGES` the ticket stays open, its commits stay on the branch (history is never rewritten), and the epic PR says so for the human.

## Orchestrating an epic AFK

The orchestrator's only job is dispatch. Reading diffs, code or CI logs pulls the work into its own context and ends in hallucinated status; every token it spends must be about _which ticket_, never _how_.

- **Setup.** Once per epic, and idempotent: create `epic/<epic>-<slug>` from `origin/main`, push it, and open a **draft** PR against `main` titled with the epic's title and listing its sub-issues. The draft is what gives every landing CI — `ci.yml` runs on `main` and on pull requests, not on branch pushes — and it is the one PR the maintainer will see. Comment its link on the epic. If the branch and PR already exist, check the branch out and continue.
- **Order.** The epic's open `ready-for-agent` sub-issues in topological order of their "Blocked by" chains, ties by ascending number. Computed once, from `gh`, never from memory. A blocker outside the epic must be settled (closed, or merged) before its ticket runs; a blocker inside the epic must have landed with `Review: PASS`.
- **Several tickets in flight, one landing at a time.** A ticket starts as soon as a slot is free and every blocker inside the epic has passed; the order above decides which ticket takes a free slot first. Each ticket runs: a fresh implementing agent, the lander, a fresh reviewer, then at most one fix (landed the same way) and one re-review. `PASS` settles the ticket for its dependants; anything else ends it, and every ticket blocked on it is skipped and reported — the epic does not stop for one ticket. A landing the lander refuses as not mechanical is rebased once by a fresh agent in a worktree, then queued again.
- **Worktrees for building, one checkout for landing.** Implementing, fixing, rebasing and reviewing agents each work in a worktree of their own, and each ticket in flight owns a docs e2e port (`basePort + slot`). The checkout the orchestrator runs in sits on the epic branch from Setup to Finalize, and only the lander writes it. Start from a clean tree, and expect to be left on the epic branch.
- **Finalize.** Once the order is exhausted: merge `origin/main` into the epic branch one last time (mechanical conflicts as "Landing a ticket" defines them, checks rerun), push, delete any `ticket/*` branch of the epic left on origin, rewrite the PR body from the ledger — landed tickets with their shas first, then everything that did not land or did not pass, with why — and mark the PR ready for review. The orchestrator never merges it.
- **Saved workflow**: `.claude/workflows/dispatch-epic.js` implements this; launch it from a clean session with `Workflow({name: "dispatch-epic", args: {epic: 218, workers: 3}})`. `workers` is how many tickets are in flight at once (default 3, at most 6); each one builds the docs and runs a browser, so raise it only on a machine with room for that many. It resumes: a rerun with the same args skips every ticket already landed.

Prompts handed to agents:

```
Implement issue #N of anothernocoder/moderno-ds following docs/agents/ticket-workflow.md, "Working a ticket",
in this worktree, on ticket/N cut from origin/<branch>. Run the docs e2e suite with PORT=<port>.
Return one line: ticket branch, sha, anything left unticked.
```

```
Land ticket/N (issue #N of anothernocoder/moderno-ds) onto the epic branch <branch> following
docs/agents/ticket-workflow.md, "Landing a ticket", in this checkout. Return one line: ticket number, sha, conflicts.
```

```
Review the landing of issue #N of anothernocoder/moderno-ds — commit <sha> on the epic branch <branch> — following
docs/agents/ticket-workflow.md, "Reviewing a landing". Return one line: ticket number, verdict, finding count.
```

```
Address the "Review: CHANGES" comment on issue #N of anothernocoder/moderno-ds following
docs/agents/ticket-workflow.md ("Reviewing a landing", last paragraph), in this worktree, on ticket/N-fix cut from
origin/<branch>. Return one line: ticket branch, sha, findings left open.
```
