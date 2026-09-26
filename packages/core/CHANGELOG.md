# @moderno-ui/core

## 0.5.0

### Minor Changes

- 88a5167: Add **Accordion** in all four framework packages, over Ark's Accordion
  (`Root > Item > ItemTrigger (> ItemIndicator) + ItemContent`). An accordion is
  a stack of sections that open and close under their own headers; one item is
  open at a time unless `multiple`, and `collapsible` lets the open one close.
  The content's height animates open and closed. The root takes `variant`
  (`line`, `enclosed`) and `size` (`sm`, `md`, `lg`); every item follows it.
  Every other part and prop is Ark's.

  `@moderno-ui/core` gains `accordionRecipe`.

- 9193504: Add **Avatar** in all four framework packages, over Ark's Avatar: `Root > Image +
Fallback`. The fallback (the initials) shows while the image loads and when it
  fails; the image shows once it has loaded. `Avatar.Root` takes `size` (`sm`,
  `md`, `lg`) and `shape` (`circle` for a person, `square` for a team or a
  product); every other part is Ark's.

  `@moderno-ui/core` gains `avatarRecipe`.

- c7d3d87: Add three CSS-only primitives in all four framework packages:

  - **Badge** — a short status label (`neutral`, `solid`, `outline`, and the
    `info`/`success`/`warning`/`error` statuses) at two sizes, with an optional
    leading `dot`.
  - **Chip** — a compact token (`outline`, `muted`, `solid`) whose `removable`
    flag adds a named remove button reporting through `onRemove` (Vue: `@remove`).
  - **Indicator** — a status dot with an optional label and a `pulse` ring that
    stops under `prefers-reduced-motion`. A bare dot named by `aria-label` gets
    `role="img"`, so screen readers read its status.

  `@moderno-ui/core` gains `badgeRecipe`, `chipRecipe`, `indicatorRecipe`,
  `indicatorAttrs` and `indicatorRole`. `moderno/valid-props` no longer folds a Vue `aria-*`/`data-*`
  attribute to camelCase and reports it as an unknown prop.

- 71dd05a: Add **Callout**, a CSS-only soft note in all four framework packages: a tip, a
  caveat or a heads-up inside the page's content. The anatomy is `Callout.Root >
Callout.Icon + Callout.Content(Callout.Title + Callout.Description)`, in four
  variants (`info`, `success`, `warning`, `error`). Softer than Alert: the surface
  stays `--muted` and only a stripe on the inline-start edge and the icon take the
  status colour, and the root is `role="note"` instead of a live region.

  `@moderno-ui/core` gains `calloutRecipe` and the `CalloutVariant` type.

- e601e4e: Add **NumberInput** in all four framework packages, over Ark's NumberInput. A
  text box for a number with buttons that step it up and down
  (`Root > Label + Control > Input + DecrementTrigger + IncrementTrigger`, with an
  optional `Scrubber` and `ValueText`). The root takes `size` (`sm`, `md`, `lg`);
  every other part and prop is Ark's, including `min`, `max`, `step` and
  `formatOptions`. The control draws its focus ring inside its border, like Field,
  Select and Pin Input.

  `@moderno-ui/core` gains `numberInputRecipe`.

- 9fef080: Add **Pagination** in all four framework packages, over Ark's Pagination. A row
  of page buttons with previous and next that skips far pages behind an ellipsis
  (`Root > FirstTrigger? + PrevTrigger + Item… / Ellipsis… + NextTrigger +
LastTrigger?`, with the page list from `Context`). The root takes `size` (`sm`,
  `md`, `lg`); every other part and prop is Ark's, including `count`, `pageSize`,
  `page` and `siblingCount`. The current page is outlined, and every button draws
  its focus ring inside its edge.

  `@moderno-ui/core` gains `paginationRecipe`.

- d947a35: Add **Progress** in all four framework packages, over Ark's Progress. A bar
  (`Root > Label + ValueText + Track > Range`) or a ring
  (`Root > Circle > CircleTrack + CircleRange`, with `ValueText` in its middle)
  shows how far a task has come; a `null` value makes it indeterminate, and the
  bar slides or the ring turns. The root takes `size` (`sm`, `md`, `lg`); every
  other part and prop is Ark's, including `min`, `max` and `orientation`.

  `@moderno-ui/core` gains `progressRecipe`.

- 49cf29c: Add **RadioGroup** in all four framework packages, over Ark's RadioGroup:
  `Root > Label + Item (> ItemControl + ItemText + ItemHiddenInput)` plus Ark's
  `Indicator`. The user picks exactly one option from a short list, laid out in a
  column or a row (Ark's `orientation`). `RadioGroup.Root` takes `size` (`sm`,
  `md`, `lg`), and Moderno adds `RadioGroup.ItemDescription`, a hint that goes
  inside `ItemText` so screen readers read it with the label. Every other part is
  Ark's. It replaces the predecessor's Radio.

  `@moderno-ui/core` gains `radioGroupRecipe`.

- cbab2a4: Add two CSS-only loading primitives in all four framework packages:

  - **Skeleton** — a muted placeholder in a `text`, `rect` or `circle` shape. It
    is `aria-hidden`, sized by the consumer like the content it replaces, and its
    pulse stops under `prefers-reduced-motion`.
  - **Spinner** — an indeterminate ring at three sizes (`sm`, `md`, `lg`). The
    root is `role="status"` with a visually hidden `label` (default "Loading").
    The ring paints with the surrounding text colour and turns slower under
    `prefers-reduced-motion`.

  `@moderno-ui/core` gains `skeletonRecipe` and `spinnerRecipe`.

- 94c8e8c: Add **Slider** in all four framework packages, over Ark's Slider. One thumb
  picks a number; two pick a range
  (`Root > Label + ValueText + Control > (Track > Range) + Thumb`, with marks in
  `MarkerGroup > Marker` and an optional `DraggingIndicator` bubble in a thumb).
  The root takes `size` (`sm`, `md`, `lg`); every other part and prop is Ark's,
  including `min`, `max`, `step` and `orientation`.

  `@moderno-ui/core` gains `sliderRecipe`.

- 8cb82f1: Add **Switch** in all four framework packages, over Ark's Switch: `Root > Control
(> Thumb) + Label + HiddenInput`. It turns one setting on or off, and the change
  applies at once. `Switch.Root` takes `size` (`sm`, `md`, `lg`);
  `Switch.HiddenInput` gets `role="switch"` so screen readers announce a switch,
  not a checkbox. Every other part is Ark's. It replaces the predecessor's Toggle.

  `@moderno-ui/core` gains `switchRecipe`.

- 95d7aff: Add **Tabs** in all four framework packages, over Ark's Tabs
  (`Root > List > Trigger + Indicator`, then one `Content` per tab). Tabs switch
  between panels of content in the same place; they lay out in a row or, with
  `orientation="vertical"`, a column. The root takes `variant` (`line`,
  `enclosed`) and `size` (`sm`, `md`, `lg`); the list, triggers and indicator
  follow it. Every other part and prop is Ark's.

  `@moderno-ui/core` gains `tabsRecipe`.

- 15e6251: Add **Toggle** and **ToggleGroup** in all four framework packages, over Ark's
  Toggle (`Root > Indicator`) and ToggleGroup (`Root > Item`). A Toggle is a
  button that stays pressed until it is pressed again; a ToggleGroup is a row of
  them where one item (or, with `multiple`, several) stays pressed. Both roots
  take `variant` (`ghost`, `outline`) and `size` (`sm`, `md`, `lg`); a group's
  items follow its root. Every other part and prop is Ark's.

  `@moderno-ui/core` gains `toggleRecipe` and `toggleGroupRecipe`.

### Patch Changes

- 7ea4320: Draw the focus ring of Field inputs, Select triggers and Pin Input cells inset
  (`outline-offset: -2px`), so it covers the 1px border instead of floating
  outside it and showing a double border on focus.
- 7329652: Make the Select trigger fill its root, like the Field input does, instead of
  shrinking to its content. A Select given a width now shows a trigger of that
  width, and it lines up with Field in a form.

## 0.4.0

### Minor Changes

- 1e64683: Add the Alert primitive: a CSS-only, inline status message with an
  `root > icon + content(> title + description + action)` anatomy, in
  `info`/`success`/`warning`/`error` at two densities, in all four framework
  packages.

  The token contract grows three status slot pairs — `--info`, `--success`,
  `--warning` and their foregrounds — so a status surface can be painted from the
  contract instead of literals; `error` reuses `--destructive`. Themes now define
  all four statuses in both scopes.

- eef00c8: Field gains a `size` recipe (`sm` | `md` | `lg`, default `md`) on `Field.Root`, plus
  Input/Textarea craft in the shared stylesheet.

  `fieldRecipe` in `@moderno-ui/core` resolves the prop to a single `data-size` on the
  root part, and `components.css` sizes every part from it: label, control height and
  padding, and helper/error text. `Field.Root` is now a thin wrapper in all four
  bindings (every other part stays Ark's verbatim). The controls also gain a hover
  border, a transition, a `--destructive`-tinted invalid state that keeps its colour
  while focused, a `--muted` disabled fill, and a per-size minimum height with
  vertical-only resize on the textarea.

- efc795c: Add the Divider primitive: a CSS-only horizontal or vertical rule with an optional label, in all four framework bindings. `dividerRecipe` (`orientation` × `align`) resolves to `data-*` on `[data-scope="divider"][data-part="root"]`; the stroke is drawn by `components.css` from the `--border` slot via the root's `::before`/`::after`, so a bare divider is one continuous line and a captioned one splits around `[data-part="label"]`.
- 2100633: Add the PinInput primitive: a one-time-code input over Ark's PinInput machine —
  focus advances as characters land, a pasted code is distributed across the
  cells, `mask` swaps them to `type="password"`, `otp` asks for
  `autocomplete="one-time-code"`, and `invalid` mirrors onto `aria-invalid` — in
  all four framework packages.

  Anatomy `root > label + control(> input × n) + hiddenInput` under
  `data-scope="pin-input"`, with the new `pinInputRecipe`'s `data-size`
  (`sm`/`md`/`lg`) on the root; the filled, complete and invalid states are Ark's
  own `data-*`, styled in the shared `components.css`.

- 0ed984d: Card — a CSS-only surface primitive with an Ark-style anatomy (`root`, `header`,
  `title`, `description`, `content`, `footer`) in all four framework packages,
  styled from `[data-scope="card"]` in the shared `components.css`.
  `cardRecipe` (`variant` × `size`) resolves props to `data-*`; the surface paints
  from `--card`/`--border` with no shadow, and its corner follows `--radius`
  (which `theme-moderno` pins to 0).

  `@moderno-ui/lint-core` now recognises a compound primitive's `<Name.Root …>`
  invocation as a usage of `Name`, so `valid-props` checks Card's and Select's
  root props instead of skipping them.

### Patch Changes

- 3be5002: Button no longer inherits two browser defaults. The root clears the UA `buttonface`
  fill, so `variant="ghost"` is transparent without a consumer preflight, and a
  native `disabled` button now gets the same dimmed, non-interactive look as
  `[data-disabled]` (previously it looked enabled).
- 36a7aa6: Add font weights to the token contract: `--font-weight-normal` (400),
  `--font-weight-medium` (500), `--font-weight-semibold` (600) and
  `--font-weight-bold` (700), extended slots with the DTCG `$type` `fontWeight`.
  They reuse Tailwind v4's own `--font-weight-*` keys at Tailwind's own values, so
  stock `font-medium` / `font-semibold` utilities follow a theme that overrides a
  weight, with or without the preset and with no change when none does. Component
  styles in `@moderno-ui/core` now read these slots instead of literal weights,
  with no visual change. `get_contract` reports them in the `type` slot family.
- f021f0d: Add a type scale to the token contract: a size and a line height per step
  (`--text-<step>` / `--leading-<step>`) for `ui-xs|sm|md|lg` (12/13/14/15px) and
  `body`, `body-lg`, `heading-sm`, `heading`, `heading-lg` (16/18/20/24/36px).
  They are extended slots with neutral defaults in `@moderno-ui/css`, and the
  Tailwind preset maps them to `text-ui-sm`, `text-body`… (size and line height
  in one class) and `leading-*`. The step names avoid Tailwind's own text keys,
  so a stock `text-sm` keeps its size. Component styles in `@moderno-ui/core` now
  read these slots instead of literal sizes, with no visual change.
  `get_contract` reports them as the `type` slot family.
