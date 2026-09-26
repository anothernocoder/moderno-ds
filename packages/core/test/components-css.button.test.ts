import { describe, expect, it } from "vitest";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("button");

/*
 * Button is a plain native <button> in every binding — no Ark machine — so two
 * browser defaults leak through unless the sheet overrides them: the UA grey
 * `buttonface` fill (visible on `ghost`, the one variant with no fill of its
 * own), and a native `disabled` that no one turns into `data-disabled`, so the
 * shared base affordance (`[data-disabled]` → dimmed, inert) never reaches it.
 */
describe("@moderno-ui/core components.css — Button overrides the native defaults", () => {
  const BUTTON = `[data-scope="button"][data-part="root"]`;

  it("clears the UA button fill on the root, so ghost is transparent anywhere", () => {
    expect(prop(ruleDecls(root, BUTTON), "background-color")).toBe("transparent");
  });

  it("dims and disables a native :disabled button like [data-disabled]", () => {
    const decls = ruleDecls(root, `${BUTTON}:disabled`);
    expect(prop(decls, "opacity")).toBe("0.5");
    expect(prop(decls, "pointer-events")).toBe("none");
  });
});
