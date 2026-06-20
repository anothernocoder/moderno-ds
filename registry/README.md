# Moderno registry

Versioned, shadcn-style **copy items** installed with `@moderno/cli`. Unlike the
`@moderno/*` npm packages (primitives, tokens, css), registry items are copied
into the consumer project and owned by them: **themes**, **blocks**, and
**ejected primitives**.

Source of truth: [`registry.json`](registry.json). Public URL (Phase 6):
`https://moderno.style/r/registry.json`. The CLI default is overridable via
`components.json` → `registry` or the `MODERNO_REGISTRY_URL` env var.

## Item shape

```jsonc
{
  "name": "theme-moderno",
  "type": "registry:theme", // registry:theme | registry:block | registry:component
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

## Themes & the multi-brand switch

Themes are authored as `tokens.dtcg.json` and compiled to `theme.css` by
`@moderno/theme-compile` (`pnpm theme:build`, with WCAG AA contrast warnings).

- `theme-moderno` → `:root` (light) + `.dark` (dark): the **default brand**.
- `theme-contrast` → `[data-brand="contrast"]` + `.dark [data-brand="contrast"], [data-brand="contrast"].dark`: an alternate brand.

Install both and switch brand by toggling `data-brand`, composed with `.dark`:

```html
<!-- src/styles/moderno.css -->
@import "@moderno/css"; @import "./theme-moderno.css"; /* default brand at :root / .dark */ @import
"./theme-contrast.css"; /* alternate brand at [data-brand="contrast"] */
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
