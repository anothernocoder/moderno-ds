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

- 2ef774b: Add **AngleSlider** in all four framework packages, over Ark's Angle Slider: a
  round dial to pick an angle from 0° to 359° (0° up, clockwise), with a number
  field beside it, for a gradient's direction or a rotation
  (`Root > Label + Control > Thumb + MarkerGroup > Marker`, then `Input` and
  `HiddenInput`). The root takes `size` (`sm`, `md`, `lg`, matched to the Field
  sizes), `step`, snap `marks` (Shift while dragging snaps to them) and
  `getAriaValueText` (the thumb says "45 degrees" by default). A drag past 360°
  carries on from 0°; Page Up / Page Down turn the dial 15°. Moderno adds
  `AngleSlider.Input`, an Ark NumberInput with a `°` suffix kept in step with the
  dial both ways.

  `@moderno-ui/core` gains `angleSliderRecipe` and the angle helpers the bindings
  share (`wrapAngle`, `snapAngleToStep`, `snapAngleToMarks`, `resolveAngle`,
  `angleSliderPageValue`, …).

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

- 2ed7eb4: Add **BarList** in all four framework packages: a ranking drawn as one SVG,
  one row per item with its name, a track, the bar filling it and its value
  (`root > series > row > label + track + bar + value`). It takes `width` and
  `data` (`{ name, value }[]`), plus `max`, `sort` (`descending` by default,
  `ascending`, `none`), `format`, `labelWidth`, `valueWidth`, `rowHeight` and
  `barHeight`. The list is as tall as its rows.

  `@moderno-ui/charts-core` gains `buildBarList` and `barListNodes`, the render
  tree the four bindings walk. The track and the bar paint from `--chart-1`
  through the series colour; the name and value read `--foreground` and
  `--muted-foreground`.

- 71dd05a: Add **Callout**, a CSS-only soft note in all four framework packages: a tip, a
  caveat or a heads-up inside the page's content. The anatomy is `Callout.Root >
Callout.Icon + Callout.Content(Callout.Title + Callout.Description)`, in four
  variants (`info`, `success`, `warning`, `error`). Softer than Alert: the surface
  stays `--muted` and only a stripe on the inline-start edge and the icon take the
  status colour, and the root is `role="note"` instead of a live region.

  `@moderno-ui/core` gains `calloutRecipe` and the `CalloutVariant` type.

- e382e26: Add **Carousel** in all four framework packages, over Ark's Carousel. Slides
  that scroll one page at a time, with previous and next and one dot per page
  (`Root > ItemGroup > Item…` and `Control > PrevTrigger + IndicatorGroup >
Indicator… + NextTrigger`, with `AutoplayTrigger`, `AutoplayIndicator` and
  `ProgressText` where they fit). The root takes `size` (`sm`, `md`, `lg`); every
  other part and prop is Ark's, including `slideCount`, `slidesPerPage`,
  `spacing`, `page`, `loop` and `autoplay`. When the reader prefers reduced
  motion, autoplay does not start (the autoplay trigger still starts it) and the
  controls do not animate.

  `@moderno-ui/core` gains `carouselRecipe`, `carouselMotion` and
  `REDUCED_MOTION_QUERY`.

- 4a395ab: Add **ColorPicker** in all four framework packages, over Ark's ColorPicker: a
  trigger showing the colour and its hex, and a popover with a saturation and
  brightness area, a hue slider, an optional alpha slider (`alpha`), a hex box,
  an eyedropper where the browser has one, and optional preset `swatches`. The
  value in and out is a hex string (`#RRGGBB`, or `#RRGGBBAA` with `alpha` while
  see-through): `value` / `defaultValue` / `onValueChange` (`v-model` in Vue,
  `bind:value` in Svelte). Inside a `Field`, the Field's label names the trigger
  and its helper and error text describe it. `size` (`sm`, `md`, `lg`) sizes the
  trigger; `name` submits the hex with a form; `translations` renames the parts.

  `@moderno-ui/core` gains `colorPickerRecipe`, `parseHexColor`,
  `colorPickerSwatches`, `supportsEyeDropper`, the English
  `COLOR_PICKER_TRANSLATIONS`, and the `color-picker` scope in
  `components.css`: the trigger rings inside its border, the popover is the
  `--popover` surface with its 1px `--border` edge and the `--shadow-md` drop,
  and a see-through colour sits on a checkerboard of `--muted` and
  `--background`.

- f28650e: Add **Combobox** in all four framework packages, over Ark's Combobox. A text
  input that filters a list of options as the user types
  (`Root > Label + Control > Input + Trigger + ClearTrigger`, and
  `Positioner > Content > Item > ItemText + ItemIndicator`, with optional
  `ItemGroup`, `ItemGroupLabel`, `List` and an `Empty` state). The root takes
  `size` (`sm`, `md`, `lg`); every other part and prop is Ark's, including
  `multiple`. Each package also re-exports Ark's `useListCollection` and
  `useFilter`, the two helpers that narrow the list. The control draws its focus
  ring inside its border, like Field, Select, Pin Input, Number Input and Tags
  Input.

  `@moderno-ui/core` gains `comboboxRecipe`.

- b7eea08: Lighter controls, and no focus ring on a mouse press.

  - **Slider:** smaller thumbs (`sm` 12px, `md` 16px, `lg` 20px, were 16/20/24) with a 1px border.
  - **Angle Slider:** the knob is 8px with a 1px border.
  - **Vector Pad:** the handle is 12px with a 1px border.
  - **Color Picker and Radio Group:** the selected swatch outline, the picker thumbs and the tile ring are now 1px.
  - **Focus ring:** Slider, Angle Slider and Vector Pad no longer draw it when a thumb is clicked or dragged. Ark focuses the thumb from script on pointerdown, which browsers count as `:focus-visible`. Keyboard focus still shows the ring.

  `@moderno-ui/core` gains `trackInputModality()`. It sets `data-input-modality` (`pointer`, `keyboard` or `virtual`) on `<html>` and returns a cleanup. It does nothing on the server. The Slider and Angle Slider roots in every framework package start it on mount, and the Vector Pad machine runs it itself. `@moderno-ui/css` picks up the new styles from core.

- 6035afd: Add **DatePicker** in all four framework packages, over Ark's DatePicker: a
  date field with a calendar that picks one date, several, or a range
  (`selectionMode="range"`), and formats and parses dates for its `locale`
  (`Root > Label + Control > Input + Trigger (+ ClearTrigger)`, then
  `Positioner > Content > View > ViewControl + Table > … > TableCellTrigger`).
  The root takes `size` (`sm`, `md`, `lg`) and carries `data-size`; the calendar
  usually sits in a Portal, so the size also reaches the content. Every other
  part and prop is Ark's, and each package re-exports Ark's `parseDate`.

  `@moderno-ui/core` gains `datePickerRecipe` and the `date-picker` scope in
  `components.css`: the input box rings inside its border, and the calendar is
  the `--popover` surface with its 1px `--border` edge and the `--shadow-md`
  drop. A picked day is `--primary`; the days of a range are one `--accent`
  band.

- d817e03: Add **DonutChart** in all four framework packages: an SVG ring split into one
  slice per `{ name?, value }` in `data`, in data order, clockwise from 12
  o'clock. `innerRadius` sets the hole as a fraction of the outer radius (`0`
  draws a pie; default `0.6`) and `padAngle` opens a gap between slices, in
  radians. A value of 0 or less draws no slice. Slices paint from `--chart-1`
  to `--chart-5` by their index in `data`.

  `@moderno-ui/charts-core` gains `buildDonutChart` and `donutChartNodes`, the
  render tree every binding walks; `@moderno-ui/core`'s stylesheet gains the
  `slice` part of the `chart` scope.

- 986137e: Add **Drawer** in all four framework packages, over Ark's Dialog: a modal
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

- 3437240: Add **Editable** in all four framework packages, over Ark's Editable: text that
  turns into an input to rename something in place — a layer, a slide, a file
  (`Root > Label + Area > Input + Preview`, then an optional
  `Control > EditTrigger + SubmitTrigger + CancelTrigger`). A double click starts
  an edit by default (`activationMode`: `focus`, `click`, `dblclick`), and so do
  Enter, F2 and Space on the focused text. The whole text is selected; Enter or a
  click away saves (`submitMode`), Escape cancels and puts back the value from
  before the edit. Focus goes back to the text afterwards. The root takes `size`
  (`sm`, `md`, `lg`, matched to the Field sizes); the text and the input are one
  box, so nothing moves when an edit starts. A long value is cut with an ellipsis
  and shows in full as a tooltip. Inside a Field, its label names the text and
  the input, and its helper and error text describe them.

  `@moderno-ui/core` gains `editableRecipe` and what the bindings share
  (`EDITABLE_DEFAULT_ACTIVATION_MODE`, `isEditableStartKey`,
  `editableTranslations`, `createEditableFocusReturn`, `editablePreviewTitle`, …).

- 796926f: Add **FileUpload** in all four framework packages, over Ark's FileUpload: a
  drop zone the width of its container that takes files dragged onto it or
  picked from the file dialog (click it, or Enter / Space), and the list of the
  files chosen — a thumbnail for an image, the name (truncated in the middle,
  the extension kept), the size and a remove button named for the file.
  `accept`, `maxFiles` and `maxFileSize` are checked by Ark; a file that fails
  is listed with the reason. The zone writes what it takes ("SVG or PNG, up to
  2 MB") and is named with it; inside a `Field`, the Field's label names it and
  its helper and error text describe it. `onFileChange` is called once per
  change with `{ acceptedFiles, rejectedFiles }` (`@file-change` and
  `v-model:accepted-files` in Vue, `bind:acceptedFiles` in Svelte). Added,
  removed and rejected files are announced through `announce()`. `label`,
  `size` (`sm`, `md`, `lg`) and `translations` round it out.

  `@moderno-ui/core` gains `fileUploadRecipe`, the English
  `FILE_UPLOAD_TRANSLATIONS`, `formatFileSize`, `fileUploadTypesText`,
  `fileUploadHint`, `fileUploadRejectionText`, `fileUploadAnnouncement`,
  `createFileUploadChangeReporter`, `fileUploadRemoveLabel`,
  `focusFileUploadDropzone`, `isImageFile`, `splitFileName`, and the
  `file-upload` scope in `components.css`: a dashed `--input` zone that turns
  solid `--primary` with a `--primary` tint while a file is over it, and
  `--border` rows, `--destructive` for a rejected file.

- e5c929a: Add **Menu** in all four framework packages, over Ark's Menu. A list of actions
  that opens from a button, with items, groups, separators, checkbox and radio
  items, and submenus (`Root > Trigger + Positioner > Content > Item…`, a
  submenu being a nested `Root` opened by a `TriggerItem`; `ContextTrigger` opens
  it on right-click). `Menu.Root` takes `size` (`sm`, `md`, `lg`), which lands on
  the trigger and the content; a submenu takes its parent's size unless it sets
  its own. Every other part and prop is Ark's. Under a 40rem viewport the open
  menu is a bottom sheet over an `--overlay` scrim — the first primitive on the
  stylesheet's viewport `@media` allow-list (ADR-0005).

  `@moderno-ui/core` gains `menuRecipe` and `MenuSize`.

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

- 677509c: Add **Popover** in all four framework packages, over Ark's Popover: a
  non-modal surface anchored to its trigger, with an optional arrow, title,
  description and close button
  (`Root > Trigger + Positioner > Content > Arrow > ArrowTip, Title, Description, CloseTrigger`).
  The root takes `size` (`sm`, `md`, `lg`); Ark's root renders no element, so the
  size reaches the content, which carries `data-size`. Every other part and prop
  is Ark's, including `open`, `positioning` and `modal`.

  `@moderno-ui/core` gains `popoverRecipe` and the `popover` scope in
  `components.css`: the `--popover` surface with its 1px `--border` edge and the
  `--shadow-md` drop, an arrow filled and edged to match, and a corner close
  button.

- d947a35: Add **Progress** in all four framework packages, over Ark's Progress. A bar
  (`Root > Label + ValueText + Track > Range`) or a ring
  (`Root > Circle > CircleTrack + CircleRange`, with `ValueText` in its middle)
  shows how far a task has come; a `null` value makes it indeterminate, and the
  bar slides or the ring turns. The root takes `size` (`sm`, `md`, `lg`); every
  other part and prop is Ark's, including `min`, `max` and `orientation`.

  `@moderno-ui/core` gains `progressRecipe`.

- abee231: Add a **tile** variant to RadioGroup, for picking by picture (an image picker).
  `RadioGroup.Root` takes `variant` (`list` by default, or `tile`); a tile group
  lays its items out as selectable cards in a grid that follows the group's own
  width. Unset, each row holds as many cards as fit; `columns` (1 to 6) fixes the
  count, and `aspectRatio` (`16:9` by default) sets the shape of every picture.
  Moderno adds `RadioGroup.ItemMedia`, the slot for a card's image or other
  content. The checked card shows a doubled `--primary` edge and a check badge,
  and every radio key and name works as before. `list` groups are unchanged.

  `@moderno-ui/core` gains `radioGroupAttrs` and `radioGroupColumns`, and
  `radioGroupRecipe` gains the `variant` and `aspectRatio` variants.

- 49cf29c: Add **RadioGroup** in all four framework packages, over Ark's RadioGroup:
  `Root > Label + Item (> ItemControl + ItemText + ItemHiddenInput)` plus Ark's
  `Indicator`. The user picks exactly one option from a short list, laid out in a
  column or a row (Ark's `orientation`). `RadioGroup.Root` takes `size` (`sm`,
  `md`, `lg`), and Moderno adds `RadioGroup.ItemDescription`, a hint that goes
  inside `ItemText` so screen readers read it with the label. Every other part is
  Ark's. It replaces the predecessor's Radio.

  `@moderno-ui/core` gains `radioGroupRecipe`.

- 69946ef: Add **SegmentedControl** in all four framework packages, over Ark's
  SegmentGroup: `Root > Indicator + Item (> icon + ItemText + ItemHiddenInput)`.
  Two to five options sit side by side in one track, one is selected, and a pill
  slides behind it (it holds still under `prefers-reduced-motion`). Each segment
  is a native radio, so Tab enters the group and the arrow keys move and select.
  `SegmentedControl.Root` takes `size` (`sm`, `md`, `lg`, matching Field) and
  `fullWidth`; inside a `Field`, the Field's label names it and its helper or
  error text describes it. A long label ends in an ellipsis and shows in full as
  a tooltip. Ark's `Label` is left out: name the control with `aria-label` or a
  `Field.Label`.

  `@moderno-ui/core` gains `segmentedControlRecipe`, `segmentedControlAttrs`,
  `segmentedControlFieldProps` and `syncTruncationTitle`. `moderno/no-raw-ark`
  now also suggests the Moderno component whose scope matches a raw Ark import
  (`SegmentGroup` → `SegmentedControl`).

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

- d2b686b: Add **SortableList** in all four framework packages: a vertical list whose
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

- eb32ab5: Add **Splitter** in all four framework packages, over Ark's Splitter. Panels
  sit side by side, or stacked, and the user resizes them by dragging the handle
  between them or with the keyboard
  (`Root > Panel + ResizeTrigger > ResizeTriggerIndicator + Panel …`). The root
  takes `variant` (`line`, `enclosed`); every other part and prop is Ark's,
  including `panels`, `defaultSize`, `size` and `orientation`.

  `@moderno-ui/core` gains `splitterRecipe`, and `serverDocument`: the
  document-shaped stand-in the Solid and Svelte roots hand Ark on the server,
  where zag's exit action would otherwise reach for a missing `document`.

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

- 2a93f10: Add **TagsInput** in all four framework packages, over Ark's TagsInput. A text
  box that turns what the user types into tags they can edit and remove
  (`Root > Label + Control > Item* + Input`, each
  `Item > ItemPreview > ItemText + ItemDeleteTrigger` plus `ItemInput`, with an
  optional `ClearTrigger` and a `HiddenInput` for forms). The root takes `size`
  (`sm`, `md`, `lg`); every other part and prop is Ark's, including `max`,
  `delimiter`, `editable` and `validate`. The control draws its focus ring inside
  its border, like Field, Select, Pin Input and Number Input.

  `@moderno-ui/core` gains `tagsInputRecipe`.

- 15fbb24: Add **Toast** in all four framework packages, over Ark's Toast: short
  messages that appear over the page and go away on their own
  (`Toaster > Root > Title, Description, ActionTrigger, CloseTrigger`).
  `createToaster({ placement })` makes the store you call from anywhere
  (`toaster.create`, `.success`, `.error`, `.warning`, `.info`, `.loading`,
  `.promise`, `.dismiss`), and `<Toaster>` renders its live region with one
  toast per entry. `Toast.Root` takes `size` (`sm`, `md`, `lg`); every other
  part and prop is Ark's, and `Toaster` and `createToaster` are Ark's own.

  `@moderno-ui/core` gains `toastRecipe` and the `toast` scope in
  `components.css`: the `--popover` surface with its 1px `--border` edge and the
  `--shadow-lg` drop, a tint per status from `--success`, `--warning` and
  `--destructive` (a plain `info` toast stays neutral), an outline action button
  and a corner close button. On a narrow screen a toast spans the width between
  the toaster's offsets.

- 15e6251: Add **Toggle** and **ToggleGroup** in all four framework packages, over Ark's
  Toggle (`Root > Indicator`) and ToggleGroup (`Root > Item`). A Toggle is a
  button that stays pressed until it is pressed again; a ToggleGroup is a row of
  them where one item (or, with `multiple`, several) stays pressed. Both roots
  take `variant` (`ghost`, `outline`) and `size` (`sm`, `md`, `lg`); a group's
  items follow its root. Every other part and prop is Ark's.

  `@moderno-ui/core` gains `toggleRecipe` and `toggleGroupRecipe`.

- aee39b6: Add **Toolbar** in all four framework packages: a bar of icon buttons,
  toggles, groups and separators, like the top bar of an editor
  (`Root > Button + Toggle + Group > … + Separator`). It follows the WAI-ARIA
  toolbar pattern: `role="toolbar"`, one Tab stop (the item used last), the arrow
  keys between items (Left/Right in a row, Up/Down with
  `orientation="vertical"`, swapped in `rtl`), Home and End to the ends. A
  disabled item stays in the arrow-key order, announced as disabled, and does
  nothing. An item with a `label` is icon-only: the label is its name and shows
  in a tooltip with its `shortcut`. `Toolbar.Toggle` stays pressed
  (`pressed` / `defaultPressed` / `onPressedChange`). A `Toolbar.Button` inside a
  `Menu.Trigger` (as child) opens a menu with Enter or Space (and ArrowDown in a
  row); the toolbar's arrows still move past it. `size` (`sm`, `md`, `lg`) matches
  Button's sizes; every item keeps a hit area of at least `--spacing-8` each way.

  `@moderno-ui/core` gains the toolbar machine (`toolbar.machine`,
  `toolbar.connect`), a Zag machine of its own (ADR-0010), plus
  `toolbarRecipe`, `toolbarTooltipText`, `toolbarTooltipTriggerProps`,
  `splitToolbarKeyDown` and `withoutEventHandlers`.

- 939c799: Add **Tooltip** in all four framework packages, over Ark's Tooltip. A short
  label shows while the pointer rests on its trigger or the trigger has keyboard
  focus, with an arrow pointing at it
  (`Root > Trigger + Positioner > Content > Arrow > ArrowTip`). The root takes
  `size` (`sm`, `md`, `lg`), which lands on the content as `data-size`, since
  Ark's Root renders no element; every other part and prop is Ark's, including
  `openDelay`, `closeDelay`, `positioning` and `open`.

  The content is a `--popover` surface edged by its own 1px `--border`, lifted
  by `--shadow-md`; it fades in and out over `--motion-instant`, and holds still
  under reduced motion. `@moderno-ui/core` gains `tooltipRecipe`.

  In Svelte, a controlled `open` now works: the binding passes it to the machine,
  which Ark's own Svelte Tooltip.Root does not.

- 48a1af8: Add **VectorPad** in all four framework packages: a square pad with a handle
  you drag to set two values at once (x and y: a position, an offset, a light
  direction), with a number field per axis
  (`Root > Label + Control > Grid + Crosshair + Thumb`, then `Input axis="x"` and
  `Input axis="y"`). The value is `{ x, y }`; `min`, `max` and `step` take one
  number or one per axis (default -100 to 100, step 1, starting at the centre).
  y grows upward as on a graph; `invertY` makes it grow downward as on screen.
  A press anywhere on the pad moves the handle there, a drag follows the pointer
  live and stays at the edge when it leaves the pad, and mouse, touch and pen all
  work. The handle is a `role="slider"` that says both values ("X 20, Y -10",
  `getAriaValueText` rewords it); the arrows move it one step (ten with Shift),
  and Home or a double-click return it to `defaultValue`. `onValueChangeEnd`
  reports each change once it ends: the pointer lets go, a key on the handle sets
  the value, or a number field that changed it is committed (Enter, or leaving
  the field). The root takes `size` (`sm`, `md`, `lg`, matched to the Field
  sizes).

  `@moderno-ui/core` gains a machine of its own (ADR-0010), `vectorPad`
  (`vectorPad.machine`, `vectorPad.connect`, …), and `vectorPadRecipe`.

- 18b05a6: `@moderno-ui/core` gains `announce(message, { politeness })`: it reads a
  message to screen-reader users through one visually hidden live region per
  document (`@zag-js/live-region`), `polite` unless `assertive` is asked for,
  and does nothing on the server. Core now depends on Zag (`@zag-js/core`,
  `@zag-js/anatomy`, `@zag-js/types`, `@zag-js/dom-query`,
  `@zag-js/live-region`) and is ready to export the Zag machines of Primitives
  Ark does not cover (ADR-0010). The framework packages depend on their
  `@zag-js/<framework>` binding, pinned to the Zag version Ark uses.

### Patch Changes

- f415bea: Stop the Chip label from clipping glyph descenders ("g", "p", "y"). The label
  takes its size's leading (`--leading-ui-sm`, `--leading-ui-xs` for `sm`)
  instead of the root's `line-height: 1`, so the box that truncates a long label
  fits the font's ascent and descent. Chip heights are unchanged.
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
