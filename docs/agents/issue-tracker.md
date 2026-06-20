# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.**

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments` then keep only `authorAssociation` of `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE` (drop `OWNER`/`MEMBER`/`COLLABORATOR`).
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either — resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## Sub-issues (epic → breakdown)

`gh issue create` only makes flat issues — a `Phase 2 —` title prefix is plain text, **not** a link. Native sub-issues (the progress bars under an epic) live in GraphQL and must be linked explicitly _after_ creating each child, or they land flat.

Link a child to its parent with the `addSubIssue` mutation, which takes node IDs (`I_kwDO…`), not issue numbers:

```bash
# resolve numbers -> node IDs
gh api graphql -f query='
{ repository(owner:"anothernocoder", name:"moderno-ds") {
    issues(first:100) { nodes { number id } } } }' \
  --jq '.data.repository.issues.nodes | map({(.number|tostring): .id}) | add'

# link child node ID to parent node ID
gh api graphql -f query='
mutation($p:ID!,$c:ID!){ addSubIssue(input:{issueId:$p, subIssueId:$c}){ subIssue{ number } } }' \
  -f p=<PARENT_NODE_ID> -f c=<CHILD_NODE_ID>
```

Verify with `parent{number}` / `subIssues{totalCount}` on the `issues` query. When breaking an epic into child issues, run this link step in the same pass as creation — don't leave it for later.

## When a skill says "publish to the issue tracker"

Create a GitHub issue on `anothernocoder/moderno-ds`.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.
