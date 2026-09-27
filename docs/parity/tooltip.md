---
ssr: Tooltip content hidden + sized; `defaultOpen` describes the trigger
---

### Tooltip (`tooltipRecipe`: `data-size`; Ark tooltip machine)

| State                                                                  | React | Vue | Svelte | Solid |
| ---------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size on the root → content `data-size` (+ `md`); a size change follows |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                                 |  ✅   | ✅  |   ✅   |  ✅   |
| closed by default: content `hidden`, `data-state="closed"`             |  ✅   | ✅  |   ✅   |  ✅   |
| hover opens a `tooltip` the trigger's `aria-describedby` names         |  ✅   | ✅  |   ✅   |  ✅   |
| pointer leaving closes it                                              |  ✅   | ✅  |   ✅   |  ✅   |
| keyboard focus opens it; Escape closes it                              |  ✅   | ✅  |   ✅   |  ✅   |
| arrow inside the content, sized by Ark from `--arrow-size`             |  ✅   | ✅  |   ✅   |  ✅   |
| controlled `open` followed; `onOpenChange` reports the change †        |  ✅   | ✅  |   ✅   |  ✅   |
| `disabled` never opens                                                 |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the content                                  |  ✅   | ✅  |   ✅   |  ✅   |

† Ark's Svelte Tooltip.Root (5.22) never hands `open` to the machine, so a
controlled `open` did nothing there. The Svelte binding builds its Root on Ark's
`useTooltip` + `Tooltip.RootProvider` and passes `open` the way Ark's Dialog and
Popover roots do; `bind:open` stays in step.
