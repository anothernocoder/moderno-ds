---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **DatePicker** in all four framework packages, over Ark's DatePicker: a
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
