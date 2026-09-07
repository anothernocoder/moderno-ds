/**
 * @moderno-ui/tokens's moderno.agent.json — the shared, framework-agnostic
 * `contract` manifest (schema: `docs/prd/phase-7/moderno.agent.schema.json`,
 * `definitions.contractManifest`). CONTRACT.md, as data — see that file for
 * the prose this mirrors.
 *
 * Split out from `agent-manifest.ts` on purpose: `@moderno-ui/tokens` has no
 * dependency on `@moderno-ui/core`, and this module must not gain one either —
 * `@moderno-ui/tokens`'s build has no package.json edge that would make pnpm
 * build `@moderno-ui/core` first, so importing it here (even transitively, even
 * unused on this codepath) breaks `pnpm -r build`'s topological order.
 */
import { CONTRACT } from "@moderno-ui/tokens/contract";

export interface ContractManifest {
  package: "@moderno-ui/tokens";
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
  };
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
    package: "@moderno-ui/tokens",
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
    },
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
      "Put brand values in a theme; don't add brand identity to @moderno-ui/tokens.",
      "Theme via variables and vary via props; don't fork component markup or write per-component CSS in a consumer project.",
      "Keep :root light / .dark dark; don't invent a third theming mechanism (data-theme, dark-first inversion).",
      "Keep @moderno-ui/css the only public CSS specifier.",
    ],
  };
}
