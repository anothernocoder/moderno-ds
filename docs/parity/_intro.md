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
`data-*` onto markup. Alert, Badge, Button, Callout, Card, Chip, Divider,
Indicator, Skeleton and Spinner are authored elements: none has a headless
machine behind it, so all of their parts are ours. Dialog is a verbatim Ark
re-export. Every other component wraps only Ark's `Root` to inject its recipe;
Switch also wraps `HiddenInput` for its `switch` role, and RadioGroup adds its
own `ItemDescription`.

## Component × framework × state

Legend: ✅ verified by an automated test · ❌ not supported (see its footnote) ·
— not applicable · `data-*` = the styling hook the shared stylesheet keys on.
