/** @jsxImportSource solid-js */
import { FileUpload } from "@moderno-ui/solid";

export function FileUploadSizesDemo() {
  return (
    <div class="demo-stack">
      <FileUpload size="sm" label="Small" />
      <FileUpload size="md" label="Medium" />
      <FileUpload size="lg" label="Large" />
    </div>
  );
}
