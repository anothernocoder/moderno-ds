/** @jsxImportSource solid-js */
import { FileUpload } from "@moderno-ui/solid";

export function FileUploadMultipleDemo() {
  return <FileUpload label="Upload fonts" accept={[".otf", ".ttf", ".woff2"]} maxFiles={4} />;
}
