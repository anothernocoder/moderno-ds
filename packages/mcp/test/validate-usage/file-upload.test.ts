import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on FileUpload", () => {
  it("accepts real FileUpload usage and knows its parts", () => {
    const code = [
      'import { Field, FileUpload } from "@moderno-ui/react";',
      "",
      "<Field.Root>",
      "  <Field.Label>Logo</Field.Label>",
      '  <FileUpload size="sm" accept={["image/svg+xml", "image/png"]} maxFileSize={2000000} onFileChange={(details) => setLogo(details.acceptedFiles[0])} />',
      "</Field.Root>",
      "",
      '[data-scope="file-upload"][data-part="dropzone"][data-dragging] { border-color: var(--primary); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toEqual([]);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<FileUpload size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="file-upload"][data-part="file-list"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"file-list" is not a real part of FileUpload');
  });
});
