// @vitest-environment node
import { describe, expect, it } from "vitest";
import { attrOf, partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import AccordionSection from "../../playground/sections/accordion.js";
import { renderSection } from "./render-section.js";

describe("Accordion SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(AccordionSection);
    // The recipe lands on each root, the open items reach the server string
    // (aria-expanded + data-state), every content is a region labelled by its
    // own trigger's id, the contents of closed items are hidden, and a
    // disabled item's trigger is a disabled button.
    expect(partAttrs(html, "accordion", "root", "data-variant")).toEqual(["line", "enclosed"]);
    expect(partAttrs(html, "accordion", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "accordion", "item", "data-state")).toEqual([
      "open",
      "closed",
      "closed",
      "open",
    ]);
    expect(partTags(html, "accordion", "item-indicator")).toHaveLength(4);
    const accordionTriggers = partTags(html, "accordion", "item-trigger");
    expect(accordionTriggers.map((tag) => attrOf(tag, "aria-expanded"))).toEqual([
      "true",
      "false",
      "false",
      "true",
    ]);
    expect(accordionTriggers.map((tag) => /\sdisabled(?:=""|[\s>])/.test(tag))).toEqual([
      false,
      false,
      true,
      false,
    ]);
    const accordionContents = partTags(html, "accordion", "item-content");
    expect(accordionContents.map((tag) => attrOf(tag, "role"))).toEqual([
      "region",
      "region",
      "region",
      "region",
    ]);
    expect(accordionContents.map((tag) => attrOf(tag, "aria-labelledby"))).toEqual(
      accordionTriggers.map((tag) => attrOf(tag, "id")),
    );
    expect(accordionContents.map((tag) => /\shidden(?:=""|[\s>])/.test(tag))).toEqual([
      false,
      true,
      true,
      false,
    ]);
    expect(html).toContain("Shipping answer");
    expect(html).toContain("Support answer");
  });
});
