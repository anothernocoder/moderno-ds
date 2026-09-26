import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Pagination's recipe prop, size and Ark parts. */
export default function expectPagination(pagination: AgentComponent): void {
  expect(pagination.scope).toBe("pagination");
  expect(pagination.props.map((p) => p.name)).toEqual(["size"]);
  expect(pagination.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(pagination.parts.map((p) => p.name)).toEqual([
    "root",
    "first-trigger",
    "prev-trigger",
    "item",
    "ellipsis",
    "next-trigger",
    "last-trigger",
  ]);
  // Ark's own Root props (count, page, pageSize, …) live under node_modules.
  expect(pagination.propsComplete).toBe(false);
}
