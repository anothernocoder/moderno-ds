import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import postcss, { type AtRule, type Rule } from "postcss";

/**
 * The viewport half of the responsive policy (ADR-0005, CONTRACT.md
 * "Responsive policy").
 *
 * A viewport media query is a claim about the window, and only a primitive that
 * genuinely changes shape on a small screen — a Dialog presented as a bottom
 * Drawer, a Menu as a bottom sheet — is entitled to make it. Every other rule
 * in the shared stylesheet must work at any width, because the same markup is
 * mounted in a sidebar, a modal and a full page.
 *
 * So `@media` here is opt-in per primitive scope, not a free-for-all. The
 * allow-list below starts **empty**: nothing in `components.css` has earned a
 * viewport query yet, and the first primitive that does adds its `data-scope`
 * here in the same PR that adds the rule — which makes the exception reviewable
 * instead of invisible. Blocks are never on this list; they respond with
 * `@container` and are gated separately over the registry sources.
 */
const MEDIA_ALLOW_LIST = new Set<string>([
  // e.g. "dialog" — a Dialog that becomes a bottom Drawer under a small
  // viewport. Empty until a primitive actually ships that shape change.
]);

/** Media features that describe the user, not the viewport, and are always allowed. */
const USER_PREFERENCE_FEATURES = [
  "prefers-reduced-motion",
  "prefers-color-scheme",
  "prefers-contrast",
  "forced-colors",
  "prefers-reduced-transparency",
];

const css = readFileSync(
  fileURLToPath(new URL("../src/styles/components.css", import.meta.url)),
  "utf8",
);
const root = postcss.parse(css);

const mediaRules: AtRule[] = [];
root.walkAtRules("media", (at: AtRule) => {
  mediaRules.push(at);
});

/** Whether a media query only asks about the user's stated preferences. */
function isUserPreferenceQuery(params: string): boolean {
  return USER_PREFERENCE_FEATURES.some((feature) => params.includes(feature));
}

/** `data-scope` values a rule's selector list targets. */
function scopesOf(selector: string): string[] {
  return [...selector.matchAll(/\[data-scope=["']?([\w-]+)["']?\]/g)].map((m) => m[1]!);
}

describe("@moderno-ui/core components.css — viewport queries are opt-in per primitive (ADR-0005)", () => {
  it("restricts every viewport @media to a primitive scope on the allow-list", () => {
    const offenders: string[] = [];
    for (const at of mediaRules) {
      if (isUserPreferenceQuery(at.params)) continue;
      const rules: Rule[] = [];
      at.walkRules((r: Rule) => {
        rules.push(r);
      });
      if (rules.length === 0) {
        offenders.push(`@media ${at.params} — no rules, so no scope claims it`);
        continue;
      }
      for (const rule of rules) {
        const scopes = scopesOf(rule.selector);
        if (scopes.length === 0) {
          offenders.push(`@media ${at.params} { ${rule.selector} } — no [data-scope]`);
          continue;
        }
        for (const scope of scopes) {
          if (!MEDIA_ALLOW_LIST.has(scope)) {
            offenders.push(
              `@media ${at.params} { ${rule.selector} } — "${scope}" not allow-listed`,
            );
          }
        }
      }
    }
    expect(
      offenders,
      "Blocks and screens respond to their container, not the viewport. A primitive that " +
        "genuinely changes shape on a small screen adds its data-scope to MEDIA_ALLOW_LIST in " +
        "this file, in the same PR as the rule.",
    ).toEqual([]);
  });

  it("starts with an empty allow-list — no primitive has claimed a viewport query yet", () => {
    expect([...MEDIA_ALLOW_LIST]).toEqual([]);
  });

  it("leaves user-preference queries (prefers-reduced-motion, …) unrestricted", () => {
    // Guards the exemption itself: were `isUserPreferenceQuery` to stop matching,
    // a legitimate motion query would start failing the gate above.
    expect(isUserPreferenceQuery("(prefers-reduced-motion: reduce)")).toBe(true);
    expect(isUserPreferenceQuery("(width >= 48rem)")).toBe(false);
  });
});
