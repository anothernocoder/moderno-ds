# Moderno registry

Versioned, shadcn-style **copy items** installed with `@moderno-ui/cli`. Unlike the
`@moderno-ui/*` npm packages (primitives, tokens, css), registry items are copied
into the consumer project and owned by them: **themes**, **blocks**, **screens**,
**flows**, and **ejected primitives**.

Source of truth: [`registry.json`](registry.json). Public URL (Phase 6):
`https://moderno.style/r/registry.json`. The CLI default is overridable via
`components.json` → `registry` or the `MODERNO_REGISTRY_URL` env var.

## Tiers

Above the primitives the registry has three **copy tiers**, plus themes off to
the side (ADR-0005). Each tier is a glossary term (`CONTEXT.md`), and composition
is expressed with the ordinary `registryDependencies` field — there is no
`composes` field, so `add`, `update` and `diff` keep working per item and shadcn
tooling still understands the manifest.

| `type`               | What it is                                                                                 | May compose        |
| -------------------- | ------------------------------------------------------------------------------------------ | ------------------ |
| `registry:theme`     | **Theme item** — brand CSS + assets, installed on its own and painting everything at once  | nothing            |
| `registry:component` | An **ejected primitive** — the escape hatch for owning a primitive's markup                | components         |
| `registry:block`     | A **block** — a page section; no viewport, no navigation state                             | components         |
| `registry:screen`    | A **screen** — a full-viewport composition of blocks, one state of a flow; presentational  | blocks, components |
| `registry:flow`      | A **flow** — an ordered sequence of screens plus the example assembly that owns navigation | screens            |

The direction is the rule: a tier may compose the tiers below it, never above,
and never in a cycle. `checkTiers` (`@moderno-ui/cli`) enforces it in the
registry integrity test and again in the docs copy step, so a registry that
would make `moderno add login-form` install a router never reaches `/r/`.

Installing is transitive and per item: `moderno add auth-react` copies the flow, its
screens, their blocks and the primitives underneath, recording **each one under
its own version** in the manifest. Nothing is pulled in upward — `moderno add
cart` installs a screen without the flow it belongs to.

Blocks may declare an icon set (Lucide) in `dependencies`; primitives never do —
they take icons as children.

## Item shape

```jsonc
{
  "name": "theme-moderno",
  // registry:theme | registry:component | registry:block | registry:screen | registry:flow
  "type": "registry:theme",
  "version": "0.3.0", // semver per item — drives `update` / `diff`
  "dependencies": [], // npm packages the item needs
  "registryDependencies": [], // other registry items installed first (recursively)
  "files": [
    {
      "path": "themes/theme-moderno/theme.css", // content, relative to this dir
      "type": "registry:theme", // a theme's stylesheet: @import-ed into moderno.css
      "target": "src/styles/theme-moderno.css", // destination in the consumer
    },
    {
      "path": "themes/theme-moderno/DESIGN.md",
      "type": "registry:file", // copied as is, never imported
      "target": "DESIGN.md",
    },
  ],
}
```

`path` is resolved relative to the registry root, so the same `registry.json`
works served from disk (dev) or from `/r/` on the docs site (prod).

## CLI lifecycle

```sh
moderno init                       # scaffold components.json + src/styles/moderno.css
moderno add theme-moderno          # copy theme.css + DESIGN.md, append the CSS @import to moderno.css
moderno add button                 # eject a primitive (escape hatch)
moderno add login-form-react       # copy a block, pulling registryDependencies first
moderno add sign-in-react          # copy a screen + the blocks it composes
moderno add auth                   # copy a flow + its screens + their blocks
moderno update [item...]           # re-apply unedited items; never clobbers local edits
moderno diff <item>                # show what changed vs the registry version
```

## Manifest — `.moderno/manifest.json`

`add` records every installed item so `update`/`diff` know the installed version
and whether a file was edited locally:

```jsonc
{
  "$schema": "https://moderno.style/schema/manifest.json",
  "items": {
    "button": {
      "version": "0.1.0",
      "type": "registry:component",
      "files": [
        { "target": "src/components/ui/button.tsx", "hash": "sha256-…" }, // pristine hash of the content as written
      ],
    },
  },
}
```

`update` overwrites a file only when its current on-disk hash still equals the
recorded pristine hash (i.e. unedited). Edited files are preserved and reported
as conflicts — this is what makes `update` safe and is why primitives are
**themed, not edited**.

`add` never overwrites a file it did not write. If a different file is already
at a target (a project's own `DESIGN.md`, say), `add` keeps it, reports it, and
leaves it out of the manifest; `update` then preserves it like a local edit, and
`diff` shows the registry version beside it.

## Authoring a block

A block is styled with the Tailwind v4 preset (`@moderno-ui/css/preset`), whose
utilities resolve to contract slots — `bg-card`, `text-muted-foreground`,
`rounded-lg`, `shadow-sm`, `max-w-md` — so installing a theme re-skins it with no
rebuild. Two rules follow from
[ADR-0005](../docs/adr/0005-responsive-container-queries-and-registry-tiers.md)
(the full policy is in [`CONTRACT.md`](../CONTRACT.md#responsive-policy)):

1. **Respond to the container, not the viewport.** Declare `@container` on the
   block root and lay out with `@sm:` / `@md:` / `@lg:`, bound to
   `--container-sm|md|lg`. A block cannot know whether it was mounted in a
   sidebar, a modal or a page; `md:` — Tailwind's _viewport_ variant, one
   character away — makes it right in exactly one of them.
   `blocks/pricing` is the worked example.
2. **No literal colours or dimensions.** Paint from contract slots and size from
   the preset's scales. A colour literal is rejected wherever it appears — a CSS
   declaration or an arbitrary value — and so is a raw length inside an
   arbitrary value (`w-[320px]`, `p-[8px_16px]`).

Both are enforced on every PR: `pnpm lint:registry` runs `moderno-lint` over
every source file listed in `registry.json`, and a test rejects `@media` and
viewport variants in blocks.

One gap worth knowing while it lasts: as _CSS_, `no-hardcoded-dimension` still
only reads `border-radius` (spacing and motion were deferred from #43), so a
`width: 320px` in an SFC's `<style>` block passes the linter today. Write the
dimensions as utilities and the gate has the whole surface.

## Authoring a screen

A screen is a block's rules plus two of its own (`sign-in` is the worked
example).

1. **Full-viewport is a _height_.** The root carries `min-h-dvh`; every _width_
   decision is still read off the screen's own `@container`, so the screen is
   correct in a pane that is not the window. `md:` is as wrong here as it is in
   a block.
2. **Compose blocks by their installed path.** A screen's
   `registryDependencies` are the blocks it composes, so `moderno add` writes
   those next to it; the source imports them from where they land —
   `@/components/blocks/<file>` — not from a path inside this repo. The docs
   resolve those two specifiers back to the registry sources
   (`apps/docs/astro.config.mjs`), which is what lets a preview mount the shipped
   file rather than a copy of it.

The root is a `<div>`, not a `<main>`: a document may have only one visible
`main`, and most app shells already provide it.

## Themes & the multi-brand switch

Each theme lives in `themes/<name>/` as three files. `tokens.dtcg.json` is its one
hand-edited source; `@moderno-ui/theme-compile` (`pnpm theme:build`, with WCAG
AA contrast warnings) generates the other two from it, for every theme alike:

- `theme.css`, the compiled stylesheet.
- `DESIGN.md`, the theme's guide in the google-labs format, for people and
  coding agents: front matter with the theme's values, the system rules every
  theme shares (derived from the token contract), and the theme's **brand
  notes**. The brand notes, between `<!-- brand-notes:start -->` and
  `<!-- brand-notes:end -->`, are the only hand-written part; a rebuild keeps
  them and regenerates the rest. Its `name` and `description` come from the
  theme (`name` and `$description` in `tokens.dtcg.json`).

`themes.test.ts` fails if either file drifts from a fresh build. The registry
ships both with the theme.

- `theme-moderno` → `:root` (light) + `.dark` (dark): the **default brand**.
- `theme-contrast` → `[data-brand="contrast"]` + `.dark [data-brand="contrast"], [data-brand="contrast"].dark`: an alternate brand.

Install both and switch brand by toggling `data-brand`, composed with `.dark`:

```html
<!-- src/styles/moderno.css -->
@import "@moderno-ui/css"; @import "./theme-moderno.css"; /* default brand at :root / .dark */
@import "./theme-contrast.css"; /* alternate brand at [data-brand="contrast"] */
```

```html
<html class="dark">
  <!-- default Moderno brand, dark -->
  <html class="dark" data-brand="contrast">
    <!-- contrast brand, dark -->
  </html>
</html>
```

No component is touched — only the contract variables are re-mapped. A runnable
demo of the switch lives at [`demo/multi-brand.html`](../demo/multi-brand.html)
(open it directly in a browser).

### Adding a theme

1. **Get a token file.** Build the theme in the docs' Theme Builder
   (`/en/theme-builder`) and download its `tokens.dtcg.json`, or copy an
   existing theme's `tokens.dtcg.json` and change the values.
2. **Save it as `registry/themes/theme-<name>/tokens.dtcg.json`.** Give it a
   `$description` (one sentence on the brand; it becomes the `DESIGN.md`
   description), and set the two fields under
   `$extensions["style.moderno.theme"]`:
   - `name`: the directory name, `theme-<name>`.
   - `brand`: where the theme applies. `null` compiles to `:root` and `.dark`,
     so the theme replaces the default one; a project installs only one such
     theme. A brand id such as `"ocean"` compiles to `[data-brand="ocean"]` and
     its `.dark` pairs, so the theme sits beside the default and paints only
     under an element with `data-brand="ocean"`. The docs site switches to the
     theme under that same brand, and fails to build if two themes share one.
     The Theme Builder keeps the base theme's choice (branded or not) and
     derives the brand id from the name you give it.
3. **Run `pnpm theme:build`.** It writes `theme.css` and `DESIGN.md` beside the
   tokens, prints WCAG AA contrast warnings, and fails on an invalid file.
   `themes.test.ts` then fails if either file goes stale, or if the theme sets
   an extended slot (spacing, motion, the type scale…) to the value it would
   inherit anyway. Drop those slots.
4. **Write the brand notes.** On the first build the theme has none, so
   `DESIGN.md` gets a draft read off its values (the build log says "drafted
   brand notes"). Review it and rewrite it in the brand's own words, between
   `<!-- brand-notes:start -->` and `<!-- brand-notes:end -->`, using `###`
   headings or smaller. Everything outside the markers is regenerated, so edit
   nothing else, then run `pnpm theme:build` again.
5. **Add the item to [`registry.json`](registry.json)**, next to the other
   themes, with both files. Without it the docs still show the theme but
   `moderno add` can't find it, so `themes.test.ts` fails until the entry
   exists. The `DESIGN.md` target follows the brand: a brand-less theme
   (`brand: null`) replaces the default, so its guide is the project's own
   `DESIGN.md`; a branded theme sits beside the default, so its guide goes to
   `design/theme-<name>/DESIGN.md`. `themes.test.ts` checks the target.

   ```json
   {
     "name": "theme-ocean",
     "type": "registry:theme",
     "version": "0.1.0",
     "title": "Theme Ocean",
     "description": "One sentence on the brand and the selector it paints.",
     "dependencies": [],
     "registryDependencies": [],
     "files": [
       {
         "path": "themes/theme-ocean/theme.css",
         "type": "registry:theme",
         "target": "src/styles/theme-ocean.css"
       },
       {
         "path": "themes/theme-ocean/DESIGN.md",
         "type": "registry:file",
         "target": "design/theme-ocean/DESIGN.md"
       }
     ]
   }
   ```

   For a brand-less theme, the second target is `"DESIGN.md"`.

After that, nothing else needs registering:

- The docs header's theme switcher and the Theme Builder's "Start from" row read
  `registry/themes/*/tokens.dtcg.json` (`apps/docs/src/lib/siteThemes.ts`) and
  list the new theme as `<Name>`, after the default in alphabetical order.
- The docs build copies `registry/` to `/r/`, so consumers install it with
  `npx @moderno-ui/cli add theme-<name>`. That writes
  `src/styles/theme-<name>.css`, appends its `@import` to
  `src/styles/moderno.css`, and writes the theme's `DESIGN.md` to its target,
  unless the project already has a different file there (see
  [Manifest](#manifest--modernomanifestjson)).

**Fonts.** A theme names its typefaces in `font-sans` and `font-serif`, but the
registry ships no font files. The docs site loads them itself: add the
`@fontsource/<family>` package to `apps/docs/package.json` and import it in
`apps/docs/src/layouts/BaseLayout.astro`, next to the Hedvig Letters imports.
Without that, the docs fall back to the next family in the stack. Consumers load
the font files themselves, for example from the same `@fontsource` package.
