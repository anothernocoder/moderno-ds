---
ssr: Editable text as a named button, hidden input named by the label, button names
---

### Editable (`editableRecipe`: `data-size`; Ark editable machine)

| State                                                                        | React | Vue | Svelte | Solid |
| ---------------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`)                                             |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                                       |  ✅   | ✅  |   ✅   |  ✅   |
| text is a `button` named by Label + value; input named by Label              |  ✅   | ✅  |   ✅   |  ✅   |
| double click starts an edit; `activationMode` click / focus                  |  ✅   | ✅  |   ✅   |  ✅   |
| Enter, F2 or Space on the focused text starts an edit                        |  ✅   | ✅  |   ✅   |  ✅   |
| an edit starts with the whole text selected                                  |  ✅   | ✅  |   ✅   |  ✅   |
| Enter saves (`onValueCommit`); Escape puts back the value, even an empty one |  ✅   | ✅  |   ✅   |  ✅   |
| blur saves; with `submitMode` enter, blur cancels                            |  ✅   | ✅  |   ✅   |  ✅   |
| focus back to the text after a save or a cancel (no new edit in focus mode)  |  ✅   | ✅  |   ✅   |  ✅   |
| edit / save / cancel buttons, named by their words                           |  ✅   | ✅  |   ✅   |  ✅   |
| controlled value followed †                                                  |  ✅   | ✅  |   ✅   |  ✅   |
| `placeholder` shown when empty; `maxLength` on the input                     |  ✅   | ✅  |   ✅   |  ✅   |
| disabled / readOnly → out of the tab order, never an input                   |  ✅   | ✅  |   ✅   |  ✅   |
| a cut-short value shows in full as a tooltip                                 |  ✅   | ✅  |   ✅   |  ✅   |
| in a Field: its label names both, its helper / error text describe both      |  ✅   | ✅  |   ✅   |  ✅   |
| value rendered as text, never as HTML                                        |  ✅   | ✅  |   ✅   |  ✅   |

† React, Vue and Solid keep a controlled value the consumer does not change;
Svelte's `value` is bindable, and `bind:value` receives each change.
