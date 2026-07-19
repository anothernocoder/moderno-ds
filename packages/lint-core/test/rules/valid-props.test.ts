import { describe, expect, it } from "vitest";
import { validProps } from "../../src/rules/valid-props.ts";
import { manifests } from "./fixtures.ts";

function check(code: string) {
  return validProps.check({ code, framework: "react", manifests });
}

describe("moderno/valid-props", () => {
  it("flags an unknown prop", () => {
    const findings = check("<Button loud>Save</Button>");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.message).toContain('Unknown prop "loud"');
  });

  it("flags an invalid enum value with a did-you-mean suggestion", () => {
    const findings = check('<Button variant="primaryy">Save</Button>');
    expect(findings).toHaveLength(1);
    expect(findings[0]!.message).toContain('Invalid value "primaryy"');
    expect(findings[0]!.suggestion).toContain("primary");
  });

  it("accepts a valid usage", () => {
    expect(check('<Button variant="primary">Save</Button>')).toHaveLength(0);
  });

  it("ignores passthrough DOM/event attributes", () => {
    expect(
      check(
        '<Button className="mt-2" onClick={handleClick} data-testid="save" aria-label="x">Save</Button>',
      ),
    ).toHaveLength(0);
  });

  it("does not flag a dynamic (non-literal) enum value it can't statically check", () => {
    expect(check("<Button variant={variant}>Save</Button>")).toHaveLength(0);
  });

  it("checks every component in the manifest, not just the first", () => {
    const findings = check('<Dialog bogus="x">...</Dialog>');
    expect(findings).toHaveLength(1);
    expect(findings[0]!.message).toContain("<Dialog>");
  });

  it("returns nothing for a framework with no manifest", () => {
    expect(
      validProps.check({ code: "<Button loud />", framework: "solid", manifests }),
    ).toHaveLength(0);
  });
});
