import { describe, expect, it } from "vitest";
import {
  REDUCED_MOTION_QUERY,
  carouselMotion,
  carouselRecipe,
} from "../../src/recipes/carousel.js";

describe("carouselRecipe", () => {
  it("defaults to size md", () => {
    expect(carouselRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(carouselRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for what Ark already decides", () => {
    // slideCount, page, slidesPerPage, spacing, loop, orientation and autoplay
    // are Ark's props; the current indicator is Ark's data-current.
    expect(Object.keys(carouselRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a carousel size
    expect(() => carouselRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});

describe("carouselMotion", () => {
  it("keeps the consumer's autoplay when the reader allows motion", () => {
    expect(carouselMotion({ autoplay: true }, false)).toEqual({ autoplay: true, loop: true });
    expect(carouselMotion({ autoplay: { delay: 2000 } }, false)).toEqual({
      autoplay: { delay: 2000 },
      loop: true,
    });
    expect(carouselMotion({}, false)).toEqual({ autoplay: undefined, loop: false });
  });

  it("turns autoplay off when the reader asks for reduced motion", () => {
    expect(carouselMotion({ autoplay: true }, true).autoplay).toBe(false);
    expect(carouselMotion({ autoplay: { delay: 2000 } }, true).autoplay).toBe(false);
  });

  it("keeps Ark's loop default (on with autoplay) whether or not autoplay is held", () => {
    expect(carouselMotion({ autoplay: true }, true).loop).toBe(true);
    expect(carouselMotion({ autoplay: true, loop: false }, false).loop).toBe(false);
    expect(carouselMotion({ loop: true }, true).loop).toBe(true);
  });

  it("names the reduced-motion media query", () => {
    expect(REDUCED_MOTION_QUERY).toBe("(prefers-reduced-motion: reduce)");
  });
});
