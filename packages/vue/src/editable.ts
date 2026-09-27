import {
  computed,
  defineComponent,
  h,
  inject,
  mergeProps,
  provide,
  ref,
  type Component,
  type ComponentPublicInstance,
  type DefineComponent,
  type InjectionKey,
  type PropType,
} from "vue";
import { Editable as ArkEditable, useEditableContext, useFieldContext } from "@ark-ui/vue";
import type { EditableRootProps, EditableValueChangeDetails } from "@ark-ui/vue";
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

/**
 * The Root's public surface: Ark's own props plus the Moderno `size`
 * recipe. Ark-Vue declares the change callbacks as emits rather than props,
 * so they are spelled out here — a `h()` caller (and a template) passes them
 * as `onValueChange` / `onValueCommit` / `onValueRevert` /
 * `onUpdate:modelValue` handlers.
 */
export interface ModernoEditableRootProps extends EditableRootProps {
  size?: EditableSize;
  activationMode?: EditableActivationMode;
  onValueChange?: (details: EditableValueChangeDetails) => void;
  onValueCommit?: (details: EditableValueChangeDetails) => void;
  onValueRevert?: (details: EditableValueChangeDetails) => void;
  "onUpdate:modelValue"?: (value: string) => void;
}

/** What the Root tells the Moderno parts: the Ark API does not carry these. */
interface EditableSettings {
  readonly activationMode: EditableActivationMode;
  readonly selectOnFocus: boolean;
  readonly focusReturn: EditableFocusReturn<HTMLElement>;
}

const SETTINGS: InjectionKey<EditableSettings> = Symbol("ModernoEditableSettings");
const DEFAULT_SETTINGS: EditableSettings = {
  activationMode: EDITABLE_DEFAULT_ACTIVATION_MODE,
  selectOnFocus: true,
  focusReturn: createEditableFocusReturn<HTMLElement>(),
};

/**
 * Editable.Root with the Moderno `size` recipe folded in, a double click as
 * the default activation, button names that match their words, and the
 * value held here rather than in Ark: Escape puts back the value from before
 * the edit even when it was empty (Ark keeps the typed text then). The
 * Input selects its text itself when an edit starts (`selectOnFocus`): Ark
 * only calls `select()`, which does not focus the input in every browser.
 * After a save or a cancel, focus goes back to the text.
 */
const EditableRootImpl = defineComponent({
  name: "ModernoEditableRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<EditableSize>, default: undefined },
    activationMode: {
      type: String as PropType<EditableActivationMode>,
      default: EDITABLE_DEFAULT_ACTIVATION_MODE,
    },
    selectOnFocus: { type: Boolean, default: true },
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: "" },
    translations: {
      type: Object as PropType<EditableRootProps["translations"]>,
      default: undefined,
    },
    finalFocusEl: {
      type: Function as PropType<() => HTMLElement | null>,
      default: undefined,
    },
  },
  emits: ["valueChange", "valueRevert", "update:modelValue"],
  setup(props, { slots, attrs, emit }) {
    const uncontrolled = ref(props.defaultValue);
    const current = computed(() => props.modelValue ?? uncontrolled.value);
    const focusReturn = createEditableFocusReturn<HTMLElement>();
    // The last value reported, so one change is never reported twice before a render.
    let reported = current.value;

    function change(next: string) {
      if (next === reported || next === current.value) return;
      reported = next;
      if (props.modelValue === undefined) uncontrolled.value = next;
      emit("valueChange", { value: next });
      emit("update:modelValue", next);
    }

    provide(SETTINGS, {
      get activationMode() {
        return props.activationMode;
      },
      get selectOnFocus() {
        return props.selectOnFocus;
      },
      focusReturn,
    });

    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union.
    const Root = ArkEditable.Root as unknown as Component;
    return () => {
      reported = current.value;
      return h(
        Root,
        {
          ...attrs,
          ...editableRecipe({ size: props.size }),
          modelValue: current.value,
          activationMode: arkEditableActivationMode(props.activationMode),
          selectOnFocus: false,
          translations: { ...editableTranslations, ...props.translations },
          finalFocusEl: props.finalFocusEl ?? focusReturn.finalFocusEl,
          onValueChange: (details: EditableValueChangeDetails) => change(details.value),
          onValueRevert: (details: EditableValueChangeDetails) => {
            change(details.value);
            emit("valueRevert", details);
          },
        },
        slots,
      );
    };
  },
});

/** The DOM element of a Vue template ref: Ark's parts expose theirs as `$el`. */
function elementOf(target: Element | ComponentPublicInstance | null): HTMLElement | null {
  if (target === null) return null;
  const element = "$el" in target ? target.$el : target;
  return element instanceof HTMLElement ? element : null;
}

/**
 * Editable.Preview, Ark's text, as a button a keyboard reaches: Enter, F2
 * or Space starts an edit, the label and the value name it (Ark would name
 * it "edit"), and the Field's helper and error text describe it. A value
 * cut short shows in full as its tooltip. It is where focus returns after a
 * save or a cancel. The value renders as text: Ark-Vue would write it as
 * HTML.
 */
const EditablePreviewImpl = defineComponent({
  name: "ModernoEditablePreview",
  inheritAttrs: false,
  setup(_props, { slots, attrs }) {
    const editable = useEditableContext();
    const field = useFieldContext();
    const settings = inject(SETTINGS, DEFAULT_SETTINGS);
    const title = ref<string>();

    function handleFocus() {
      if (settings.activationMode !== "focus" || settings.focusReturn.isReturning()) return;
      editable.value.edit();
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented || settings.activationMode === "none") return;
      if (!isEditableStartKey(event.key)) return;
      event.preventDefault();
      editable.value.edit();
    }

    function handlePointerenter(event: PointerEvent) {
      const element = event.currentTarget as HTMLElement;
      title.value = editablePreviewTitle(element, editable.value.value);
    }

    const Preview = ArkEditable.Preview as unknown as Component;
    return () => {
      const preview = editable.value.getPreviewProps();
      const interactive = preview.tabindex === 0;
      return h(
        Preview,
        mergeProps(
          {
            ref: (target: Element | ComponentPublicInstance | null) =>
              settings.focusReturn.setPreview(elementOf(target)),
            innerHTML: undefined,
            role: interactive ? "button" : undefined,
            "aria-label": editable.value.valueText,
            "aria-labelledby": interactive
              ? `${String(editable.value.getLabelProps().id)} ${String(preview.id)}`
              : undefined,
            "aria-describedby": field?.value.ariaDescribedby,
            title: title.value,
          },
          attrs,
          {
            // `focusin`, not `focus`: it comes after `focus`, so the edit it
            // starts cannot read this same focus as one outside the input.
            onFocusin: handleFocus,
            onKeydown: handleKeydown,
            onPointerenter: handlePointerenter,
          },
        ),
        { default: slots.default ?? (() => editable.value.valueText) },
      );
    };
  },
});

/**
 * Editable.Input, Ark's input, named by the label (Ark's own fallback name
 * would override it) and described by the Field's helper and error text.
 * Focused as an edit starts, it selects the whole text.
 */
const EditableInputImpl = defineComponent({
  name: "ModernoEditableInput",
  inheritAttrs: false,
  setup(_props, { attrs }) {
    const editable = useEditableContext();
    const field = useFieldContext();
    const settings = inject(SETTINGS, DEFAULT_SETTINGS);

    function handleFocus(event: FocusEvent) {
      if (settings.selectOnFocus) (event.currentTarget as HTMLInputElement).select();
    }

    const Input = ArkEditable.Input as unknown as Component;
    return () =>
      h(
        Input,
        mergeProps(
          {
            "aria-labelledby": editable.value.getLabelProps().id,
            "aria-describedby": field?.value.ariaDescribedby,
          },
          attrs,
          { onFocus: handleFocus },
        ),
      );
  },
});

/**
 * Editable — text that turns into an input to rename something in place: a
 * layer, a slide, a file. Double click the text (or set `activationMode`),
 * type, then Enter or a click away saves and Escape cancels. Ark drives the
 * machine: it swaps the `Preview` for the `Input`, saves on Enter and on
 * blur (`submitMode`), cancels on Escape, and wires the optional
 * `EditTrigger`, `SubmitTrigger` and `CancelTrigger`. `Root`, `Preview` and
 * `Input` are wrapped (the recipe, the double-click default, the value put
 * back on Escape, the text selected, focus back to the text, the keys that
 * start an edit, the names and the tooltip); every other part is Ark's
 * verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Editable: Omit<typeof ArkEditable, "Root" | "Preview" | "Input"> & {
  Root: DefineComponent<ModernoEditableRootProps>;
  Preview: typeof ArkEditable.Preview;
  Input: typeof ArkEditable.Input;
} = {
  ...ArkEditable,
  Root: EditableRootImpl as unknown as DefineComponent<ModernoEditableRootProps>,
  Preview: EditablePreviewImpl as unknown as typeof ArkEditable.Preview,
  Input: EditableInputImpl as unknown as typeof ArkEditable.Input,
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
} from "@ark-ui/vue";
