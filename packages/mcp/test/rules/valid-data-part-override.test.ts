import { describe, expect, it } from "vitest";
import { validDataPartOverride } from "../../src/rules/valid-data-part-override.ts";
import { manifests } from "./fixtures.ts";

function check(code: string) {
  return validDataPartOverride.check({ code, framework: "react", manifests });
}

describe("moderno/valid-data-part-override", () => {
  it("flags a data-part that doesn't exist on the target primitive", () => {
    const findings = check('[data-scope="dialog"][data-part="header"] { color: var(--foreground); }');
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: "moderno/valid-data-part-override", severity: "error" });
    expect(findings[0]!.message).toContain('"header" is not a real part of Dialog');
  });

  it("accepts a real (scope, part) pair", () => {
    expect(check('[data-scope="dialog"][data-part="title"] { }')).toHaveLength(0);
  });

  it("accepts either attribute order", () => {
    expect(check('[data-part="title"][data-scope="dialog"] { }')).toHaveLength(0);
  });

  it("flags an unknown scope", () => {
    const findings = check('[data-scope="tooltip"][data-part="content"] { }');
    expect(findings[0]!.message).toContain('No Moderno component has data-scope="tooltip"');
  });

  it("suggests the closest real part for a near-miss typo", () => {
    const findings = check('[data-scope="dialog"][data-part="titel"] { }');
    expect(findings[0]!.suggestion).toContain('"title"');
  });
});
