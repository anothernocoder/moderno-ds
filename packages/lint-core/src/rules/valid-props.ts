/**
 * `moderno/valid-props` (validate-rules.md #3) — the hallucinated-API
 * failure mode, deterministically: every attribute on a Moderno component
 * usage must be a real prop from that component's manifest (or a generic
 * passthrough attribute every binding accepts — event handlers, `class`/
 * `className`, `data-*`/`aria-*`, `children`/`ref`/`key`/`style`), and
 * enum-valued props must be one of the manifest's `variants`.
 */
import type { Finding, Rule } from "./types.ts";
import { findComponentUsages } from "./component-usages.ts";
import { closest, offsetToLoc } from "./text.ts";

const PASSTHROUGH_ATTRS = new Set([
  "class",
  "className",
  "style",
  "id",
  "key",
  "ref",
  "children",
  "htmlFor",
  "role",
  "slot",
  "as",
]);

function isPassthrough(name: string): boolean {
  return (
    PASSTHROUGH_ATTRS.has(name) ||
    name.startsWith("data-") ||
    name.startsWith("aria-") ||
    /^on[A-Z]/.test(name)
  );
}

export const validProps: Rule = {
  id: "moderno/valid-props",
  severity: "error",
  frameworks: "all",
  check(ctx): Finding[] {
    const manifest = ctx.manifests.components.find((m) => m.framework === ctx.framework);
    if (!manifest) return [];

    const findings: Finding[] = [];
    for (const component of manifest.components) {
      const propNames = component.props.map((p) => p.name);
      for (const usage of findComponentUsages(ctx.code, component.name)) {
        const loc = offsetToLoc(ctx.code, usage.start);
        for (const [attrName, value] of Object.entries(usage.attrs)) {
          if (isPassthrough(attrName)) continue;

          if (!propNames.includes(attrName)) {
            const suggestion = closest(propNames, attrName);
            findings.push({
              ruleId: "moderno/valid-props",
              severity: "error",
              loc,
              message: `Unknown prop "${attrName}" on <${component.name}>. Valid props: ${
                propNames.length > 0 ? propNames.join(", ") : "(none)"
              }.`,
              ...(suggestion ? { suggestion: `Did you mean "${suggestion}"?` } : {}),
            });
            continue;
          }

          const allowedValues = component.variants?.[attrName];
          if (allowedValues && typeof value === "string" && !allowedValues.includes(value)) {
            const suggestion = closest(allowedValues, value);
            findings.push({
              ruleId: "moderno/valid-props",
              severity: "error",
              loc,
              message: `Invalid value "${value}" for prop "${attrName}" on <${component.name}>. Allowed: ${allowedValues.join(", ")}.`,
              ...(suggestion ? { suggestion: `Did you mean "${suggestion}"?` } : {}),
            });
          }
        }
      }
    }
    return findings;
  },
};
