---
ssr: FileUpload root `data-size`, zone role/tabindex/name from the hint, Field label → file input, zone labelled by the Field
---

### FileUpload (`fileUploadRecipe`: `data-size` on the root; Ark file-upload machine)

| State / prop                                                                    | React | Vue | Svelte | Solid |
| ------------------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`); native props forwarded to the root            |  ✅   | ✅  |   ✅   |  ✅   |
| zone is a focusable button named for what it takes; hint written inside         |  ✅   | ✅  |   ✅   |  ✅   |
| click, Enter and Space open the file dialog                                     |  ✅   | ✅  |   ✅   |  ✅   |
| picked or dropped files listed: thumbnail (images), name, size, remove button   |  ✅   | ✅  |   ✅   |  ✅   |
| `data-dragging` on the zone while files are over it                             |  ✅   | ✅  |   ✅   |  ✅   |
| `accept`, `maxFiles`, `maxFileSize`: rejected files listed with the reason      |  ✅   | ✅  |   ✅   |  ✅   |
| one `onFileChange` per change with both lists (`@file-change` in Vue)           |  ✅   | ✅  |   ✅   |  ✅   |
| remove button named "Remove <file>"; focus moves to the zone                    |  ✅   | ✅  |   ✅   |  ✅   |
| added, removed and rejected files announced through `announce()`                |  ✅   | ✅  |   ✅   |  ✅   |
| long names truncated in the middle, extension kept                              |  ✅   | ✅  |   ✅   |  ✅   |
| `disabled`: no dialog, zone `aria-disabled`                                     |  ✅   | ✅  |   ✅   |  ✅   |
| inside a Field: its label names the zone, helper/error describe it, state flows |  ✅   | ✅  |   ✅   |  ✅   |
| controlled list (`v-model:accepted-files` in Vue, `bind:acceptedFiles` Svelte)  |  ✅   | ✅  |   ✅   |  ✅   |
| `translations` rename the words                                                 |  ✅   | ✅  |   ✅   |  ✅   |
