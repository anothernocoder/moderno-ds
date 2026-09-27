import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Toast's recipe prop, size and Ark parts. */
export default function expectToast(toast: AgentComponent): void {
  expect(toast.scope).toBe("toast");
  expect(toast.props.map((p) => p.name)).toEqual(["size"]);
  expect(toast.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(toast.parts.map((p) => p.name)).toEqual([
    "group",
    "root",
    "title",
    "description",
    "action-trigger",
    "close-trigger",
  ]);
  // Ark's own Root props (asChild, …) live under node_modules.
  expect(toast.propsComplete).toBe(false);
}
