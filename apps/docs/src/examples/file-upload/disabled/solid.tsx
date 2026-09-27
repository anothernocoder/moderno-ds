/** @jsxImportSource solid-js */
import { FileUpload } from "@moderno-ui/solid";

export function FileUploadDisabledDemo() {
  return <FileUpload label="Upload logo" accept={["image/svg+xml", "image/png"]} disabled />;
}
