---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **FileUpload** in all four framework packages, over Ark's FileUpload: a
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
