import { FileUpload } from "@moderno-ui/react";

export function FileUploadDisabledDemo() {
  return <FileUpload label="Upload logo" accept={["image/svg+xml", "image/png"]} disabled />;
}
