import { Field, FileUpload } from "@moderno-ui/react";

export function FileUploadFieldDemo() {
  return (
    <Field.Root>
      <Field.Label>Logo</Field.Label>
      <FileUpload accept={["image/svg+xml", "image/png"]} maxFileSize={2_000_000} />
      <Field.HelperText>A square logo works best.</Field.HelperText>
    </Field.Root>
  );
}
