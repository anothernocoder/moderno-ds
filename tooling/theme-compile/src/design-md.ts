/**
 * DESIGN.md's YAML front matter, derived from a theme's DTCG file.
 *
 * DESIGN.md (google-labs format) pairs machine-readable tokens in its front
 * matter with hand-written rationale in the body. The tokens are not authored
 * there: the theme's DTCG file is the one source, and this module renders the
 * front matter from it so the two cannot disagree. The body stays hand-written.
 *
 * The format describes one design system per file, with no dark mode, so the
 * light scope uses the contract names and the dark scope follows as `dark-*`.
 * A slot the theme does not express resolves to the neutral default in
 * @moderno-ui/tokens, exactly as it does in the browser. Font weight is left
 * out: the contract has no weight slot, so any value here would be invented.
 */
import { CONTRACT, TYPE_STEPS } from "@moderno-ui/tokens/contract";

type Token = { $value: string };
type ThemeDoc = { light: Record<string, Token>; dark: Record<string, Token> };
type Defaults = { light: Map<string, string>; dark: Map<string, string> };

/** Custom properties declared directly in `selector { … }` of a stylesheet. */
export function declsFor(css: string, selector: string): Map<string, string> {
  const out = new Map<string, string>();
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks = withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const [, sel, body] of blocks) {
    if (sel!.trim() !== selector) continue;
    for (const [, name, value] of body!.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
      out.set(name!, value!.trim());
    }
  }
  return out;
}

/** The neutral defaults a theme inherits, read from @moderno-ui/tokens' tokens.css. */
export function defaultsFrom(tokensCss: string): Defaults {
  return { light: declsFor(tokensCss, ":root"), dark: declsFor(tokensCss, ".dark") };
}

/**
 * The value a slot resolves to in each scope. In the dark scope a theme's own
 * `:root` loads after tokens.css and beats its `.dark` (same specificity, later
 * source), so the chain is theme dark → theme light → default dark → default light.
 */
function resolver(doc: ThemeDoc, defaults: Defaults) {
  const light = (slot: string) => doc.light[slot]?.$value ?? defaults.light.get(slot);
  const dark = (slot: string) =>
    doc.dark[slot]?.$value ??
    doc.light[slot]?.$value ??
    defaults.dark.get(slot) ??
    defaults.light.get(slot);
  return { light, dark };
}

/** The first family of a font stack, unquoted: what DESIGN.md calls `fontFamily`. */
function primaryFamily(stack: string): string {
  return stack
    .split(",")[0]!
    .trim()
    .replace(/^["']|["']$/g, "");
}

const COLOR_NAMES = CONTRACT.filter((s) => s.type === "color").map((s) => s.name);

/** Every string double-quoted: JSON strings are valid YAML scalars. */
function yaml(value: string | number): string {
  return typeof value === "number" ? String(value) : JSON.stringify(value);
}

function required(slot: string, value: string | undefined): string {
  if (value === undefined) throw new Error(`DESIGN.md: no value for --${slot}`);
  return value;
}

/**
 * The front matter block, delimiters included. `meta` carries the document's
 * own metadata (`version`, `name`, `description`), which belong to DESIGN.md
 * rather than to the theme.
 */
export function renderFrontMatter(
  doc: ThemeDoc,
  defaults: Defaults,
  meta: { version: string; name: string; description: string },
): string {
  const { light, dark } = resolver(doc, defaults);
  const lines = [
    "---",
    "# Generated from tokens.json by `pnpm theme:build`. Edit tokens.json, not this block.",
    `version: ${meta.version}`,
    `name: ${yaml(meta.name)}`,
    `description: ${yaml(meta.description)}`,
    "colors:",
    ...COLOR_NAMES.map((slot) => `  ${slot}: ${yaml(required(slot, light(slot)))}`),
    ...COLOR_NAMES.map((slot) => `  dark-${slot}: ${yaml(required(slot, dark(slot)))}`),
    "typography:",
  ];
  const family = primaryFamily(required("font-sans", light("font-sans")));
  for (const step of TYPE_STEPS) {
    lines.push(
      `  ${step}:`,
      `    fontFamily: ${yaml(family)}`,
      `    fontSize: ${required(`text-${step}`, light(`text-${step}`))}`,
      `    lineHeight: ${required(`leading-${step}`, light(`leading-${step}`))}`,
    );
  }
  lines.push(
    "rounded:",
    `  base: ${required("radius", light("radius"))}`,
    `  full: ${required("radius-full", light("radius-full"))}`,
    "spacing:",
  );
  for (const slot of CONTRACT.filter((s) => s.name.startsWith("spacing-"))) {
    lines.push(
      `  "${slot.name.slice("spacing-".length)}": ${required(slot.name, light(slot.name))}`,
    );
  }
  lines.push("---");
  return lines.join("\n") + "\n";
}

const FRONT_MATTER = /^---\n[\s\S]*?\n---\n/;

/** The document metadata of an existing front matter block. */
export function readMeta(markdown: string): { version: string; name: string; description: string } {
  const block = markdown.match(FRONT_MATTER)?.[0] ?? "";
  const field = (key: string) => {
    const raw = block.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
    if (raw === undefined) throw new Error(`DESIGN.md: front matter has no "${key}"`);
    return raw.startsWith('"') ? (JSON.parse(raw) as string) : raw;
  };
  return { version: field("version"), name: field("name"), description: field("description") };
}

/** `markdown` with its front matter replaced by `frontMatter`. */
export function withFrontMatter(markdown: string, frontMatter: string): string {
  if (!FRONT_MATTER.test(markdown)) throw new Error("DESIGN.md: no front matter block");
  return markdown.replace(FRONT_MATTER, frontMatter);
}
