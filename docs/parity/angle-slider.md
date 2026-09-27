---
ssr: AngleSlider thumb angle + spoken value, --angle, marks, field text
---

### AngleSlider (`angleSliderRecipe`: `data-size`; Ark angle-slider machine)

| State                                                                    | React | Vue | Svelte | Solid |
| ------------------------------------------------------------------------ | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`), and the angle field's                  |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed, plus `Input`                                     |  ✅   | ✅  |   ✅   |  ✅   |
| thumb is the `slider`, named by Label, `aria-valuetext` "45 degrees"     |  ✅   | ✅  |   ✅   |  ✅   |
| `getAriaValueText` words the spoken value                                |  ✅   | ✅  |   ✅   |  ✅   |
| markers → `data-state` under / at / over the angle                       |  ✅   | ✅  |   ✅   |  ✅   |
| arrows step by `step`, Home / End → 0° / 359°, Page Up / Down turn 15°   |  ✅   | ✅  |   ✅   |  ✅   |
| click sets the angle; a drag past 360° carries on from 0°                |  ✅   | ✅  |   ✅   |  ✅   |
| Shift while dragging snaps to `marks`, and only then                     |  ✅   | ✅  |   ✅   |  ✅   |
| the field (`45°`, named by Label) sets the dial, wrapped and on the step |  ✅   | ✅  |   ✅   |  ✅   |
| the field follows the dial, and its arrow keys wrap past 359°            |  ✅   | ✅  |   ✅   |  ✅   |
| controlled value followed (and wrapped) †                                |  ✅   | ✅  |   ✅   |  ✅   |
| disabled → dial and field disabled, thumb out of the tab order           |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                                       |  ✅   | ✅  |   ✅   |  ✅   |

† React, Vue and Solid keep a controlled value the consumer does not change;
Svelte's `value` is bindable, and `bind:value` receives the settled angle.
