/**
 * FileUpload — Ark's file-upload machine behind one component. The first
 * drop zone is named by its label and the hint that says what it takes;
 * the second sits in a Field (its label names the zone and points at the
 * file input). The ids come from Ark, so both reach the server string and
 * hydrate. No file is chosen on the server, so no list renders.
 */
import { h } from "vue";
import { FileUpload } from "../../src/file-upload.js";
import { Field } from "../../src/field.js";
import type { Section } from "../section.js";

const FileUploadSection: Section = () =>
  h("section", { "aria-label": "file-upload" }, [
    h(FileUpload, {
      label: "Upload logo",
      accept: ["image/svg+xml", "image/png"],
      maxFileSize: 2_000_000,
    }),
    h(Field.Root, {}, () => [
      h(Field.Label, {}, () => "Fonts"),
      h(FileUpload, { size: "sm", accept: [".otf", ".woff2"], maxFiles: 4 }),
      h(Field.HelperText, {}, () => "Up to four weights."),
    ]),
  ]);

export default FileUploadSection;
