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

Implementing a `ready-for-agent` issue, reviewing its PR, or dispatching tickets AFK: one ticket, one fresh agent, one PR; a separate fresh agent reviews and posts a `Review:` verdict; a human merges. See `docs/agents/ticket-workflow.md`.
