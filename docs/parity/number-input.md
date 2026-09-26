---
ssr: NumberInput value, bounds, format + steppers
---

### NumberInput (`numberInputRecipe`: `data-size`; Ark number-input machine)

| State                                                                  | React | Vue | Svelte | Solid |
| ---------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`)                                       |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                                 |  ✅   | ✅  |   ✅   |  ✅   |
| input is the `spinbutton` (`aria-valuenow`/min/max), named by Label    |  ✅   | ✅  |   ✅   |  ✅   |
| arrow keys and both steppers step the value; `onValueChange` reports   |  ✅   | ✅  |   ✅   |  ✅   |
| at `max` the increment stepper is disabled                             |  ✅   | ✅  |   ✅   |  ✅   |
| typed value out of range → `data-invalid`, clamped on blur             |  ✅   | ✅  |   ✅   |  ✅   |
| `formatOptions` formats the value (`$1,234.50`)                        |  ✅   | ✅  |   ✅   |  ✅   |
| controlled value followed                                              |  ✅   | ✅  |   ✅   |  ✅   |
| `invalid` → `data-invalid` on the control, `aria-invalid` on the input |  ✅   | ✅  |   ✅   |  ✅   |
| disabled → `data-disabled` on every part, input and steppers disabled  |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                                     |  ✅   | ✅  |   ✅   |  ✅   |
