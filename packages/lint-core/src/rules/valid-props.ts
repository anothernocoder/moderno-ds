/**
 * `moderno/valid-props` (validate-rules.md #3) — the hallucinated-API
 * failure mode, deterministically: every attribute on a Moderno component
 * usage must be a real prop from that component's manifest (or a native HTML
 * attribute / generic passthrough every binding accepts — event handlers,
 * `class`/`className`, `data-*`/`aria-*`, `children`/`ref`/`key`/`style`), and
 * enum-valued props must be one of the manifest's `variants`.
 *
 * Three things stop the check from being a plain "is this name in `props`?":
 *
 * - The manifest's `props` is not exhaustive. `@moderno-ui/props-doc` keeps
 *   only workspace-declared props, so a binding that extends
 *   `ComponentPropsWithRef<"button">` publishes `size, variant` and nothing
 *   else — `disabled`, `type` and `title` are real and must not be flagged.
 *   `dom-attributes.ts` carries that vocabulary.
 * - An attribute is not spelled the same in every binding. Vue templates write
 *   `xTicks` as `:x-ticks`, hang props off `v-bind:`, and use `@`/`v-`/`#` for
 *   syntax that binds no prop at all; Svelte namespaces its directives
 *   (`on:click`, `bind:value`). `resolveAttr` folds each framework's spelling
 *   down to the prop it actually sets, or to "not a prop" — comparing raw
 *   markup against a camelCase manifest is how `<LineChart :x-ticks="3" />`,
 *   the DS's own documented Vue usage, ended up reported as an error.
 * - The unknown-prop half only runs where the manifest says its prop list is
 *   complete (`propsComplete`). A root wrapped around a headless machine —
 *   `Select.Root`, `Checkbox.Root`, `Field.Root`, `Dialog.Root` — reaches the
 *   manifest with only the props declared in this workspace, because
 *   `props-doc` drops Ark/Zag's declarations along with the DOM noise; flagging
 *   `collection` or `invalid` there would make the tool that exists to catch
 *   invented APIs invent errors on the DS's own examples. The enum check still
 *   applies to those roots: it consults `variants`, which is generated from the
 *   recipe and always complete.
 */
import type { Finding, Rule } from "./types.ts";
import { findComponentUsages } from "./component-usages.ts";
import { isDomAttribute } from "./dom-attributes.ts";
import { closest, offsetToLoc } from "./text.ts";
import type { Framework } from "../manifests.ts";

/**
 * Passthrough names that aren't HTML attributes: the polymorphic-element
 * convention and the framework-level props every binding forwards.
 */
const PASSTHROUGH_ATTRS = new Set(["as", "children", "key", "ref", "slot"]);

function isPassthrough(name: string): boolean {
  return (
    PASSTHROUGH_ATTRS.has(name) ||
    isDomAttribute(name) ||
    name.startsWith("data-") ||
    name.startsWith("aria-") ||
    /^on[A-Z]/.test(name)
  );
}

/** `x-ticks` -> `xTicks`, the fold Vue applies to every kebab-case attribute. */
function camelize(name: string): string {
  return name.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase());
}

/** Svelte's namespaced directives — element syntax, never a component prop. */
const SVELTE_DIRECTIVES = new Set([
  "on",
  "bind",
  "class",
  "style",
  "use",
  "transition",
  "in",
  "out",
  "animate",
  "let",
]);

interface ResolvedAttr {
  /** The prop this attribute sets, or null when it binds no prop (a directive). */
  prop: string | null;
  /**
   * False when the value is a bound expression rather than a static string, so
   * the enum check must stay quiet — the same reason React's `variant={v}` is
   * left alone.
   */
  literal: boolean;
}

const NOT_A_PROP: ResolvedAttr = { prop: null, literal: false };

/** The prop a raw attribute name sets, in the framework whose markup wrote it. */
function resolveAttr(framework: Framework, raw: string): ResolvedAttr {
  if (framework === "vue") {
    // `@click`, `@update:modelValue`, `#footer` — events and slots.
    if (raw.startsWith("@") || raw.startsWith("#")) return NOT_A_PROP;

    let name = raw;
    let literal = true;
    if (name.startsWith("v-bind:")) {
      name = name.slice("v-bind:".length);
      literal = false;
    } else if (name.startsWith(":")) {
      name = name.slice(1);
      literal = false;
    } else if (name.startsWith("v-")) {
      // v-if / v-for / v-model / v-show / v-html / v-on:… — Vue's own syntax.
      return NOT_A_PROP;
    }

    // Drop modifiers (`:series.sync`); a dynamic key (`:[name]`) is unknowable.
    name = name.split(".")[0]!;
    if (!name || name.startsWith("[")) return NOT_A_PROP;
    return { prop: camelize(name), literal };
  }

  if (framework === "svelte") {
    const namespace = raw.includes(":") ? raw.slice(0, raw.indexOf(":")) : null;
    if (namespace && SVELTE_DIRECTIVES.has(namespace)) return NOT_A_PROP;
  }

  // Anything still namespaced (`xlink:href`) is markup, not a component prop.
  if (raw.includes(":")) return NOT_A_PROP;
  return { prop: raw, literal: true };
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
          const { prop, literal } = resolveAttr(ctx.framework, attrName);
          if (prop === null) continue;

          // Declared props are matched first: `size` and `width` are both real
          // props here and real HTML attributes, and the manifest's variants
          // must still gate their values.
          if (propNames.includes(prop)) {
            const allowedValues = component.variants?.[prop];
            if (allowedValues && literal && typeof value === "string") {
              if (!allowedValues.includes(value)) {
                const suggestion = closest(allowedValues, value);
                findings.push({
                  ruleId: "moderno/valid-props",
                  severity: "error",
                  loc,
                  message: `Invalid value "${value}" for prop "${prop}" on <${component.name}>. Allowed: ${allowedValues.join(", ")}.`,
                  ...(suggestion ? { suggestion: `Did you mean "${suggestion}"?` } : {}),
                });
              }
            }
            continue;
          }

          if (isPassthrough(prop)) continue;

          // Not in the list — but the list is only exhaustive when the
          // component owns every prop it accepts. Otherwise this attribute is
          // as likely one of Ark's as one the agent made up, and silence is the
          // only honest answer.
          if (!component.propsComplete) continue;

          const suggestion = closest(propNames, prop);
          findings.push({
            ruleId: "moderno/valid-props",
            severity: "error",
            loc,
            // The raw name, not the resolved one, so the message points at what
            // the source actually wrote.
            message: `Unknown prop "${attrName}" on <${component.name}>. Valid props: ${
              propNames.length > 0 ? propNames.join(", ") : "(none)"
            }.`,
            ...(suggestion ? { suggestion: `Did you mean "${suggestion}"?` } : {}),
          });
        }
      }
    }
    return findings;
  },
};
