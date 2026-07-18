import { describe, expect, it } from "vitest";
import { noHardcodedColor } from "../../src/rules/no-hardcoded-color.ts";
import { manifests } from "./fixtures.ts";

function check(code: string) {
  return noHardcodedColor.check({ code, framework: "react", manifests });
}

describe("moderno/no-hardcoded-color", () => {
  it("flags a hex color literal", () => {
    const findings = check('<div style={{ color: "#ff0000" }} />');
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: "moderno/no-hardcoded-color", severity: "error" });
    expect(findings[0]!.suggestion).toContain("--background");
  });

  it("flags rgb()/hsl()/oklch() functional colors", () => {
    const findings = check(
      "a { color: rgb(255, 0, 0); border-color: hsl(0 0% 0%); background: oklch(0.7 0.1 30); }",
    );
    expect(findings).toHaveLength(3);
  });

  it("does not flag a var(--slot) reference", () => {
    expect(check("a { color: var(--primary); }")).toHaveLength(0);
  });

  it("reports the 1-based line/col of the literal", () => {
    const code = 'a\nb { color: "#123"; }';
    const findings = check(code);
    expect(findings[0]!.loc).toEqual({ line: 2, col: 13 });
  });
});
