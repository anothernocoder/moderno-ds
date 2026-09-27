---
ssr: TagsInput tags, delete labels + hidden value
---

### TagsInput (`tagsInputRecipe`: `data-size`; Ark tags-input machine)

| State                                                                     | React | Vue | Svelte | Solid |
| ------------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`)                                          |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                                    |  ✅   | ✅  |   ✅   |  ✅   |
| input named by Label; each delete trigger named by its tag                |  ✅   | ✅  |   ✅   |  ✅   |
| Enter and the delimiter add a tag; `onValueChange` reports                |  ✅   | ✅  |   ✅   |  ✅   |
| delete trigger removes a tag; Backspace highlights, then removes the last |  ✅   | ✅  |   ✅   |  ✅   |
| Enter on a highlighted tag edits it in place (`item-input`)               |  ✅   | ✅  |   ✅   |  ✅   |
| clear trigger removes every tag, then hides; root `data-empty`            |  ✅   | ✅  |   ✅   |  ✅   |
| a duplicate is dropped; a tag past `max` is refused                       |  ✅   | ✅  |   ✅   |  ✅   |
| `validate` rejects → `onValueInvalid` (`invalidTag`)                      |  ✅   | ✅  |   ✅   |  ✅   |
| controlled value followed                                                 |  ✅   | ✅  |   ✅   |  ✅   |
| `invalid` → `data-invalid` on the control, `aria-invalid` on the input    |  ✅   | ✅  |   ✅   |  ✅   |
| disabled → `data-disabled` on every part, input and delete triggers off   |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                                        |  ✅   | ✅  |   ✅   |  ✅   |
