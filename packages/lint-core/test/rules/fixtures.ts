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
    package: "@moderno-ui/tokens",
    version: "0.5.0",
    kind: "contract",
    goldenRule: "Components are never edited. They are themed via variables and varied via props.",
    slots: {
      color: ["--background", "--foreground", "--primary"],
      radius: ["--radius", "--radius-full"],
      font: ["--font-sans", "--font-mono"],
      spacing: ["--spacing-1", "--spacing-2"],
      motion: ["--motion-instant", "--motion-fast"],
      shadow: ["--shadow-sm", "--shadow-md", "--shadow-lg"],
      container: ["--container-sm", "--container-md", "--container-lg"],
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
      package: "@moderno-ui/react",
      version: "0.5.0",
      kind: "components",
      framework: "react",
      generatedFrom: { propsDoc: true, mdxAgentBlock: true },
      components: [
        {
          name: "Button",
          scope: "button",
          import: 'import { Button } from "@moderno-ui/react"',
          propsHash: "sha256:fixture-button",
          props: [{ name: "variant", type: '"primary" | "outline"', required: false }],
          parts: [{ name: "root" }],
          variants: { variant: ["primary", "outline"] },
          guidance: { intent: "A single click action." },
        },
        {
          name: "Dialog",
          scope: "dialog",
          import: 'import { Dialog } from "@moderno-ui/react"',
          propsHash: "sha256:fixture-dialog",
          props: [],
          parts: [{ name: "content" }, { name: "title" }],
          guidance: {
            intent: "A modal surface that interrupts and traps focus until dismissed.",
          },
        },
        {
          name: "Checkbox",
          scope: "checkbox",
          import: 'import { Checkbox } from "@moderno-ui/react"',
          propsHash: "sha256:fixture-checkbox",
          props: [{ name: "size", type: '"sm" | "md" | "lg"', required: false }],
          parts: [{ name: "root" }, { name: "control" }, { name: "indicator" }, { name: "label" }],
          variants: { size: ["sm", "md", "lg"] },
          guidance: { intent: "Toggle one independent boolean." },
        },
        {
          name: "Select",
          scope: "select",
          import: 'import { Select } from "@moderno-ui/react"',
          propsHash: "sha256:fixture-select",
          props: [],
          parts: [{ name: "trigger" }, { name: "content" }, { name: "item" }],
        },
        {
          // A camelCase, non-enum prop surface — what Vue templates spell in
          // kebab-case, and what the charts really look like.
          name: "LineChart",
          scope: "chart",
          import: 'import { LineChart } from "@moderno-ui/react"',
          propsHash: "sha256:fixture-line-chart",
          props: [
            { name: "series", type: "Series[]", required: true },
            { name: "width", type: "number", required: false },
            { name: "xTicks", type: "number", required: false },
          ],
          parts: [{ name: "root" }, { name: "line" }],
        },
      ],
    },
    {
      // Same components, published for Vue — the bindings share one API by
      // contract, so the only difference a rule should see is how the markup
      // spells an attribute.
      package: "@moderno-ui/vue",
      version: "0.5.0",
      kind: "components",
      framework: "vue",
      generatedFrom: { propsDoc: true, mdxAgentBlock: true },
      components: [
        {
          name: "Button",
          scope: "button",
          import: 'import { Button } from "@moderno-ui/vue"',
          propsHash: "sha256:fixture-button",
          props: [{ name: "variant", type: '"primary" | "outline"', required: false }],
          parts: [{ name: "root" }],
          variants: { variant: ["primary", "outline"] },
        },
        {
          name: "LineChart",
          scope: "chart",
          import: 'import { LineChart } from "@moderno-ui/vue"',
          propsHash: "sha256:fixture-line-chart",
          props: [
            { name: "series", type: "Series[]", required: true },
            { name: "width", type: "number", required: false },
            { name: "xTicks", type: "number", required: false },
          ],
          parts: [{ name: "root" }, { name: "line" }],
        },
      ],
    },
  ],
};
