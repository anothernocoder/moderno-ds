---
ssr: SegmentedControl checked segment + hidden indicator
---

### SegmentedControl (`segmentedControlAttrs`: `data-size`, `data-full-width`; Ark segment group)

| State                                                  | React | Vue | Svelte | Solid |
| ------------------------------------------------------ | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`); fullWidth → flag     |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part but `Label`; `Root`, `ItemText` wrapped |  ✅   | ✅  |   ✅   |  ✅   |
| segments in a row (`data-orientation="horizontal"`)    |  ✅   | ✅  |   ✅   |  ✅   |
| group named by `aria-label`, radio by its text         |  ✅   | ✅  |   ✅   |  ✅   |
| icon-only segment named by a `hidden` ItemText         |  ✅   | ✅  |   ✅   |  ✅   |
| click picks → `data-state` + `onValueChange`           |  ✅   | ✅  |   ✅   |  ✅   |
| controlled value followed both ways                    |  ✅   | ✅  |   ✅   |  ✅   |
| Tab enters on the checked radio; arrows move + pick    |  ✅   | ✅  |   ✅   |  ✅   |
| disabled segment → `data-disabled`, inert              |  ✅   | ✅  |   ✅   |  ✅   |
| disabled control → every radio disabled                |  ✅   | ✅  |   ✅   |  ✅   |
| cut-off label titled with its full text on hover       |  ✅   | ✅  |   ✅   |  ✅   |
| in a Field: named by its label, described by its text  |  ✅   | ✅  |   ✅   |  ✅   |
| in a Field: follows its disabled + invalid             |  ✅   | ✅  |   ✅   |  ✅   |

Controlled use differs by binding, as Ark's does: React and Solid take `value`
with `onValueChange`, Vue binds `v-model` (`modelValue`), Svelte binds
`bind:value`. Ark-Vue's segment group Root leaves `invalid` and `required` out
of its props, so the Vue Root runs Ark's `useSegmentGroup` behind Ark's
`RootProvider` to hand every machine prop to the machine.
