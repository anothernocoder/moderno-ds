import { cva, type VariantProps } from "../cva.js";

/**
 * Editable: `size` on the root — the height and type of the text and of the
 * input that replaces it, matched to the Field sizes so nothing moves when
 * an edit starts. The value, the modes, `placeholder`, `maxLength`,
 * `disabled` and `readOnly` are Ark's own props; editing, an empty value,
 * invalid and disabled surface as Ark's `data-*`. The rest of this file is
 * what every binding shares on top of Ark: the default activation, the keys
 * that start an edit, the button names, focus going back to the text, and
 * the full value of a truncated text.
 */
export const editableRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Editable's density (text and input height, type), shared by every part. */
export type EditableSize = NonNullable<VariantProps<typeof editableRecipe.variants>["size"]>;

/** What turns the text into an input: a focus, a click, a double click, or nothing but a trigger. */
export type EditableActivationMode = "focus" | "click" | "dblclick" | "none";

/** An inline rename starts on a double click, as in a file list or a layers panel. */
export const EDITABLE_DEFAULT_ACTIVATION_MODE: EditableActivationMode = "dblclick";

/**
 * The mode Ark is given. Moderno's Preview starts a `focus` edit itself, so
 * it can tell a user's focus from the focus it gives back after a save or a
 * cancel; Ark would start a new edit on both.
 */
export function arkEditableActivationMode(mode: EditableActivationMode): EditableActivationMode {
  return mode === "focus" ? "none" : mode;
}

/** The keys that start an edit from the focused text: Enter and F2, and Space as on any button. */
const START_KEYS = new Set(["Enter", "F2", " "]);

/** Whether a key pressed on the focused text starts an edit. */
export function isEditableStartKey(key: string): boolean {
  return START_KEYS.has(key);
}

/**
 * The names of the edit, save and cancel buttons, which Ark sets as their
 * `aria-label`: they match the words a button shows. Ark's own are
 * lower-case and call the save button "submit". `input` names the input
 * only when there is no label. A consumer's `translations` replace them,
 * for another language.
 */
export const editableTranslations = {
  edit: "Edit",
  submit: "Save",
  cancel: "Cancel",
  input: "Value",
} as const;

/**
 * Where focus goes after a save or a cancel: back to the text. The Root
 * hands `finalFocusEl` to Ark, the Preview registers its element, and the
 * Preview asks `isReturning()` on focus, so the focus given back is never
 * read as a user's focus that starts another edit. `Element` is the DOM
 * element type of the binding (core has no DOM types).
 */
export interface EditableFocusReturn<Element> {
  /** The Preview's element, or `null` once it is gone. */
  setPreview(element: Element | null): void;
  /** Ark's `finalFocusEl`: the Preview, marked as a return for the focus that follows. */
  finalFocusEl(): Element | null;
  /** Whether the focus now arriving is the return after a save or a cancel. */
  isReturning(): boolean;
}

/** One Editable's focus return, created by its Root. */
export function createEditableFocusReturn<Element>(): EditableFocusReturn<Element> {
  let preview: Element | null = null;
  let returning = false;
  return {
    setPreview(element) {
      preview = element;
    },
    finalFocusEl() {
      // Ark focuses the element right after this call, and a focus event is
      // dispatched synchronously: the mark lasts until that event is seen.
      returning = preview !== null;
      queueMicrotask(() => {
        returning = false;
      });
      return preview;
    },
    isReturning: () => returning,
  };
}

/** The box of the text, as the Preview measures it. */
export interface EditableTextBox {
  scrollWidth: number;
  clientWidth: number;
}

/**
 * The tooltip of the text: the full value when the text is cut short with
 * an ellipsis, and none when the whole value shows.
 */
export function editablePreviewTitle(box: EditableTextBox, value: string): string | undefined {
  return box.scrollWidth > box.clientWidth ? value : undefined;
}
