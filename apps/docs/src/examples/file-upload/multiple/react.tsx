import { FileUpload } from "@moderno-ui/react";

export function FileUploadMultipleDemo() {
  return <FileUpload label="Upload fonts" accept={[".otf", ".ttf", ".woff2"]} maxFiles={4} />;
}
