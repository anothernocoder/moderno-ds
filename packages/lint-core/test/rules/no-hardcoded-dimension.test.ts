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

/**
 * Blocks author with the Tailwind preset (#77), so the length a block would
 * hardcode arrives as `class="w-[320px]"`, not as a CSS declaration. Same
 * contract breach, same rule id.
 */
describe("moderno/no-hardcoded-dimension — Tailwind arbitrary lengths", () => {
  it("flags a raw length smuggled into a utility's arbitrary value", () => {
    const findings = check('<section class="w-[320px]">');
    expect(findings).toHaveLength(1);
    expect(findings[0]!.message).toContain("w-[320px]");
    expect(findings[0]!.suggestion).toContain("max-w-sm");
  });

  it("flags every dimension family, through variant prefixes and negatives", () => {
    const code =
      '<div class="max-w-[42rem] @md:gap-[13px] -mt-[3px] rounded-tl-[4px] text-[13px]">';
    expect(check(code)).toHaveLength(5);
  });

  it("leaves preset utilities backed by the contract alone", () => {
    const code = '<div class="max-w-md @md:grid-cols-3 gap-4 rounded-lg p-6 text-body-md">';
    expect(check(code)).toHaveLength(0);
  });

  it("flags the modern viewport and container units, not just the 2015 ones", () => {
    const code = '<div class="min-h-[100dvh] h-[50svh] w-[80cqw] pt-[12pt]">';
    expect(check(code)).toHaveLength(4);
  });

  it("flags a raw length in a multi-value shorthand", () => {
    // Tailwind spells a shorthand's spaces as underscores; one raw length among
    // the components is still a raw length.
    expect(check('<div class="p-[8px_16px]">')).toHaveLength(1);
    expect(check('<div class="m-[0_auto_12px]">')).toHaveLength(1);
  });

  it("does not flag arbitrary values that are not lengths", () => {
    const code =
      '<div class="grid-cols-[repeat(auto-fit,minmax(0,1fr))] bg-[url(/hero.png)] w-[--w]">';
    expect(check(code)).toHaveLength(0);
  });

  it("does not flag a longer identifier that merely ends in a utility name", () => {
    expect(check('<div class="demo-w-[320px]">')).toHaveLength(0);
  });

  it("reports the utility and the CSS declaration under one rule id, in source order", () => {
    const findings = check(['<div class="w-[320px]">', "a { border-radius: 6px; }"].join("\n"));
    expect(findings.map((f) => f.loc.line)).toEqual([1, 2]);
    expect(new Set(findings.map((f) => f.ruleId))).toEqual(
      new Set(["moderno/no-hardcoded-dimension"]),
    );
  });
});
