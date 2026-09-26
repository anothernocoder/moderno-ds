import { describe, expect, it } from "vitest";
import { assembleComponents, type ComponentDefinition } from "../src/component-definition.ts";

const button: ComponentDefinition = {
  name: "Button",
  slug: "button",
  scope: "button",
  props: { file: "src/button.tsx", type: "ButtonProps" },
  parts: [{ name: "root" }],
  variants: { size: ["sm", "md"] },
  examples: { react: [{ title: "Save", code: "<Button>Save</Button>" }] },
};

const dialog: ComponentDefinition = {
  name: "Dialog",
  slug: "dialog",
  scope: "dialog",
  parts: [{ name: "content" }],
  examples: { vue: [{ title: "Open", code: "<Dialog.Root />" }] },
};

describe("assembleComponents", () => {
  const lists = assembleComponents([button, dialog]);

  it("lists a props entry, named after its component, only for components that declare props", () => {
    expect(lists.ENTRIES).toEqual([
      {
        name: "Button",
        file: "src/button.tsx",
        type: "ButtonProps",
        variants: { size: ["sm", "md"] },
      },
    ]);
  });

  it("leaves the variants off a props entry whose component has no recipe", () => {
    const [entry] = assembleComponents([{ ...button, variants: undefined }]).ENTRIES;
    expect(entry).toEqual({ name: "Button", file: "src/button.tsx", type: "ButtonProps" });
  });

  it("gives every component an agent spec, in the order given, without its examples", () => {
    expect(lists.AGENT_COMPONENTS).toEqual([
      {
        name: "Button",
        slug: "button",
        scope: "button",
        propsEntry: {
          name: "Button",
          file: "src/button.tsx",
          type: "ButtonProps",
          variants: { size: ["sm", "md"] },
        },
        parts: [{ name: "root" }],
        variants: { size: ["sm", "md"] },
      },
      { name: "Dialog", slug: "dialog", scope: "dialog", parts: [{ name: "content" }] },
    ]);
    expect("propsEntry" in lists.AGENT_COMPONENTS[1]!).toBe(false);
  });

  it("keys each component's examples by its name", () => {
    expect(lists.AGENT_EXAMPLES).toEqual({
      Button: button.examples,
      Dialog: dialog.examples,
    });
  });
});
