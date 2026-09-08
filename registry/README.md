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

Installing is transitive and per item: `moderno add auth` copies the flow, its
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
  "version": "0.1.0", // semver per item — drives `update` / `diff`
  "dependencies": [], // npm packages the item needs
  "registryDependencies": [], // other registry items installed first (recursively)
  "files": [
    {
      "path": "themes/theme-moderno/theme.css", // content, relative to this dir
      "type": "registry:theme",
      "target": "src/styles/theme-moderno.css",
    }, // destination in the consumer
  ],
}
```

`path` is resolved relative to the registry root, so the same `registry.json`
works served from disk (dev) or from `/r/` on the docs site (prod).

## CLI lifecycle

```sh
moderno init                       # scaffold components.json + src/styles/moderno.css
moderno add theme-moderno          # copy theme.css + append its @import to moderno.css
moderno add button                 # eject a primitive (escape hatch)
moderno add login-form-react       # copy a block, pulling registryDependencies first
moderno add sign-in                # copy a screen + the blocks it composes
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

## Themes & the multi-brand switch

Themes are authored as `tokens.dtcg.json` and compiled to `theme.css` by
`@moderno-ui/theme-compile` (`pnpm theme:build`, with WCAG AA contrast warnings).

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
