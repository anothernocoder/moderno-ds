import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import NumberInputSection from "../../playground/sections/number-input.js";

describe("NumberInput SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<NumberInputSection open={false} />);
    // Ark's number-input machine. The recipe lands on each root, each input
    // reaches the server as a spinbutton with its value, bounds and formatted
    // text, named by its label, and a stepper at its bound is already disabled.
    expect(partAttrs(html, "number-input", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "number-input", "input", "role")).toEqual(["spinbutton", "spinbutton"]);
    expect(partAttrs(html, "number-input", "input", "aria-valuenow")).toEqual(["10", "1234.5"]);
    expect(partAttrs(html, "number-input", "input", "aria-valuemin")[0]).toBe("0");
    expect(partAttrs(html, "number-input", "input", "aria-valuemax")[0]).toBe("10");
    expect(partAttrs(html, "number-input", "input", "value")).toEqual(["10", "$1,234.50"]);
    expect(partAttrs(html, "number-input", "label", "for")).toEqual(
      partAttrs(html, "number-input", "input", "id"),
    );
    const steppersDisabled = (part: string) =>
      partTags(html, "number-input", part).map((tag) => /\sdisabled(?:=""|[\s>])/.test(tag));
    expect(steppersDisabled("increment-trigger")).toEqual([true, false]);
    expect(steppersDisabled("decrement-trigger")).toEqual([false, false]);
  });
});
