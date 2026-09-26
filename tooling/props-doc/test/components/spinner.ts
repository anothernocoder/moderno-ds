import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Spinner's props — what validate_usage checks against. */
export default function expectSpinner(spinner: AgentComponent): void {
  expect(spinner.scope).toBe("spinner");
  expect(spinner.props.map((p) => p.name).sort()).toEqual(["label", "size"]);
  expect(spinner.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(spinner.parts.map((p) => p.name)).toEqual(["root", "circle", "label"]);
  expect(spinner.propsComplete).toBe(true);
}
