import { createContext, createSignal, splitProps, useContext, type JSX } from "solid-js";
import { Editable as ArkEditable, useEditableContext, useFieldContext } from "@ark-ui/solid";
import type {
  EditableInputProps,
  EditablePreviewProps,
  EditableRootProps,
  EditableValueChangeDetails,
} from "@ark-ui/solid";
import {
  EDITABLE_DEFAULT_ACTIVATION_MODE,
  arkEditableActivationMode,
  createEditableFocusReturn,
  editablePreviewTitle,
  editableRecipe,
  editableTranslations,
  isEditableStartKey,
  type EditableActivationMode,
  type EditableFocusReturn,
  type EditableSize,
} from "@moderno-ui/core";

export type { EditableActivationMode, EditableSize } from "@moderno-ui/core";

export type ModernoEditableRootProps = EditableRootProps & {
  /** Text and input height and type, matched to the Field sizes — resolves to `data-size` on the root part. */
  size?: EditableSize;
  /** What turns the text into an input. Defaults to `"dblclick"`. */
  activationMode?: EditableActivationMode;
};

/** What the Root tells the Moderno parts: the Ark API does not carry these. */
interface EditableSettings {
  readonly activationMode: EditableActivationMode;
  readonly selectOnFocus: boolean;
  readonly focusReturn: EditableFocusReturn<HTMLElement>;
}

const EditableSettingsContext = createContext<EditableSettings>({
  activationMode: EDITABLE_DEFAULT_ACTIVATION_MODE,
  selectOnFocus: true,
  focusReturn: createEditableFocusReturn<HTMLElement>(),
});

/**
 * Editable.Root with the Moderno `size` recipe folded in, a double click as
 * the default activation, button names that match their words, and the
 * value held here rather than in Ark: Escape puts back the value from before
 * the edit even when it was empty (Ark keeps the typed text then). The
 * Input selects its text itself when an edit starts (`selectOnFocus`): Ark
 * only calls `select()`, which does not focus the input in every browser.
 * After a save or a cancel, focus goes back to the text.
 */
function EditableRoot(props: ModernoEditableRootProps) {
  const [local, rest] = splitProps(props, [
    "size",
    "activationMode",
    "selectOnFocus",
    "value",
    "defaultValue",
    "translations",
    "finalFocusEl",
    "onValueChange",
    "onValueRevert",
  ]);
  const [uncontrolled, setUncontrolled] = createSignal(local.defaultValue ?? "");
  const current = () => local.value ?? uncontrolled();
  const activationMode = () => local.activationMode ?? EDITABLE_DEFAULT_ACTIVATION_MODE;
  const focusReturn = createEditableFocusReturn<HTMLElement>();

  function change(next: string) {
    if (next === current()) return;
    if (local.value === undefined) setUncontrolled(next);
    local.onValueChange?.({ value: next });
  }

  const settings: EditableSettings = {
    get activationMode() {
      return activationMode();
    },
    get selectOnFocus() {
      return local.selectOnFocus ?? true;
    },
    focusReturn,
  };

  return (
    <EditableSettingsContext.Provider value={settings}>
      <ArkEditable.Root
        {...rest}
        {...editableRecipe({ size: local.size })}
        value={current()}
        activationMode={arkEditableActivationMode(activationMode())}
        selectOnFocus={false}
        translations={{ ...editableTranslations, ...local.translations }}
        finalFocusEl={local.finalFocusEl ?? focusReturn.finalFocusEl}
        onValueChange={(details: EditableValueChangeDetails) => change(details.value)}
        onValueRevert={(details: EditableValueChangeDetails) => {
          change(details.value);
          local.onValueRevert?.(details);
        }}
      />
    </EditableSettingsContext.Provider>
  );
}

/**
 * Editable.Preview, Ark's text, as a button a keyboard reaches: Enter, F2
 * or Space starts an edit, the label and the value name it (Ark would name
 * it "edit"), and the Field's helper and error text describe it. A value
 * cut short shows in full as its tooltip. It is where focus returns after a
 * save or a cancel.
 */
function EditablePreview(props: EditablePreviewProps) {
  const [local, rest] = splitProps(props, ["ref", "onFocusIn", "onKeyDown", "onPointerEnter"]);
  const editable = useEditableContext();
  const field = useFieldContext();
  const settings = useContext(EditableSettingsContext);
  const [title, setTitle] = createSignal<string>();
  const interactive = () => editable().getPreviewProps().tabIndex === 0;

  function setRef(element: HTMLSpanElement) {
    settings.focusReturn.setPreview(element);
    if (typeof local.ref === "function") local.ref(element);
  }

  // `focusin`, not `focus`: it comes after `focus`, so the edit it starts
  // cannot read this same focus as one outside the input.
  const handleFocusIn: JSX.EventHandler<HTMLSpanElement, FocusEvent> = (event) => {
    if (typeof local.onFocusIn === "function") local.onFocusIn(event);
    if (settings.activationMode !== "focus" || settings.focusReturn.isReturning()) return;
    editable().edit();
  };

  const handleKeyDown: JSX.EventHandler<HTMLSpanElement, KeyboardEvent> = (event) => {
    if (typeof local.onKeyDown === "function") local.onKeyDown(event);
    if (event.defaultPrevented || settings.activationMode === "none") return;
    if (!isEditableStartKey(event.key)) return;
    event.preventDefault();
    editable().edit();
  };

  const handlePointerEnter: JSX.EventHandler<HTMLSpanElement, PointerEvent> = (event) => {
    if (typeof local.onPointerEnter === "function") local.onPointerEnter(event);
    setTitle(editablePreviewTitle(event.currentTarget, editable().value));
  };

  return (
    <ArkEditable.Preview
      ref={setRef}
      role={interactive() ? "button" : undefined}
      aria-label={editable().valueText}
      aria-labelledby={
        interactive()
          ? `${editable().getLabelProps().id} ${editable().getPreviewProps().id}`
          : undefined
      }
      aria-describedby={field?.().ariaDescribedby}
      title={title()}
      {...rest}
      onFocusIn={handleFocusIn}
      onKeyDown={handleKeyDown}
      onPointerEnter={handlePointerEnter}
    />
  );
}

/**
 * Editable.Input, Ark's input, named by the label (Ark's own fallback name
 * would override it) and described by the Field's helper and error text.
 * Focused as an edit starts, it selects the whole text.
 */
function EditableInput(props: EditableInputProps) {
  const [local, rest] = splitProps(props, ["onFocus"]);
  const editable = useEditableContext();
  const settings = useContext(EditableSettingsContext);

  const handleFocus: JSX.FocusEventHandler<HTMLInputElement, FocusEvent> = (event) => {
    if (typeof local.onFocus === "function") local.onFocus(event);
    if (settings.selectOnFocus) event.currentTarget.select();
  };

  return (
    <ArkEditable.Input
      aria-labelledby={editable().getLabelProps().id}
      {...rest}
      onFocus={handleFocus}
    />
  );
}

/**
 * Editable — text that turns into an input to rename something in place: a
 * layer, a slide, a file. Double click the text (or set `activationMode`),
 * type, then Enter or a click away saves and Escape cancels.
 *
 * Ark drives the machine: it swaps the `Preview` for the `Input`, saves on
 * Enter and on blur (`submitMode`), cancels on Escape, and wires the
 * optional `EditTrigger`, `SubmitTrigger` and `CancelTrigger`; its Input
 * already carries the Field's description. `Root`, `Preview` and `Input` are
 * wrapped (the recipe, the double-click default, the value put back on
 * Escape, the text selected, focus back to the text, the keys that start an
 * edit, the names and the tooltip); every other part is Ark's verbatim. The
 * object is annotated so the emitted `.d.ts` doesn't inline an un-nameable
 * `@zag-js` type (TS2742).
 */
export const Editable: Omit<typeof ArkEditable, "Root" | "Preview" | "Input"> & {
  Root: typeof EditableRoot;
  Preview: typeof EditablePreview;
  Input: typeof EditableInput;
} = {
  ...ArkEditable,
  Root: EditableRoot,
  Preview: EditablePreview,
  Input: EditableInput,
};

export type {
  EditableRootProps,
  EditableLabelProps,
  EditableAreaProps,
  EditablePreviewProps,
  EditableInputProps,
  EditableControlProps,
  EditableEditTriggerProps,
  EditableSubmitTriggerProps,
  EditableCancelTriggerProps,
  EditableValueChangeDetails,
  EditableEditChangeDetails,
} from "@ark-ui/solid";
