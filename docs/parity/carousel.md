---
ssr: Carousel region, slides, current dot + ends
---

### Carousel (`carouselRecipe`: `data-size`; Ark carousel machine)

| State                                                                      | React | Vue | Svelte | Solid |
| -------------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`)                                           |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                                     |  ✅   | ✅  |   ✅   |  ✅   |
| root is a region, `aria-roledescription="carousel"`; slides named "n of N" |  ✅   | ✅  |   ✅   |  ✅   |
| one indicator per page, named; current → `data-current`; progress text     |  ✅   | ✅  |   ✅   |  ✅   |
| next/prev step a page; `onPageChange` reports page + snap point            |  ✅   | ✅  |   ✅   |  ✅   |
| clicking an indicator goes to its page                                     |  ✅   | ✅  |   ✅   |  ✅   |
| prev disabled on the first page, next on the last (native `disabled`)      |  ✅   | ✅  |   ✅   |  ✅   |
| `loop` wraps from the last page to the first                               |  ✅   | ✅  |   ✅   |  ✅   |
| `slidesPerPage` groups slides into pages                                   |  ✅   | ✅  |   ✅   |  ✅   |
| controlled page followed                                                   |  ✅   | ✅  |   ✅   |  ✅   |
| `autoplay` plays (`data-pressed` on the autoplay trigger)                  |  ✅   | ✅  |   ✅   |  ✅   |
| reduced motion holds autoplay; the autoplay trigger still starts it        |  ✅   | ✅  |   ✅   |  ✅   |
| reduced motion turned on while playing stops it                            |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                                         |  ✅   | ✅  |   ✅   |  ✅   |
