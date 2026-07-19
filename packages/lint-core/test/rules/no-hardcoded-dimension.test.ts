import { describe, expect, it } from "vitest";
import { noHardcodedDimension } from "../../src/rules/no-hardcoded-dimension.ts";
import { manifests } from "./fixtures.ts";

function check(code: string) {
  return noHardcodedDimension.check({ code, framework: "react", manifests });
}

describe("moderno/no-hardcoded-dimension", () => {
  it("flags a hardcoded border-radius in px", () => {
    const findings = check("a { border-radius: 6px; }");
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "moderno/no-hardcoded-dimension",
      severity: "error",
    });
    expect(findings[0]!.message).toContain('"6px"');
    expect(findings[0]!.suggestion).toContain("--radius");
  });

  it("flags a hardcoded border-radius in rem", () => {
    expect(check("a { border-radius: 0.5rem; }")).toHaveLength(1);
  });

  it("does not flag a var(--radius) reference", () => {
    expect(check("a { border-radius: var(--radius); }")).toHaveLength(0);
  });
});
