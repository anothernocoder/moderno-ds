/**
 * A hand-built `AggregatedManifests` for rule unit tests — rules consume
 * already-aggregated manifests, so tests exercise them directly rather than
 * going through `discoverManifests`' filesystem discovery (that's
 * `consumer-fixture.ts`'s job, used by the tool-level integration tests).
 */
import type { AggregatedManifests } from "../../src/manifests.ts";

export const manifests: AggregatedManifests = {
  scopeDir: "/fake/node_modules/@moderno",
  contract: {
    package: "@moderno/tokens",
    version: "0.5.0",
    kind: "contract",
    goldenRule: "Components are never edited. They are themed via variables and varied via props.",
    slots: {
      color: ["--background", "--foreground", "--primary"],
      radius: ["--radius", "--radius-full"],
      font: ["--font-sans", "--font-mono"],
      spacing: ["--spacing-1", "--spacing-2"],
      motion: ["--motion-instant", "--motion-fast"],
    },
    theming: {
      darkMode: ":root is the light scope, .dark overrides it.",
      multiBrand: '[data-brand="…"] scopes overrides and composes with .dark.',
      dataPartConvention: 'Component styles target [data-scope="x"][data-part="y"].',
    },
    rules: ["Reference contract slots; don't hardcode hex colors, px spacing, or ms durations."],
  },
  components: [
    {
      package: "@moderno/react",
      version: "0.5.0",
      kind: "components",
      framework: "react",
      generatedFrom: { propsDoc: true, mdxAgentBlock: true },
      components: [
        {
          name: "Button",
          scope: "button",
          import: 'import { Button } from "@moderno/react"',
          propsHash: "sha256:fixture-button",
          props: [{ name: "variant", type: '"primary" | "outline"', required: false }],
          parts: [{ name: "root" }],
          variants: { variant: ["primary", "outline"] },
          guidance: { intent: "A single click action." },
        },
        {
          name: "Dialog",
          scope: "dialog",
          import: 'import { Dialog } from "@moderno/react"',
          propsHash: "sha256:fixture-dialog",
          props: [],
          parts: [{ name: "content" }, { name: "title" }],
          guidance: {
            intent: "A modal surface that interrupts and traps focus until dismissed.",
          },
        },
        {
          name: "Select",
          scope: "select",
          import: 'import { Select } from "@moderno/react"',
          propsHash: "sha256:fixture-select",
          props: [],
          parts: [{ name: "trigger" }, { name: "content" }, { name: "item" }],
        },
      ],
    },
  ],
};
