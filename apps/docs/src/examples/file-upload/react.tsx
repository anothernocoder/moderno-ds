import { FileUpload } from "@moderno-ui/react";

export function FileUploadDemo() {
  return (
    <FileUpload
      label="Upload logo"
      accept={["image/svg+xml", "image/png"]}
      maxFileSize={2_000_000}
    />
  );
}
