# Changesets

This directory holds [Changesets](https://github.com/changesets/changesets) — one
markdown file per intended release, recording which `@moderno/*` packages change
and at what semver bump. CI (`.github/workflows/release.yml`) consumes them:

- On push to `main`, `changesets/action` opens/updates a **Version Packages** PR
  that applies the bumps and updates changelogs.
- Merging that PR runs `pnpm release` (`pnpm -r build && changeset publish`),
  publishing the changed public packages to npm.

Add a changeset with `pnpm changeset`. Private packages (e.g.
`@moderno/theme-compile`) are skipped automatically.
