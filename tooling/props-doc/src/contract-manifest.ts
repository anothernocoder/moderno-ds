/**
 * @moderno-ui/css's moderno.agent.json — the shared, framework-agnostic
 * `contract` manifest (schema: `docs/prd/phase-7/moderno.agent.schema.json`,
 * `definitions.contractManifest`). The slots and their roles come from the
 * contract data (`@moderno-ui/css/contract`); the theming notes and rules
 * mirror CONTRACT.md's prose.
 *
 * Split out from `agent-manifest.ts` on purpose: the contract manifest is built
 * from the contract data alone, so this module must not import
 * `agent-manifest.ts` (or anything that pulls in ts-morph or
 * `@moderno-ui/core`'s `dist`) — `@moderno-ui/css`'s build runs it and needs
 * nothing else.
 */
import { CONTRACT } from "@moderno-ui/css/contract";

export interface ContractManifest {
  package: "@moderno-ui/css";
  version: string;
  kind: "contract";
  goldenRule: string;
  slots: {
    color: string[];
    radius: string[];
    font: string[];
    spacing: string[];
    motion: string[];
    shadow: string[];
    container: string[];
    type: string[];
  };
  /** What each slot is for, in one line, keyed by custom-property name. */
  roles: Record<string, string>;
  theming: {
    darkMode: string;
    multiBrand: string;
    dataPartConvention: string;
  };
  rules: string[];
}

export function buildContractManifest(version: string): ContractManifest {
  const slot = (name: string) => `--${name}`;
  return {
    package: "@moderno-ui/css",
    version,
    kind: "contract",
    goldenRule: "Components are never edited. They are themed via variables and varied via props.",
    slots: {
      color: CONTRACT.filter((s) => s.type === "color").map((s) => slot(s.name)),
      radius: CONTRACT.filter((s) => s.name === "radius" || s.name === "radius-full").map((s) =>
        slot(s.name),
      ),
      font: CONTRACT.filter((s) => s.type === "fontFamily").map((s) => slot(s.name)),
      spacing: CONTRACT.filter((s) => s.name.startsWith("spacing-")).map((s) => slot(s.name)),
      motion: CONTRACT.filter((s) => s.name.startsWith("motion-")).map((s) => slot(s.name)),
      shadow: CONTRACT.filter((s) => s.type === "shadow").map((s) => slot(s.name)),
      container: CONTRACT.filter((s) => s.name.startsWith("container-")).map((s) => slot(s.name)),
      type: CONTRACT.filter((s) => /^(text|leading|font-weight)-/.test(s.name)).map((s) =>
        slot(s.name),
      ),
    },
    roles: Object.fromEntries(CONTRACT.map((s) => [slot(s.name), s.role])),
    theming: {
      darkMode:
        ":root is the light scope, .dark overrides it — shadcn-style, no third theming mechanism.",
      multiBrand:
        '[data-brand="…"] scopes overrides and composes with .dark; switching it re-maps variables without touching the base tokens.',
      dataPartConvention:
        'Component styles target [data-scope="x"][data-part="y"]; variants are data-variant/data-size on the root part, resolved from props by CVA in @moderno-ui/core. Never target component-owned class names.',
    },
    rules: [
      "Reference contract slots; don't hardcode hex colors, px spacing, or ms durations.",
      "Put brand values in a theme; don't add brand identity to @moderno-ui/css.",
      "Theme via variables and vary via props; don't fork component markup or write per-component CSS in a consumer project.",
      "Keep :root light / .dark dark; don't invent a third theming mechanism (data-theme, dark-first inversion).",
      "Keep @moderno-ui/css the only public CSS specifier.",
    ],
  };
}
