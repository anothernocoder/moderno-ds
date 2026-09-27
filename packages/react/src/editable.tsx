import {
  createContext,
  useContext,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
} from "react";
import { Editable as ArkEditable, useEditableContext, useFieldContext } from "@ark-ui/react";
import type {
  EditableInputProps,
  EditablePreviewProps,
  EditableRootProps,
  EditableValueChangeDetails,
} from "@ark-ui/react";
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

export interface ModernoEditableRootProps extends EditableRootProps {
  /** Text and input height and type, matched to the Field sizes — resolves to `data-size` on the root part. */
  size?: EditableSize;
  /** What turns the text into an input. Defaults to `"dblclick"`. */
  activationMode?: EditableActivationMode;
}

/** What the Root tells the Moderno parts: the Ark API does not carry these. */
interface EditableSettings {
  activationMode: EditableActivationMode;
  selectOnFocus: boolean;
  focusReturn: EditableFocusReturn<HTMLElement>;
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
function EditableRoot({
  size,
  activationMode = EDITABLE_DEFAULT_ACTIVATION_MODE,
  selectOnFocus = true,
  value,
  defaultValue = "",
  translations,
  finalFocusEl,
  onValueChange,
  onValueRevert,
  ...props
}: ModernoEditableRootProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const [focusReturn] = useState(createEditableFocusReturn<HTMLElement>);
  const current = value ?? uncontrolled;
  // The last value reported, so one change is never reported twice before a render.
  const reported = useRef(current);
  reported.current = current;

  function change(next: string) {
    if (next === reported.current) return;
    reported.current = next;
    if (value === undefined) setUncontrolled(next);
    onValueChange?.({ value: next });
  }

  return (
    <EditableSettingsContext.Provider value={{ activationMode, selectOnFocus, focusReturn }}>
      <ArkEditable.Root
        {...props}
        {...editableRecipe({ size })}
        value={current}
        activationMode={arkEditableActivationMode(activationMode)}
        selectOnFocus={false}
        translations={{ ...editableTranslations, ...translations }}
        finalFocusEl={finalFocusEl ?? focusReturn.finalFocusEl}
        onValueChange={(details: EditableValueChangeDetails) => change(details.value)}
        onValueRevert={(details: EditableValueChangeDetails) => {
          change(details.value);
          onValueRevert?.(details);
        }}
      />
    </EditableSettingsContext.Provider>
  );
}

/** A ref that hands the element to the consumer's ref and to `own`. */
function mergeRefs(
  ref: Ref<HTMLSpanElement> | undefined,
  own: (element: HTMLElement | null) => void,
): (element: HTMLSpanElement | null) => void {
  return (element) => {
    own(element);
    if (typeof ref === "function") ref(element);
    else if (ref) ref.current = element;
  };
}

/**
 * Editable.Preview, Ark's text, as a button a keyboard reaches: Enter, F2
 * or Space starts an edit, the label and the value name it (Ark would name
 * it "edit"), and the Field's helper and error text describe it. A value
 * cut short shows in full as its tooltip. It is where focus returns after a
 * save or a cancel.
 */
function EditablePreview({
  ref,
  onFocus,
  onKeyDown,
  onPointerEnter,
  ...props
}: EditablePreviewProps & { ref?: Ref<HTMLSpanElement> }) {
  const editable = useEditableContext();
  const field = useFieldContext();
  const settings = useContext(EditableSettingsContext);
  const [title, setTitle] = useState<string>();
  const preview = editable.getPreviewProps();
  const interactive = preview.tabIndex === 0;

  function handleFocus(event: FocusEvent<HTMLSpanElement>) {
    onFocus?.(event);
    if (settings.activationMode !== "focus" || settings.focusReturn.isReturning()) return;
    editable.edit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || settings.activationMode === "none") return;
    if (!isEditableStartKey(event.key)) return;
    event.preventDefault();
    editable.edit();
  }

  function handlePointerEnter(event: PointerEvent<HTMLSpanElement>) {
    onPointerEnter?.(event);
    setTitle(editablePreviewTitle(event.currentTarget, editable.value));
  }

  return (
    <ArkEditable.Preview
      ref={mergeRefs(ref, settings.focusReturn.setPreview)}
      role={interactive ? "button" : undefined}
      aria-label={editable.valueText}
      aria-labelledby={interactive ? `${editable.getLabelProps().id} ${preview.id}` : undefined}
      aria-describedby={field?.ariaDescribedby}
      title={title}
      {...props}
      onFocus={handleFocus}
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
function EditableInput({ onFocus, ...props }: EditableInputProps) {
  const editable = useEditableContext();
  const field = useFieldContext();
  const settings = useContext(EditableSettingsContext);

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    onFocus?.(event);
    if (settings.selectOnFocus) event.currentTarget.select();
  }

  return (
    <ArkEditable.Input
      aria-labelledby={editable.getLabelProps().id}
      aria-describedby={field?.ariaDescribedby}
      {...props}
      onFocus={handleFocus}
    />
  );
}

/**
 * Editable — text that turns into an input to rename something in place: a
 * layer, a slide, a file. Double click the text (or set `activationMode`),
 * type, then Enter or a click away saves and Escape cancels.
 *
 * Ark drives the machine: it swaps the `Preview` for the `Input`, selects
 * the text when an edit starts, saves on Enter and on blur (`submitMode`),
 * cancels on Escape, and wires the optional `EditTrigger`, `SubmitTrigger`
 * and `CancelTrigger`. Anatomy: `Root > Label + Area > Input + Preview`,
 * then an optional `Control > EditTrigger + SubmitTrigger + CancelTrigger`.
 * `Root`, `Preview` and `Input` are wrapped (the recipe, the double-click
 * default, the value put back on Escape, focus back to the text, the keys
 * that start an edit, the names and the tooltip); every other part is Ark's
 * verbatim. The object is annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
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
} from "@ark-ui/react";
