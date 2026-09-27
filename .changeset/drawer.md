---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Drawer** in all four framework packages, over Ark's Dialog: a modal
panel that slides in from one edge of the viewport, with Ark's anatomy and
part names (`Root > Trigger + Backdrop + Positioner > Content > Title, Description, CloseTrigger`).
The root takes `placement` (`left`, `right`, `top`, `bottom`; default `right`),
which reaches the positioner and the content as `data-placement`. Every part
renders under `data-scope="drawer"`. Every other prop is Ark's Dialog's,
including `open`, `modal` and `closeOnInteractOutside`.

`@moderno-ui/core` gains `drawerRecipe` and the `drawer` scope in
`components.css`: the `--overlay` scrim, the `--popover` panel with a 1px
`--border` on the side facing the page and the `--shadow-lg` drop, and a
slide in from its edge (none under `prefers-reduced-motion`).

**Dialog** now presents as a bottom Drawer on a viewport narrower than 40rem,
with no code in the app: full width, pinned to the bottom edge, top corners
rounded, sliding up. `dialog` joins the stylesheet's viewport `@media`
allow-list.
