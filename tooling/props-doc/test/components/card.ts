import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Card's recipe props, variants and styled parts. */
export default function expectCard(card: AgentComponent): void {
  expect(card.scope).toBe("card");
  expect(card.props.map((p) => p.name)).toEqual(["size", "variant"]);
  expect(card.variants).toEqual({
    variant: ["outline", "muted", "ghost"],
    size: ["sm", "md", "lg"],
  });
  expect(card.parts.map((p) => p.name)).toEqual([
    "root",
    "header",
    "title",
    "description",
    "content",
    "footer",
  ]);
  expect(card.propsComplete).toBe(true);
}
