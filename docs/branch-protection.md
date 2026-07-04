# Branch protection & contribution flow

`main` is protected. **No direct commits or pushes to `main` — every change lands through a pull request.** This is enforced at two layers.

## Layer 1 — GitHub branch protection (server-side, authoritative)

Configured on `anothernocoder/moderno-ds` → `main`:

| Rule | Value |
| --- | --- |
| Require a pull request before merging | on |
| Required approving reviews | 0 (open a PR, you may self-merge) |
| Force pushes | blocked |
| Branch deletion | blocked |
| Include administrators | off (admins may push directly in emergencies) |

GitHub rejects any non-PR push to `main` for non-admins regardless of local setup. This is the real gate.

Inspect or change it with the GitHub CLI:

```bash
# view current protection
gh api repos/anothernocoder/moderno-ds/branches/main/protection

# remove protection (admin only)
gh api -X DELETE repos/anothernocoder/moderno-ds/branches/main/protection
```

## Layer 2 — Local pre-commit hook (fail-fast)

[`.githooks/pre-commit`](../.githooks/pre-commit) blocks `git commit` while you are on `main`, so you never build up commits on the wrong branch before discovering the server-side push is rejected.

The hook is wired via `core.hooksPath` (versioned in the repo, unlike `.git/hooks`). The `prepare` npm script sets it automatically on `pnpm install`. To wire it manually:

```bash
git config core.hooksPath .githooks
```

Escape hatch (discouraged): `git commit --no-verify`, or `MODERNO_ALLOW_MAIN_COMMIT=1 git commit ...`.

## Standard flow

```bash
git switch -c mi-cambio        # branch off main
git commit ...                 # commit on the branch
git push -u origin mi-cambio
gh pr create --fill
gh pr merge --squash           # merge once checks pass
```
