import { describe, expect, it } from "vitest";
import { checkReactProps as check } from "../../helpers/agent-manifests.ts";

describe("moderno/valid-props over the real Carousel manifest", () => {
  it("accepts the recipe prop and Ark's own props on the root", () => {
    expect(
      check(
        '<Carousel.Root size="sm" slideCount={6} slidesPerPage={2} spacing="var(--spacing-3)" loop autoplay />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<Carousel.Root size="xl" slideCount={3} />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
