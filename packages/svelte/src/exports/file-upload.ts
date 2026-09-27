/**
 * FileUpload — a drop zone over Ark's file-upload machine that takes files
 * dragged onto it or picked from the file dialog, and the list of the files
 * chosen: a thumbnail for an image, the name and size, and a remove button.
 * Files it turns away are listed with the reason. `acceptedFiles` is bindable.
 */
export { default as FileUpload } from "../FileUpload.svelte";
export type { FileUploadFileChangeDetails, FileUploadProps } from "../file-upload-props.js";
export type { FileUploadAccept, FileUploadSize, FileUploadTranslations } from "@moderno-ui/core";
