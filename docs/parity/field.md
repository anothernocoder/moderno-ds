---
ssr: Field sizes + textarea
---

### Field (`fieldRecipe`: `data-size`; state is Ark's `data-invalid` / `data-disabled`)

| State / prop                    | React | Vue | Svelte | Solid |
| ------------------------------- | :---: | :-: | :----: | :---: |
| label ↔ control (`for`/`id`)    |  ✅   | ✅  |   ✅   |  ✅   |
| scope/part attributes           |  ✅   | ✅  |   ✅   |  ✅   |
| invalid → `data-invalid`        |  ✅   | ✅  |   ✅   |  ✅   |
| error text hidden when valid    |  ✅   | ✅  |   ✅   |  ✅   |
| disabled propagates             |  ✅   | ✅  |   ✅   |  ✅   |
| default size → root `data-size` |  ✅   | ✅  |   ✅   |  ✅   |
| size → root `data-size` only    |  ✅   | ✅  |   ✅   |  ✅   |
| textarea control → `data-part`  |  ✅   | ✅  |   ✅   |  ✅   |
