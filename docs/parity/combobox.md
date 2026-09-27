---
ssr: Combobox listbox ids, selected items, multiple + empty state
---

### Combobox (`comboboxRecipe`: `data-size`; Ark combobox machine)

| State                                                                  | React | Vue | Svelte | Solid |
| ---------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`)                                       |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                                 |  ✅   | ✅  |   ✅   |  ✅   |
| input is a `combobox` named by Label; trigger opens the `listbox`      |  ✅   | ✅  |   ✅   |  ✅   |
| typing filters the list (`useListCollection` + `useFilter`)            |  ✅   | ✅  |   ✅   |  ✅   |
| nothing left → `Empty` shown, content `data-empty`                     |  ✅   | ✅  |   ✅   |  ✅   |
| click picks an item, `onValueChange` reports, the list closes          |  ✅   | ✅  |   ✅   |  ✅   |
| Arrow Down highlights (`aria-activedescendant`), Enter picks           |  ✅   | ✅  |   ✅   |  ✅   |
| `multiple` keeps several: `aria-multiselectable`, items `checked`      |  ✅   | ✅  |   ✅   |  ✅   |
| a disabled item is skipped (`aria-disabled`)                           |  ✅   | ✅  |   ✅   |  ✅   |
| clear trigger empties the value, then hides                            |  ✅   | ✅  |   ✅   |  ✅   |
| controlled value followed                                              |  ✅   | ✅  |   ✅   |  ✅   |
| `invalid` → `data-invalid` on the control, `aria-invalid` on the input |  ✅   | ✅  |   ✅   |  ✅   |
| disabled → control, input and buttons off                              |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                                     |  ✅   | ✅  |   ✅   |  ✅   |
