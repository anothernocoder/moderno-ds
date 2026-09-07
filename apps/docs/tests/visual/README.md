# Visual regression seam

Every **preview page** of the built docs — a page that hydrates at least one
island, i.e. where the design system actually renders (the live `<Preview>`
demos and the Theme Builder) — is screenshotted at **375 / 768 / 1280 px** in
**light and dark** and compared pixel-for-pixel against a committed baseline.
Twelve pages × six combinations today; the page list is read from `dist/`, so a
docs page for a new primitive or block joins the matrix as soon as it is built.

A diff here means a token, a stylesheet or a component's markup moved. That is
either the change you intended — update the baselines — or a regression.

## Running it

```sh
pnpm --filter @moderno-ui/docs... build   # the suite serves dist/, not astro dev
pnpm docs:visual                          # compare against the baselines
pnpm docs:visual --project=375-dark       # one width × scheme
pnpm docs:visual --ui                     # Playwright's UI mode
```

`playwright.config.ts` starts `scripts/serve-dist.ts` over `apps/docs/dist`, so
the build must be current — including the Pagefind index (`pnpm build` runs it),
because the search UI is part of every captured page.

## Updating the baselines

```sh
pnpm docs:visual:update
```

Screenshots are only reproducible inside the environment that rendered them, so
the committed baselines are the ones the CI container produces — never a
laptop's. The script dispatches the `visual-baselines` workflow on the current
branch (push it first), waits for it, and writes the artifact into
`__screenshots__/linux/`. Review the result with `git diff --stat` and commit it
**in the same PR as the change that caused it**: that is what makes a deliberate
style change fail CI until someone accepts it.

For a quick local loop, `pnpm docs:visual --update-snapshots` writes a
`__screenshots__/darwin/` (or `win32/`) directory instead. `.gitignore` drops
those, so a host-rendered screenshot can never be mistaken for what CI compares
against.

A **new** page needs no dispatch: the CI `visual` job fails on it (there is
nothing to compare against) but Playwright writes the screenshot anyway, and the
job uploads it as the `visual-baselines` artifact. Download it into
`__screenshots__/linux/` and commit. Same route when the workflow itself is not
on the default branch yet, since GitHub only offers `workflow_dispatch` from
there.

## Layout

| Path                                                     | What it is                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| `pages.ts`                                               | The preview pages, read from `dist/`.                        |
| `docs.spec.ts`                                           | One test per page; waits for fonts and the lazy search UI.   |
| `__screenshots__/{platform}/{width}-{scheme}/{page}.png` | The baselines.                                               |
| `../../playwright.config.ts`                             | The width × scheme matrix, the static server, the tolerance. |

The comparison tolerance is **zero pixels**: the docs are deterministic by
construction (self-hosted fonts, fixed demo data, animations disabled), so
anything flaky is a bug in the page, not a threshold to raise.

## Pinning

The baselines belong to `mcr.microsoft.com/playwright:v<version>-noble`. The
image tag in `.github/workflows/ci.yml` and `visual-baselines.yml` and the
exact `@playwright/test` version in `apps/docs/package.json` are one decision in
three places — bump them together, and regenerate the baselines in the same PR.
