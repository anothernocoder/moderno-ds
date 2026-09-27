import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Carousel's recipe prop, size and Ark parts. */
export default function expectCarousel(carousel: AgentComponent): void {
  expect(carousel.scope).toBe("carousel");
  expect(carousel.props.map((p) => p.name)).toEqual(["size"]);
  expect(carousel.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(carousel.parts.map((p) => p.name)).toEqual([
    "root",
    "item-group",
    "item",
    "control",
    "prev-trigger",
    "next-trigger",
    "indicator-group",
    "indicator",
    "autoplay-trigger",
    "autoplay-indicator",
    "progress-text",
  ]);
  // Ark's own Root props (slideCount, page, slidesPerPage, …) live under node_modules.
  expect(carousel.propsComplete).toBe(false);
}
