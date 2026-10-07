import { createLibrary, defineComponent } from "@openuidev/lang-core";
import { describe, expect, it } from "vitest";
import { z } from "zod/v4";

// OpenUI needs Zod 4 schemas; with the repo's zod 3.25 they come from `zod/v4`
// (ADR-0011).
describe("OpenUI lang-core with a zod/v4 schema", () => {
  it("builds a one-component library", () => {
    const Button = defineComponent({
      name: "Button",
      description: "A clickable button.",
      props: z.object({ label: z.string(), variant: z.enum(["primary", "ghost"]) }),
      component: null,
    });

    const library = createLibrary({ components: [Button], root: "Button" });

    expect(Object.keys(library.components)).toEqual(["Button"]);
    expect(library.prompt()).toContain("Button");
  });
});
