---
ssr: ColorPicker root `data-size`, trigger hex + dialog ids, named area and sliders, Field label
---

### ColorPicker (`colorPickerRecipe`: `data-size` on the root; Ark color-picker machine, hex in and out)

| State / prop                                                                       | React | Vue | Svelte | Solid |
| ---------------------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`); native props forwarded to the root               |  ✅   | ✅  |   ✅   |  ✅   |
| trigger shows the swatch and the hex, named "Color #RRGGBB"                        |  ✅   | ✅  |   ✅   |  ✅   |
| closed by default: no dialog, trigger `aria-expanded="false"`                      |  ✅   | ✅  |   ✅   |  ✅   |
| opens to the area, the hue slider and the hex box, each named                      |  ✅   | ✅  |   ✅   |  ✅   |
| `alpha` shows the alpha slider; off, the value is opaque                           |  ✅   | ✅  |   ✅   |  ✅   |
| `swatches` → one button each; clicking one selects it                              |  ✅   | ✅  |   ✅   |  ✅   |
| eyedropper only where the browser has one                                          |  ✅   | ✅  |   ✅   |  ✅   |
| hex box: `#RGB`, `#RRGGBB`, `#RRGGBBAA`, `#` optional, on Enter or blur            |  ✅   | ✅  |   ✅   |  ✅   |
| invalid hex: value kept, box back to the last valid hex on blur                    |  ✅   | ✅  |   ✅   |  ✅   |
| arrow keys move the area and the sliders; Escape closes, focus back on the trigger |  ✅   | ✅  |   ✅   |  ✅   |
| controlled value followed (`v-model` in Vue, `bind:value` in Svelte), hue kept     |  ✅   | ✅  |   ✅   |  ✅   |
| inside a Field: its label names the trigger, helper/error text describe it         |  ✅   | ✅  |   ✅   |  ✅   |
| `name` submits the hex with a form                                                 |  ✅   | ✅  |   ✅   |  ✅   |
| `translations` rename the parts                                                    |  ✅   | ✅  |   ✅   |  ✅   |
