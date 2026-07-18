import { describe, expect, it } from "vitest";
import { noReimplementedPrimitive } from "../../src/rules/no-reimplemented-primitive.ts";
import { manifests } from "./fixtures.ts";

function check(code: string) {
  return noReimplementedPrimitive.check({ code, framework: "react", manifests });
}

describe("moderno/no-reimplemented-primitive", () => {
  it("warns on a native <dialog> tag", () => {
    const findings = check("<dialog>...</dialog>");
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "moderno/no-reimplemented-primitive",
      severity: "warn",
    });
    expect(findings[0]!.suggestion).toBe('import { Dialog } from "@moderno/react"');
  });

  it("warns on role=\"dialog\" on a non-<dialog> element", () => {
    expect(check('<div role="dialog">...</div>')).toHaveLength(1);
  });

  it("does not double-count a <dialog> that also carries role=\"dialog\"", () => {
    expect(check('<dialog role="dialog">...</dialog>')).toHaveLength(1);
  });

  it("warns on a native <select> tag alone (no compound signal required)", () => {
    expect(check("<select><option>A</option></select>")).toHaveLength(1);
  });

  it("warns on a native <button> with manual variant-switching classes", () => {
    const findings = check('<button className="btn-primary">Save</button>');
    expect(findings).toHaveLength(1);
    expect(findings[0]!.suggestion).toBe('import { Button } from "@moderno/react"');
  });

  it("does not warn on a plain native <button> with no variant-class signal", () => {
    expect(check('<button onClick={submit}>Save</button>')).toHaveLength(0);
  });

  it("does not warn on the Moderno <Dialog>/<Button> components themselves", () => {
    expect(check('<Dialog>...</Dialog><Button variant="primary">Save</Button>')).toHaveLength(0);
  });

  it("does not warn on unrelated native tags", () => {
    expect(check("<div><span>hi</span></div>")).toHaveLength(0);
  });
});
