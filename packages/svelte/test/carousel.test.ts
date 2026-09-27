import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { Carousel } from "../src/index.js";
import Demo from "./fixtures/CarouselFixture.svelte";
import {
  CAROUSEL_WIDTH,
  layOutCarouselSlides,
  stubReducedMotion,
} from "../../core/test/carousel-dom.ts";

afterEach(cleanup);

describe("Carousel surface (Svelte)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Carousel: ArkCarousel } = await import("@ark-ui/svelte");
    for (const part of Object.keys(ArkCarousel)) {
      if (part === "Root") continue; // wrapped below
      expect(Carousel[part as keyof typeof Carousel], `Carousel.${part} missing`).toBeDefined();
    }
  });
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="carousel"][data-part="${name}"]`)!;
const parts = (name: string) => [
  ...document.querySelectorAll<HTMLElement>(`[data-scope="carousel"][data-part="${name}"]`),
];
/** The page the indicators mark as current, from 0. */
const currentPage = () =>
  parts("indicator").findIndex((indicator) => indicator.hasAttribute("data-current"));

let undoLayout: () => void;
beforeEach(() => {
  undoLayout = layOutCarouselSlides();
});
afterEach(() => undoLayout());

describe("Carousel", () => {
  it("applies the recipe to the root part, defaulting to md", () => {
    render(Demo, { props: { size: "sm" as const } });
    expect(part("root").getAttribute("data-size")).toBe("sm");

    cleanup();
    render(Demo);
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native attributes to Ark's root", () => {
    render(Demo);
    expect(part("root").className).toBe("slides");
  });

  it("is a region a screen reader calls a carousel, of slides named by position", () => {
    render(Demo);
    expect(screen.getByRole("region")).toBe(part("root"));
    expect(part("root").getAttribute("aria-roledescription")).toBe("carousel");
    expect(parts("item").map((item) => item.getAttribute("aria-roledescription"))).toEqual([
      "slide",
      "slide",
      "slide",
    ]);
    expect(parts("item").map((item) => item.getAttribute("aria-label"))).toEqual([
      "1 of 3",
      "2 of 3",
      "3 of 3",
    ]);
  });

  it("shows one named indicator per page and marks the first as current", async () => {
    render(Demo);
    await waitFor(() => expect(parts("indicator")).toHaveLength(3));
    expect(parts("indicator").map((indicator) => indicator.getAttribute("aria-label"))).toEqual([
      "Go to slide 1",
      "Go to slide 2",
      "Go to slide 3",
    ]);
    expect(currentPage()).toBe(0);
    expect(part("progress-text").textContent).toBe("1 / 3");
  });

  it("names the triggers for a screen reader", () => {
    render(Demo);
    expect(part("prev-trigger").getAttribute("aria-label")).toBe("Previous slide");
    expect(part("next-trigger").getAttribute("aria-label")).toBe("Next slide");
  });

  it("steps with next and prev, and reports the page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(Demo, { props: { onPageChange } });
    await waitFor(() => expect(part("next-trigger")).toHaveProperty("disabled", false));
    await user.click(part("next-trigger"));
    await waitFor(() => expect(currentPage()).toBe(1));
    expect(onPageChange).toHaveBeenLastCalledWith({ page: 1, pageSnapPoint: CAROUSEL_WIDTH });
    expect(part("progress-text").textContent).toBe("2 / 3");
    await user.click(part("prev-trigger"));
    await waitFor(() => expect(currentPage()).toBe(0));
  });

  it("goes to the page of a clicked indicator", async () => {
    const user = userEvent.setup();
    render(Demo);
    await waitFor(() => expect(parts("indicator")).toHaveLength(3));
    await user.click(screen.getByRole("button", { name: "Go to slide 3" }));
    await waitFor(() => expect(currentPage()).toBe(2));
  });

  it("disables prev on the first page and next on the last", async () => {
    const user = userEvent.setup();
    render(Demo);
    await waitFor(() => expect(part("next-trigger")).toHaveProperty("disabled", false));
    expect(part("prev-trigger")).toHaveProperty("disabled", true);
    await user.click(screen.getByRole("button", { name: "Go to slide 3" }));
    await waitFor(() => expect(part("next-trigger")).toHaveProperty("disabled", true));
    expect(part("prev-trigger")).toHaveProperty("disabled", false);
  });

  it("wraps around from the last page with loop", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { loop: true, defaultPage: 2 } });
    await waitFor(() => expect(currentPage()).toBe(2));
    expect(part("next-trigger")).toHaveProperty("disabled", false);
    await user.click(part("next-trigger"));
    await waitFor(() => expect(currentPage()).toBe(0));
  });

  it("groups slidesPerPage slides into a page", async () => {
    undoLayout();
    undoLayout = layOutCarouselSlides(2);
    render(Demo, { props: { slideCount: 4, slidesPerPage: 2 } });
    await waitFor(() => expect(parts("indicator")).toHaveLength(2));
  });

  it("follows a controlled page", async () => {
    const { rerender } = render(Demo, { props: { page: 1 } });
    await waitFor(() => expect(currentPage()).toBe(1));
    await rerender({ page: 2 });
    await waitFor(() => expect(currentPage()).toBe(2));
  });
});

describe("Carousel autoplay and reduced motion", () => {
  let reducedMotion: ReturnType<typeof stubReducedMotion>;
  afterEach(() => reducedMotion.restore());

  const playing = () => part("autoplay-trigger").hasAttribute("data-pressed");

  it("plays on its own when the reader allows motion", async () => {
    reducedMotion = stubReducedMotion(false);
    render(Demo, { props: { autoplay: true } });
    await waitFor(() => expect(playing()).toBe(true));
    expect(part("autoplay-trigger").getAttribute("aria-label")).toBe("Stop slide rotation");
  });

  it("holds autoplay when the reader prefers reduced motion, and lets them start it", async () => {
    reducedMotion = stubReducedMotion(true);
    const user = userEvent.setup();
    render(Demo, { props: { autoplay: true } });
    await waitFor(() => expect(playing()).toBe(false));
    expect(part("autoplay-trigger").getAttribute("aria-label")).toBe("Start slide rotation");
    await user.click(part("autoplay-trigger"));
    await waitFor(() => expect(playing()).toBe(true));
  });

  it("stops playing when the reader turns reduced motion on", async () => {
    reducedMotion = stubReducedMotion(false);
    render(Demo, { props: { autoplay: true } });
    await waitFor(() => expect(playing()).toBe(true));
    reducedMotion.set(true);
    await waitFor(() => expect(playing()).toBe(false));
  });
});
