---
ssr: Pagination pages, ellipses, current + ends
---

### Pagination (`paginationRecipe`: `data-size`; Ark pagination machine)

| State                                                                       | React | Vue | Svelte | Solid |
| --------------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`)                                            |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                                      |  ✅   | ✅  |   ✅   |  ✅   |
| root is a `<nav>` landmark named "pagination"                               |  ✅   | ✅  |   ✅   |  ✅   |
| `Context` pages → items + ellipses (`1 … 4 5 6 … 10`)                       |  ✅   | ✅  |   ✅   |  ✅   |
| current item → `data-selected` + `aria-current="page"`; items named         |  ✅   | ✅  |   ✅   |  ✅   |
| clicking an item goes there; `onPageChange` reports page + pageSize         |  ✅   | ✅  |   ✅   |  ✅   |
| prev/next step, first/last jump                                             |  ✅   | ✅  |   ✅   |  ✅   |
| prev/first disabled on page 1, next/last on the last (`disabled` + data-\*) |  ✅   | ✅  |   ✅   |  ✅   |
| triggers named for screen readers                                           |  ✅   | ✅  |   ✅   |  ✅   |
| `count` ÷ `pageSize` → pages; `siblingCount` widens the window              |  ✅   | ✅  |   ✅   |  ✅   |
| controlled page followed                                                    |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                                          |  ✅   | ✅  |   ✅   |  ✅   |
| `boundaryCount`                                                             |  ✅   | ❌† |   ✅   |  ✅   |

† Ark's Vue Pagination does not declare `boundaryCount`; the attribute falls
through to the `<nav>` and the machine keeps its default of 1.
