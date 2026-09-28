import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** RadioGroup's recipe props, variants and parts — what validate_usage checks against. */
export default function expectRadioGroup(radioGroup: AgentComponent): void {
  // `columns` is a real prop but not a recipe variant, so it is in `props` and
  // absent from `variants`: the enum check has nothing to gate it against.
  expect(radioGroup.scope).toBe("radio-group");
  expect(radioGroup.props.map((p) => p.name).sort()).toEqual([
    "aspectRatio",
    "columns",
    "size",
    "variant",
  ]);
  expect(radioGroup.variants).toEqual({
    variant: ["list", "tile"],
    size: ["sm", "md", "lg"],
    aspectRatio: ["16:9", "4:3", "3:2", "1:1", "3:4", "9:16"],
  });
  expect(radioGroup.parts.map((p) => p.name)).toEqual([
    "root",
    "label",
    "item",
    "item-media",
    "item-control",
    "item-text",
    "item-description",
    "indicator",
  ]);
  // Ark's own Root props (value, orientation, onValueChange, …) live under node_modules.
  expect(radioGroup.propsComplete).toBe(false);
}
