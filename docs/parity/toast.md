---
ssr: Toast group region: id, `role`, `aria-live`, label and placement
---

### Toast (`toastRecipe`: `data-size` on the root; Ark toast machine)

| State                                                                  | React | Vue | Svelte | Solid |
| ---------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size on the Root → `data-size` (+ `md`)                                |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed; `Toaster` and `createToaster` are Ark's own    |  ✅   | ✅  |   ✅   |  ✅   |
| toaster renders a polite live region named after its placement         |  ✅   | ✅  |   ✅   |  ✅   |
| created toast is a `status` labelled by its title and description      |  ✅   | ✅  |   ✅   |  ✅   |
| status from Ark's `type` → `data-type` (success, error, warning, info) |  ✅   | ✅  |   ✅   |  ✅   |
| action trigger runs the action and dismisses                           |  ✅   | ✅  |   ✅   |  ✅   |
| dismissed by the close trigger, by id, and when its duration ends      |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                                     |  ✅   | ✅  |   ✅   |  ✅   |
