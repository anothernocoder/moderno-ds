---
ssr: RadioGroup checked item + orientation + tile grid
---

### RadioGroup (`radioGroupAttrs`: `data-variant` + `data-size` + `data-columns` + `data-aspect-ratio`; Ark radio machine)

| State                                             | React | Vue | Svelte | Solid |
| ------------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`)                  |  ✅   | ✅  |   ✅   |  ✅   |
| variant → root `data-variant` (+ `list`)          |  ✅   | ✅  |   ✅   |  ✅   |
| tile: columns → `data-columns`, unset → none      |  ✅   | ✅  |   ✅   |  ✅   |
| tile: aspectRatio → `data-aspect-ratio`           |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed + `ItemDescription`        |  ✅   | ✅  |   ✅   |  ✅   |
| `ItemMedia` → `<span data-part="item-media">`     |  ✅   | ✅  |   ✅   |  ✅   |
| orientation → `data-orientation` (+ vertical)     |  ✅   | ✅  |   ✅   |  ✅   |
| group named by label, radio by text + desc.       |  ✅   | ✅  |   ✅   |  ✅   |
| tile named by its label, by image alt without one |  ✅   | ✅  |   ✅   |  ✅   |
| click picks → `data-state` + `onValueChange`      |  ✅   | ✅  |   ✅   |  ✅   |
| click on a tile's image picks it                  |  ✅   | ✅  |   ✅   |  ✅   |
| checked radio takes keyboard focus                |  ✅   | ✅  |   ✅   |  ✅   |
| arrow keys move the choice                        |  ✅   | ✅  |   ✅   |  ✅   |
| disabled option → `data-disabled`, inert          |  ✅   | ✅  |   ✅   |  ✅   |
| disabled group → every radio disabled             |  ✅   | ✅  |   ✅   |  ✅   |
| invalid → `data-invalid` + `aria-invalid`         |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                |  ✅   | ✅  |   ✅   |  ✅   |
