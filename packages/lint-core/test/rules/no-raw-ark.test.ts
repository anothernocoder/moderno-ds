import { describe, expect, it } from "vitest";
import { noRawArk } from "../../src/rules/no-raw-ark.ts";
import { manifests } from "./fixtures.ts";

function check(code: string) {
  return noRawArk.check({ code, framework: "react", manifests });
}

describe("moderno/no-raw-ark", () => {
  it("flags a named import from @ark-ui/* and suggests the matching @moderno import", () => {
    const findings = check('import { Dialog } from "@ark-ui/react";');
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: "moderno/no-raw-ark", severity: "error" });
    expect(findings[0]!.suggestion).toContain('import { Dialog } from "@moderno/react"');
  });

  it("flags a @zag-js/* import, falling back to a generic suggestion with no name match", () => {
    const findings = check('import { machine } from "@zag-js/dialog";');
    expect(findings).toHaveLength(1);
    expect(findings[0]!.suggestion).toMatch(/search_components/);
  });

  it("does not flag a @moderno import", () => {
    expect(check('import { Dialog } from "@moderno/react";')).toHaveLength(0);
  });
});
