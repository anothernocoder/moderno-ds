import { describe, expect, it } from "vitest";
import {
  EDITABLE_DEFAULT_ACTIVATION_MODE,
  arkEditableActivationMode,
  createEditableFocusReturn,
  editablePreviewTitle,
  editableRecipe,
  editableTranslations,
  isEditableStartKey,
} from "../../src/recipes/editable.js";

describe("editableRecipe", () => {
  it("defaults to size md", () => {
    expect(editableRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(editableRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for what Ark already decides", () => {
    // The value, the modes, placeholder, maxLength, disabled and readOnly are
    // Ark's props; editing, an empty value and invalid are Ark's data-*.
    expect(Object.keys(editableRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not an editable size
    expect(() => editableRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});

describe("Editable activation", () => {
  it("starts on a double click by default", () => {
    expect(EDITABLE_DEFAULT_ACTIVATION_MODE).toBe("dblclick");
  });

  it("hands Ark every mode but focus, which the Preview starts itself", () => {
    expect(arkEditableActivationMode("focus")).toBe("none");
    for (const mode of ["click", "dblclick", "none"] as const) {
      expect(arkEditableActivationMode(mode)).toBe(mode);
    }
  });

  it("starts an edit on Enter, F2 and Space, and on no other key", () => {
    for (const key of ["Enter", "F2", " "]) expect(isEditableStartKey(key), key).toBe(true);
    for (const key of ["a", "Escape", "Tab", "F1", "ArrowDown"]) {
      expect(isEditableStartKey(key), key).toBe(false);
    }
  });
});

describe("editableTranslations", () => {
  it("names the buttons by the words they show", () => {
    expect(editableTranslations).toMatchObject({ edit: "Edit", submit: "Save", cancel: "Cancel" });
  });
});

describe("createEditableFocusReturn", () => {
  const preview = { id: "preview" };

  it("gives back the registered Preview, or nothing", () => {
    const focusReturn = createEditableFocusReturn<typeof preview>();
    expect(focusReturn.finalFocusEl()).toBeNull();
    focusReturn.setPreview(preview);
    expect(focusReturn.finalFocusEl()).toBe(preview);
    focusReturn.setPreview(null);
    expect(focusReturn.finalFocusEl()).toBeNull();
  });

  it("marks the focus that follows as a return, until the current task's microtasks run", async () => {
    const focusReturn = createEditableFocusReturn<typeof preview>();
    focusReturn.setPreview(preview);
    expect(focusReturn.isReturning()).toBe(false);
    focusReturn.finalFocusEl();
    expect(focusReturn.isReturning()).toBe(true);
    await Promise.resolve();
    expect(focusReturn.isReturning()).toBe(false);
  });

  it("never marks a return when there is no Preview to focus", () => {
    const focusReturn = createEditableFocusReturn<typeof preview>();
    focusReturn.finalFocusEl();
    expect(focusReturn.isReturning()).toBe(false);
  });
});

describe("editablePreviewTitle", () => {
  it("is the full value when the text is cut short", () => {
    expect(editablePreviewTitle({ scrollWidth: 240, clientWidth: 80 }, "A long name")).toBe(
      "A long name",
    );
  });

  it("is nothing when the whole value shows", () => {
    expect(editablePreviewTitle({ scrollWidth: 80, clientWidth: 80 }, "Short")).toBeUndefined();
  });
});
