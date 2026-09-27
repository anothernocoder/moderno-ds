/**
 * FileUpload — Ark's file-upload machine behind one component. The first
 * drop zone is named by its label and the hint that says what it takes;
 * the second sits in a Field (its label names the zone and points at the
 * file input). The ids come from Ark, so both reach the server string and
 * hydrate. No file is chosen on the server, so no list renders.
 */
import { FileUpload } from "../../src/file-upload.jsx";
import { Field } from "../../src/field.jsx";
import type { Section } from "../section.js";

const FileUploadSection: Section = () => (
  <section aria-label="file-upload">
    <FileUpload
      label="Upload logo"
      accept={["image/svg+xml", "image/png"]}
      maxFileSize={2_000_000}
    />
    <Field.Root>
      <Field.Label>Fonts</Field.Label>
      <FileUpload size="sm" accept={[".otf", ".woff2"]} maxFiles={4} />
      <Field.HelperText>Up to four weights.</Field.HelperText>
    </Field.Root>
  </section>
);

export default FileUploadSection;
