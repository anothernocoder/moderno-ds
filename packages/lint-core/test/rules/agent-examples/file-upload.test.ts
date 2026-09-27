import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real FileUpload manifest", () => {
  it("accepts its own props and Ark's on the root", () => {
    expect(
      check(
        '<FileUpload size="sm" label="Upload logo" accept={["image/png"]} maxFiles={3} maxFileSize={2000000} name="logo" invalid defaultAcceptedFiles={files} />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<FileUpload size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
