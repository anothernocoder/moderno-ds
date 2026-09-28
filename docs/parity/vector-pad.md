---
ssr: VectorPad handle as a slider saying both values, --vector-pad-x/-y, field values
---

### VectorPad (`vectorPadRecipe`: `data-size`; Moderno's `vectorPad` machine in core)

| State                                                                         | React | Vue | Svelte | Solid |
| ----------------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`), and the fields'                             |  ✅   | ✅  |   ✅   |  ✅   |
| root is a `group` named by Label; handle is the `slider`, "X 20, Y -10"       |  ✅   | ✅  |   ✅   |  ✅   |
| `getAriaValueText` words the spoken value                                     |  ✅   | ✅  |   ✅   |  ✅   |
| press sets x and y; a drag follows live, held at the edges past the pad       |  ✅   | ✅  |   ✅   |  ✅   |
| y grows upward; `invertY` flips the value, the handle still follows           |  ✅   | ✅  |   ✅   |  ✅   |
| arrows move by `step` (Shift ×10), Home and double-click → `defaultValue`     |  ✅   | ✅  |   ✅   |  ✅   |
| `min` / `max` / `step` for both axes or per axis                              |  ✅   | ✅  |   ✅   |  ✅   |
| each field (named "X" / "Y") moves the handle, kept in range; follows it back |  ✅   | ✅  |   ✅   |  ✅   |
| Label click focuses the handle                                                |  ✅   | ✅  |   ✅   |  ✅   |
| controlled value followed †                                                   |  ✅   | ✅  |   ✅   |  ✅   |
| disabled → pad and fields disabled, handle out of the tab order               |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root and each part                              |  ✅   | ✅  |   ✅   |  ✅   |

† React, Vue and Solid keep a controlled value the consumer does not change;
Svelte's `value` is bindable, and `bind:value` receives each value, even when
it starts unset.
