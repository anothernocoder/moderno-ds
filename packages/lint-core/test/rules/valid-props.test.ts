import { describe, expect, it } from "vitest";
import { validProps } from "../../src/rules/valid-props.ts";
import { manifests } from "./fixtures.ts";

function check(code: string) {
  return validProps.check({ code, framework: "react", manifests });
}

function checkVue(code: string) {
  return validProps.check({ code, framework: "vue", manifests });
}

function messages(findings: ReturnType<typeof check>) {
  return findings.map((f) => f.message);
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

  // The manifest lists only workspace-declared props, so every attribute a
  // binding inherits from `ComponentPropsWithRef<"button">` is missing from it
  // and used to be reported as a hallucination.
  describe("native HTML attributes", () => {
    it("accepts the DOM attributes a binding forwards but the manifest omits", () => {
      expect(
        messages(
          check(
            '<Button disabled type="submit" name="save" form="settings" title="Save" tabIndex={0} autoFocus>Save</Button>',
          ),
        ),
      ).toEqual([]);
    });

    it("accepts markup's lowercase spelling of a camelCase DOM attribute", () => {
      expect(messages(checkVue('<Button tabindex="0" readonly>Save</Button>'))).toEqual([]);
    });

    it("still flags a name that is neither a prop nor a DOM attribute", () => {
      const findings = check('<Button elevation="high">Save</Button>');
      expect(messages(findings)).toEqual([
        'Unknown prop "elevation" on <Button>. Valid props: variant.',
      ]);
    });

    it("keeps checking variants on a prop that is also a DOM attribute", () => {
      // `width` is both; the manifest is the authority for a declared prop.
      expect(messages(check('<LineChart series={s} width="wide" />'))).toEqual([]);
      const findings = check('<Button variant="loud">Save</Button>');
      expect(findings[0]!.message).toContain('Invalid value "loud"');
    });
  });

  describe("vue template attribute syntax", () => {
    it("resolves a kebab-case attribute to its camelCase prop", () => {
      expect(messages(checkVue('<LineChart :series="data" :x-ticks="3" />'))).toEqual([]);
    });

    it("still flags a kebab-case attribute that folds to no known prop", () => {
      const findings = checkVue('<LineChart :series="data" :x-tick="3" />');
      expect(messages(findings)).toEqual([
        'Unknown prop ":x-tick" on <LineChart>. Valid props: series, width, xTicks.',
      ]);
      expect(findings[0]!.suggestion).toContain("xTicks");
    });

    it("ignores directives, event handlers and slot shorthands", () => {
      expect(
        messages(
          checkVue(
            '<Button v-if="ready" @click.prevent="save" #footer v-bind:variant="chosen">Save</Button>',
          ),
        ),
      ).toEqual([]);
    });

    it("does not read a bound expression as an enum value", () => {
      // `:variant="variant"` binds a variable — the Vue spelling of React's
      // `variant={variant}`, which the rule already leaves alone.
      expect(messages(checkVue('<Button :variant="variant">Save</Button>'))).toEqual([]);
    });

    it("still checks a statically written enum value", () => {
      const findings = checkVue('<Button variant="primaryy">Save</Button>');
      expect(findings).toHaveLength(1);
      expect(findings[0]!.message).toContain('Invalid value "primaryy"');
    });
  });
});
