// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { announce } from "../src/announce.js";

const liveRegions = () => document.querySelectorAll<HTMLElement>("[data-live-announcer]");

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("announce", () => {
  it("creates no live region before the first message", () => {
    expect(liveRegions()).toHaveLength(0);
  });

  it("reads the message from a visually hidden, polite live region", () => {
    announce("Slide 3 picked up. Position 3 of 12.");
    vi.runAllTimers();

    const [region] = liveRegions();
    expect(region?.textContent).toBe("Slide 3 picked up. Position 3 of 12.");
    expect(region?.getAttribute("aria-live")).toBe("polite");
    expect(region?.getAttribute("role")).toBe("status");
    expect(region?.style.position).toBe("absolute");
    expect(region?.style.width).toBe("1px");
  });

  it("interrupts with an assertive region when asked", () => {
    announce("Upload failed.", { politeness: "assertive" });
    vi.runAllTimers();

    const [region] = liveRegions();
    expect(region?.getAttribute("aria-live")).toBe("assertive");
    expect(region?.getAttribute("role")).toBe("alert");
  });

  it("keeps one live region in the document, whatever the politeness", () => {
    announce("Moved to position 5.");
    announce("Moved to position 6.");
    announce("Upload failed.", { politeness: "assertive" });
    announce("Dropped.");
    vi.runAllTimers();

    expect(liveRegions()).toHaveLength(1);
    expect(liveRegions()[0]?.textContent).toBe("Dropped.");
  });
});
