---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **SortableList** in all four framework packages: a vertical list whose
items the user reorders by dragging (mouse, touch, pen) or with the keyboard
(`Root > Item > ItemHandle (optional) + ItemTrigger`). It moves items only; the
items keep any content. `onReorder` reports the new order, and `items` controls
it (`v-model:items` in Vue, `bind:items` in Svelte); with `defaultItems` the
list keeps the order and hands it to its children.

Drag an item by its handle, or by the whole item when it has no handle. A
small threshold keeps a click on a button inside an item a click; the other
items step aside to show where it will land; the list scrolls near its edges;
the item glides into place (not with reduced motion). The list is one Tab
stop: Up, Down, Home and End move focus, Left and Right move between an item's
handle and trigger, Space picks up, the arrows move, Space drops and Escape
cancels. Focus stays on the moved item, and each step is announced through
`announce()`. `disabled` works for the list and for one item; the root takes
`size` (`sm`, `md`, `lg`).

`@moderno-ui/core` gains the first machine under ADR-0010, `sortableList`
(`machine`, `connect`, `anatomy`), plus `sortableListRecipe` and
`sortableListGripIcon`.
