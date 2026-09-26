---
ssr: Slider thumbs, bounds, range offsets + marks
---

### Slider (`sliderRecipe`: `data-size`; Ark slider machine)

| State                                                                | React | Vue | Svelte | Solid |
| -------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`)                                     |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                               |  ✅   | ✅  |   ✅   |  ✅   |
| thumb is the `slider` (`aria-valuenow`/min/max), labelled by Label   |  ✅   | ✅  |   ✅   |  ✅   |
| range offsets inline on the root; hidden input carries the value     |  ✅   | ✅  |   ✅   |  ✅   |
| range: two thumbs bound each other; value text lists both †          |  ✅   | ✅  |   ✅   |  ✅   |
| markers → `data-state` under / at / over the value                   |  ✅   | ✅  |   ✅   |  ✅   |
| arrow keys and End step the value; `onValueChange` reports it        |  ✅   | ✅  |   ✅   |  ✅   |
| controlled value followed                                            |  ✅   | ✅  |   ✅   |  ✅   |
| disabled → `data-disabled` on every part, thumb out of the tab order |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                                   |  ✅   | ✅  |   ✅   |  ✅   |

† Ark's Solid `ValueText` joins a range's values with a bare comma (`20,80`);
React, Vue and Svelte write `20, 80`.
