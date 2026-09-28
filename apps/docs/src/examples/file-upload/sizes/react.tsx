import { FileUpload } from "@moderno-ui/react";

export function FileUploadSizesDemo() {
  return (
    <div className="demo-stack">
      <FileUpload size="sm" label="Small" />
      <FileUpload size="md" label="Medium" />
      <FileUpload size="lg" label="Large" />
    </div>
  );
}
