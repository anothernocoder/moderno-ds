# Moderno Design System

Framework-agnostic design system monorepo (`@moderno-ui/*`). See `CONTEXT.md` and `docs/brief.md` for architecture and the phased plan.

## Agent skills

### Issue tracker

GitHub Issues on `anothernocoder/moderno-ds` via `gh` CLI; external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles map 1:1 to GitHub labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at repo root. See `docs/agents/domain.md`.

### Ticket workflow

Implementing a `ready-for-agent` issue, reviewing its landing, or dispatching an epic AFK: one epic, one branch, one draft PR; one ticket, one fresh agent, one commit on that branch; tickets built in parallel worktrees and landed one at a time by a single lander; a separate fresh agent reviews each landing and posts a `Review:` verdict on the issue; a human merges the epic PR. See `docs/agents/ticket-workflow.md`.

## Component rules

Follow these every time you create or change a component.

### Every component needs a docs page

A component is not done until it has a page on the docs site (`apps/docs/src/content/docs/<locale>/<name>.mdx`, in every locale). Look at `button.mdx` as the model. The page must have, in this order:

1. **Preview** — a live demo at the top.
2. **Installation** — how to install the package.
3. **Usage** — the import and the smallest working example.
4. **API Reference** — every prop, part, and state, with its type and default.
5. **Examples** — one short demo per common use case (variants, sizes, states).

If one of these sections is missing, the component is not finished.

### Center the component in the Preview

In every Preview and Example, the component must sit in the middle of the box, both horizontally and vertically. Check it in the browser before you finish. If it is off-center, fix the demo or the preview layout — do not leave it.

### Keep the docs simple

Write docs so a beginner (human or agent) understands them on the first read:

- Use short sentences and plain words.
- Explain what the component does and when to use it before explaining how it works.
- Show code before long explanations.
- Keep examples small: one idea per example.
- Do not repeat what the API Reference already says.

### Write clean, scalable library code

Code in `packages/*` is used by many apps, so keep it easy to read and easy to grow:

- Give things clear names. A reader should understand a function without reading its body.
- Keep each file and function focused on one job.
- Follow the patterns that other components already use. Do not invent a new structure for one component.
- Share logic through `packages/core` instead of copying it into each framework package.
- Use design tokens for colors, spacing, and radius. Never hard-code values.
- No dead code, no leftover debug logs, no unused props.
- Add or update tests for any behavior you change.
