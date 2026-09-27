---
ssr: DatePicker root/content `data-size`, trigger ids, locale inputs + range days
---

### DatePicker (`datePickerRecipe`: `data-size` on the root and the content; Ark date-picker machine)

| State                                                                          | React | Vue | Svelte | Solid |
| ------------------------------------------------------------------------------ | :---: | :-: | :----: | :---: |
| size on the Root → root and content `data-size` (+ `md`)                       |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                                         |  ✅   | ✅  |   ✅   |  ✅   |
| closed by default: content hidden, trigger `aria-expanded="false"`             |  ✅   | ✅  |   ✅   |  ✅   |
| opens on the trigger: the focused month as a `grid`                            |  ✅   | ✅  |   ✅   |  ✅   |
| picking a day fills the input, reports `onValueChange` and closes              |  ✅   | ✅  |   ✅   |  ✅   |
| `locale` formats the placeholder and parses a typed date                       |  ✅   | ✅  |   ✅   |  ✅   |
| range mode: two clicks → `data-range-start`, `data-in-range`, `data-range-end` |  ✅   | ✅  |   ✅   |  ✅   |
| controlled value followed (`v-model` in Vue, `bind:value` in Svelte)           |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                                             |  ✅   | ✅  |   ✅   |  ✅   |
