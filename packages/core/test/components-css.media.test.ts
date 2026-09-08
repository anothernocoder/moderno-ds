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
const USER_PREFERENCE_FEATURES = new Set([
  "prefers-reduced-motion",
  "prefers-color-scheme",
  "prefers-contrast",
  "forced-colors",
  "prefers-reduced-transparency",
]);

const css = readFileSync(
  fileURLToPath(new URL("../src/styles/components.css", import.meta.url)),
  "utf8",
);

/**
 * Every media feature a query names: `(prefers-reduced-motion: reduce)` names
 * one, `(width >= 48rem)` names one, and
 * `(prefers-reduced-motion: no-preference) and (max-width: 40rem)` names two —
 * which is the whole point of parsing rather than substring-matching. Anything
 * this cannot read (a `calc()` in a range, say) yields no feature name and so
 * fails closed: the query is treated as a viewport query and must be
 * allow-listed.
 */
function featuresOf(params: string): string[] {
  const features: string[] = [];
  for (const group of params.matchAll(/\(([^()]*)\)/g)) {
    const body = group[1]!;
    const colon = body.indexOf(":");
    // `feature: value` — the name is what precedes the colon, and the value
    // (`no-preference`, `40rem`) is not a feature.
    if (colon !== -1) {
      features.push(body.slice(0, colon).trim().toLowerCase());
      continue;
    }
    // Range syntax (`width >= 48rem`, `400px <= width <= 700px`) or a boolean
    // feature (`hover`): every identifier that is not a value is a name.
    for (const token of body.split(/\s*(?:<=|>=|<|>|=)\s*|\s+/)) {
      if (/^[a-z][a-z-]*$/i.test(token)) features.push(token.toLowerCase());
    }
  }
  return features;
}

/**
 * Whether a media query only asks about the user's stated preferences.
 *
 * Every feature has to be one, not merely some feature: a compound query like
 * `(prefers-reduced-motion: no-preference) and (max-width: 40rem)` is a
 * viewport query wearing a preference as a hat, and exempting it whole is
 * exactly how a viewport rule would slip past the allow-list unseen.
 */
function isUserPreferenceQuery(params: string): boolean {
  const features = featuresOf(params);
  return features.length > 0 && features.every((feature) => USER_PREFERENCE_FEATURES.has(feature));
}

/** `data-scope` values a rule's selector list targets. */
function scopesOf(selector: string): string[] {
  return [...selector.matchAll(/\[data-scope=["']?([\w-]+)["']?\]/g)].map((m) => m[1]!);
}

/**
 * The gate itself, as a function of a stylesheet, so the synthetic cases below
 * exercise the same code path that guards `components.css`. Returns one line
 * per rule that claims a viewport query without an allow-listed scope.
 */
export function offendingMediaRules(stylesheet: string): string[] {
  const offenders: string[] = [];
  postcss.parse(stylesheet).walkAtRules("media", (at: AtRule) => {
    if (isUserPreferenceQuery(at.params)) return;
    const rules: Rule[] = [];
    at.walkRules((r: Rule) => {
      rules.push(r);
    });
    if (rules.length === 0) {
      offenders.push(`@media ${at.params} — no rules, so no scope claims it`);
      return;
    }
    for (const rule of rules) {
      const scopes = scopesOf(rule.selector);
      if (scopes.length === 0) {
        offenders.push(`@media ${at.params} { ${rule.selector} } — no [data-scope]`);
        continue;
      }
      for (const scope of scopes) {
        if (!MEDIA_ALLOW_LIST.has(scope)) {
          offenders.push(`@media ${at.params} { ${rule.selector} } — "${scope}" not allow-listed`);
        }
      }
    }
  });
  return offenders;
}

describe("@moderno-ui/core components.css — viewport queries are opt-in per primitive (ADR-0005)", () => {
  it("restricts every viewport @media to a primitive scope on the allow-list", () => {
    expect(
      offendingMediaRules(css),
      "Blocks and screens respond to their container, not the viewport. A primitive that " +
        "genuinely changes shape on a small screen adds its data-scope to MEDIA_ALLOW_LIST in " +
        "this file, in the same PR as the rule.",
    ).toEqual([]);
  });

  it("starts with an empty allow-list — no primitive has claimed a viewport query yet", () => {
    expect([...MEDIA_ALLOW_LIST]).toEqual([]);
  });
});

/**
 * `components.css` carries no `@media` at all today, so the gate above is an
 * assertion about an empty set: nothing real exercises the exemption or the
 * allow-list. These synthetic stylesheets do, and in particular they pin the
 * shape the exemption used to let through.
 */
describe("the gate itself, over synthetic stylesheets", () => {
  it("leaves a pure user-preference query alone", () => {
    expect(
      offendingMediaRules(`@media (prefers-reduced-motion: reduce) {
        [data-scope="tooltip"][data-part="content"] { transition: none; }
      }`),
    ).toEqual([]);
  });

  it("catches a viewport query on a scope that is not allow-listed", () => {
    expect(
      offendingMediaRules(`@media (width >= 48rem) {
        [data-scope="dialog"][data-part="content"] { inset: auto; }
      }`),
    ).toHaveLength(1);
  });

  it("catches a viewport query that also names a user preference", () => {
    // The bypass this gate has to survive: a compound query is a viewport query
    // wearing a preference as a hat, and it is what someone writes the first
    // time they want a motion-aware small-screen rule.
    const offenders = offendingMediaRules(
      `@media (prefers-reduced-motion: no-preference) and (max-width: 40rem) {
        [data-scope="tooltip"][data-part="content"] { transition: none; }
      }`,
    );
    expect(offenders).toHaveLength(1);
    expect(offenders[0]).toContain("tooltip");
  });

  it("reads the features a query names, whatever syntax it is written in", () => {
    expect(featuresOf("(prefers-reduced-motion: reduce)")).toEqual(["prefers-reduced-motion"]);
    expect(featuresOf("(width >= 48rem)")).toEqual(["width"]);
    expect(featuresOf("(400px <= width <= 700px)")).toEqual(["width"]);
    expect(featuresOf("(prefers-reduced-motion: no-preference) and (max-width: 40rem)")).toEqual([
      "prefers-reduced-motion",
      "max-width",
    ]);
  });

  it("classifies a query only as user-preference when every feature is one", () => {
    // Guards the exemption itself: were `isUserPreferenceQuery` to stop
    // matching, a legitimate motion query would start failing the gate above.
    expect(isUserPreferenceQuery("(prefers-reduced-motion: reduce)")).toBe(true);
    expect(isUserPreferenceQuery("(prefers-color-scheme: dark) and (prefers-contrast: more)")).toBe(
      true,
    );
    expect(isUserPreferenceQuery("(width >= 48rem)")).toBe(false);
    expect(
      isUserPreferenceQuery("(prefers-reduced-motion: no-preference) and (max-width: 40rem)"),
    ).toBe(false);
    // Unparseable, therefore not exempt: the gate errs towards review.
    expect(isUserPreferenceQuery("screen")).toBe(false);
    expect(isUserPreferenceQuery("(width >= calc(36rem + 1px))")).toBe(false);
  });
});
