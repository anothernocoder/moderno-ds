import { describe, expect, it } from "vitest";
import { frameworkFromFilename } from "../src/framework.ts";

describe("frameworkFromFilename", () => {
  it("maps .vue to vue", () => {
    expect(frameworkFromFilename("Button.vue")).toBe("vue");
  });

  it("maps .svelte to svelte", () => {
    expect(frameworkFromFilename("Button.svelte")).toBe("svelte");
  });

  it("maps .astro to astro", () => {
    expect(frameworkFromFilename("index.astro")).toBe("astro");
  });

  it("defaults .tsx to react", () => {
    expect(frameworkFromFilename("Button.tsx")).toBe("react");
  });

  it("defaults .jsx to react", () => {
    expect(frameworkFromFilename("Button.jsx")).toBe("react");
  });

  it("defaults an unrecognized extension to react", () => {
    expect(frameworkFromFilename("Button.ts")).toBe("react");
  });

  it("handles an absolute path", () => {
    expect(frameworkFromFilename("/repo/src/components/Card.vue")).toBe("vue");
  });
});
