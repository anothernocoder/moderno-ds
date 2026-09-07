import { describe, expect, it } from "vitest";
import { frameworkFromFilename, frameworkFromPath } from "../src/framework.ts";

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

describe("frameworkFromPath", () => {
  it("reads the framework from a directory segment — the only way to tell Solid from React", () => {
    expect(frameworkFromPath("registry/blocks/pricing/solid/pricing.tsx")).toBe("solid");
    expect(frameworkFromPath("registry/blocks/pricing/react/pricing.tsx")).toBe("react");
  });

  it("prefers the nearest framework segment when a path has more than one", () => {
    expect(frameworkFromPath("/repo/packages/react/registry/blocks/x/solid/x.tsx")).toBe("solid");
  });

  it("ignores a framework name in the filename itself — only directories decide", () => {
    expect(frameworkFromPath("registry/blocks/solid.tsx")).toBe("react");
  });

  it("falls back to the extension when no segment names a framework", () => {
    expect(frameworkFromPath("registry/blocks/pricing/Pricing.vue")).toBe("vue");
    expect(frameworkFromPath("registry/blocks/pricing/Pricing.svelte")).toBe("svelte");
    expect(frameworkFromPath("registry/primitives/button.tsx")).toBe("react");
  });

  it("handles Windows-style separators", () => {
    expect(frameworkFromPath("registry\\blocks\\pricing\\solid\\pricing.tsx")).toBe("solid");
  });
});
