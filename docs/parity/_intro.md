# Parity Matrix — Phase 3 (Port)

> The DS thesis in one table: the **same** Ark/Zag state machine + the **same**
> `@moderno-ui/core` recipe + the **same** `components.css` = identical look and
> behaviour across five framework targets. Zero per-framework CSS.

## How parity is achieved

| Layer            | Source                                         | Shared by             |
| ---------------- | ---------------------------------------------- | --------------------- |
| Behaviour        | Ark UI (`@ark-ui/{react,vue,svelte,solid}`)    | one Zag machine each  |
| Props → `data-*` | `@moderno-ui/core` recipes (`buttonRecipe`, …) | identical resolver    |
| Styling          | `@moderno-ui/core/styles/components.css`       | one stylesheet, all 5 |
| Tokens / brand   | `@moderno-ui/css` → contract slots             | one theme re-themes 5 |

Each binding's only job is to spread `data-scope`/`data-part` + the recipe's
`data-*` onto markup. A component whose heading below says "no Ark machine" or
"CSS-only" is an authored element: no headless machine is behind it, so all of
its parts are ours. Every other component wraps only Ark's `Root` to inject its
recipe, plus any part its own heading or rows name.

## Component × framework × state

Legend: ✅ verified by an automated test · ❌ not supported (see its footnote) ·
— not applicable · `data-*` = the styling hook the shared stylesheet keys on.
