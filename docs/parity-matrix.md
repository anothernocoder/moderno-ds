# Parity Matrix — Phase 3 (Port)

> The DS thesis in one table: the **same** Ark/Zag state machine + the **same**
> `@moderno/core` recipe + the **same** `components.css` = identical look and
> behaviour across five framework targets. Zero per-framework CSS.

## How parity is achieved

| Layer            | Source                                      | Shared by             |
| ---------------- | ------------------------------------------- | --------------------- |
| Behaviour        | Ark UI (`@ark-ui/{react,vue,svelte,solid}`) | one Zag machine each  |
| Props → `data-*` | `@moderno/core` recipes (`buttonRecipe`, …) | identical resolver    |
| Styling          | `@moderno/core/styles/components.css`       | one stylesheet, all 5 |
| Tokens / brand   | `@moderno/tokens` → contract slots          | one theme re-themes 5 |

Each binding's only job is to spread `data-scope`/`data-part` + the recipe's
`data-*` onto markup. Button is the sole authored element; Field and Dialog are
verbatim Ark re-exports; Select wraps only `Root` to inject `data-size`.

## Component × framework × state

Legend: ✅ verified by an automated test · `data-*` = the styling hook the
shared stylesheet keys on.

### Button (`buttonRecipe`: `data-variant` × `data-size`)

| State / prop             | React | Vue | Svelte | Solid |
| ------------------------ | :---: | :-: | :----: | :---: |
| scope/part + defaults    |  ✅   | ✅  |   ✅   |  ✅   |
| variant → `data-variant` |  ✅   | ✅  |   ✅   |  ✅   |
| size → `data-size`       |  ✅   | ✅  |   ✅   |  ✅   |
| no baked class/style     |  ✅   | ✅  |   ✅   |  ✅   |
| `type` default+override  |  ✅   | ✅  |   ✅   |  ✅   |
| native props + events    |  ✅   | ✅  |   ✅   |  ✅   |

### Field (Ark `data-invalid` / `data-disabled`, no recipe)

| State                        | React | Vue | Svelte | Solid |
| ---------------------------- | :---: | :-: | :----: | :---: |
| label ↔ control (`for`/`id`) |  ✅   | ✅  |   ✅   |  ✅   |
| scope/part attributes        |  ✅   | ✅  |   ✅   |  ✅   |
| invalid → `data-invalid`     |  ✅   | ✅  |   ✅   |  ✅   |
| error text hidden when valid |  ✅   | ✅  |   ✅   |  ✅   |
| disabled propagates          |  ✅   | ✅  |   ✅   |  ✅   |

### Dialog (Ark portal + focus trap + ids)

| State                    | React | Vue | Svelte | Solid |
| ------------------------ | :---: | :-: | :----: | :---: |
| closed by default        |  ✅   | ✅  |   ✅   |  ✅   |
| opens, labelled modal    |  ✅   | ✅  |   ✅   |  ✅   |
| focus trapped when open  |  ✅   | ✅  |   ✅   |  ✅   |
| closes via close trigger |  ✅   | ✅  |   ✅   |  ✅   |

### Select (`selectRecipe`: `data-size`; Ark popover + keyboard)

| State                         | React | Vue | Svelte | Solid |
| ----------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size`       |  ✅   | ✅  |   ✅   |  ✅   |
| placeholder + open listbox    |  ✅   | ✅  |   ✅   |  ✅   |
| select by click reports value |  ✅   | ✅  |   ✅   |  ✅   |
| open listbox from keyboard    |  ✅   | ✅  |   ✅   |  ✅   |

## SSR (F3.3 / F3.5)

| Guarantee                                   | React | Vue | Svelte | Solid |
| ------------------------------------------- | :---: | :-: | :----: | :---: |
| stable server HTML (scope/part + recipe)    |  ✅   | ✅  |   ✅   |  ✅   |
| warning-free hydration (id path)            |  ✅   | ✅¹ |   —²   |  —²   |
| static server-only island (zero `<script>`) |   —   |  —  |   ✅   |   —   |
| `defaultOpen` survives SSR                  |  ✅   | ✅  |   ✅   |  ✅   |

¹ Vue hydration is verified on the portal-free primitives (Button + Field), the
deterministic `useId` hazard; Ark's portaled popovers position via floating-ui
measurement absent in jsdom, so their hydration is covered by the string +
interaction suites.
² Svelte/Solid use a separate SSR-compiled test project (`*.ssr.test.*`) that
asserts the static server string; Svelte additionally proves the zero-runtime
Astro-island guarantee (F3.5).

## Notes on the bindings

- **Portal**: React/Solid use a framework-native portal (`@ark-ui/react`,
  `solid-js/web`); Svelte uses Ark's `Portal`; Vue has no Ark portal, so
  `@moderno/vue` ships a thin `<Teleport to="body">` wrapper for API parity.
- **Authoring style** mirrors each ecosystem: React/Solid JSX, Vue `h()` render
  functions (no SFC → tsup builds it), Svelte 5 `.svelte` runes (built with
  `svelte-package`).
- **Typing**: the wrapped `Select` export is annotated in every package so the
  emitted `.d.ts` never inlines an un-nameable `@zag-js` type (TS2742).
