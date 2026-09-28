---
ssr: SortableList `<ul>` with one Tab stop, named handles, disabled item and list
---

### SortableList (`sortableListRecipe`: `data-size`; sortable-list machine in core)

| State                                                                         | React | Vue | Svelte | Solid |
| ----------------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`)                                              |  ✅   | ✅  |   ✅   |  ✅   |
| `<ul role="list">` of `<li>` items; native props forwarded to the root        |  ✅   | ✅  |   ✅   |  ✅   |
| one Tab stop; Up / Down / Home / End move focus between the triggers          |  ✅   | ✅  |   ✅   |  ✅   |
| Left / Right move between an item's handle and its trigger                    |  ✅   | ✅  |   ✅   |  ✅   |
| Space picks up (on the handle, or on the trigger when there is none)          |  ✅   | ✅  |   ✅   |  ✅   |
| arrows move, Space drops, Escape cancels; focus stays on the moved item       |  ✅   | ✅  |   ✅   |  ✅   |
| each step announced through `announce()`                                      |  ✅   | ✅  |   ✅   |  ✅   |
| handle named "Reorder <label>"; Space on a trigger with a handle still clicks |  ✅   | ✅  |   ✅   |  ✅   |
| pointer drag past the threshold; a shorter press stays a click                |  ✅   | ✅  |   ✅   |  ✅   |
| `onReorder` with the new order; controlled `items` followed †                 |  ✅   | ✅  |   ✅   |  ✅   |
| `defaultItems`: the list holds the order and hands it to its children ‡       |  ✅   | ✅  |   ✅   |  ✅   |
| disabled list → nothing moves, handles disabled, triggers still work          |  ✅   | ✅  |   ✅   |  ✅   |
| disabled item → it does not move; the others move past it                     |  ✅   | ✅  |   ✅   |  ✅   |

† React and Solid pair `items` with `onReorder`; Vue emits `reorder` and
`update:items` (`v-model:items`); Svelte's `items` is bindable (`bind:items`).

‡ React: a children function `(items) => …`; Vue: the default slot's
`{ items }`; Svelte: the `children` snippet's argument; Solid: a children
function that receives an accessor, `(items) => <For each={items()}>`.
