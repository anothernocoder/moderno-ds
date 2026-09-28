// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  splitToolbarKeyDown,
  toolbarRecipe,
  toolbarTooltipText,
  toolbarTooltipTriggerProps,
  withoutEventHandlers,
} from "../../src/recipes/toolbar.js";
import { buttonRecipe } from "../../src/recipes/button.js";

describe("toolbarRecipe", () => {
  it("defaults to size md", () => {
    expect(toolbarRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(toolbarRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
  });

  it("offers Button's sizes", () => {
    expect(toolbarRecipe.variants.size).toEqual(buttonRecipe.variants.size);
  });

  it("carries no variant for what the machine already decides", () => {
    // Orientation, the Tab stop, pressed and disabled are the machine's data-*.
    expect(Object.keys(toolbarRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a toolbar size
    expect(() => toolbarRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});

describe("toolbarTooltipText", () => {
  it("is the name alone when there is no shortcut", () => {
    expect(toolbarTooltipText("Undo")).toBe("Undo");
  });

  it("adds the shortcut after the name", () => {
    expect(toolbarTooltipText("Undo", "⌘Z")).toBe("Undo (⌘Z)");
  });
});

describe("toolbarTooltipTriggerProps", () => {
  const item = (part: string) => {
    const el = document.createElement("button");
    el.setAttribute("data-scope", "toolbar");
    el.setAttribute("data-part", part);
    return el;
  };

  for (const key of ["onBlur", "onblur", "onFocusOut"]) {
    it(`leaves the tooltip open when focus moves to another item (${key})`, () => {
      const onBlur = vi.fn();
      const props = toolbarTooltipTriggerProps<Record<string, unknown>>({
        id: "undo",
        [key]: onBlur,
      });
      const blur = props[key] as (event: { relatedTarget: EventTarget | null }) => void;

      blur({ relatedTarget: item("button") });
      blur({ relatedTarget: item("toggle") });
      expect(onBlur).not.toHaveBeenCalled();

      blur({ relatedTarget: document.createElement("button") });
      blur({ relatedTarget: null });
      expect(onBlur).toHaveBeenCalledTimes(2);
      expect(props.id).toBe("undo");
    });
  }
});

describe("withoutEventHandlers", () => {
  it("drops every handler, in any framework's spelling, and keeps the rest", () => {
    const noop = () => {};
    expect(
      withoutEventHandlers({
        onClick: noop,
        onclick: noop,
        onPointerDown: noop,
        id: "more",
        "aria-haspopup": "menu",
        tabIndex: -1,
      }),
    ).toEqual({ id: "more", "aria-haspopup": "menu", tabIndex: -1 });
  });

  it("keeps a prop that starts with on but is not a function", () => {
    expect(withoutEventHandlers({ one: "1" })).toEqual({ one: "1" });
  });
});

describe("splitToolbarKeyDown", () => {
  it("takes the key-down handler out, in any framework's spelling, and keeps the rest", () => {
    const onKeyDown = () => {};
    const onFocus = () => {};
    for (const key of ["onKeyDown", "onKeydown", "onkeydown"]) {
      expect(splitToolbarKeyDown({ [key]: onKeyDown, onFocus, tabIndex: 0 })).toEqual({
        keyDown: { [key]: onKeyDown },
        rest: { onFocus, tabIndex: 0 },
      });
    }
  });

  it("returns an empty handler when the props have none", () => {
    expect(splitToolbarKeyDown({ id: "more" })).toEqual({ keyDown: {}, rest: { id: "more" } });
  });
});
