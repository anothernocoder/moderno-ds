/**
 * Editable's prop types and the settings its Root hands to the Moderno
 * parts, in a `.ts` file rather than inside the `.svelte`s, for the same
 * reason as `callout-props.ts`: a `Props` interface declared inside a
 * component's instance script is not exported, so `index.ts` could not
 * re-export it by name.
 */
import { getContext, setContext } from "svelte";
import type { EditableRootProps, UseEditableProps } from "@ark-ui/svelte";
import {
  EDITABLE_DEFAULT_ACTIVATION_MODE,
  createEditableFocusReturn,
  type EditableActivationMode,
  type EditableFocusReturn,
  type EditableSize,
} from "@moderno-ui/core";

/**
 * `Editable.Root`: Ark's own props (`value` is bindable), plus the Moderno
 * `size` recipe and a double click as the default `activationMode`.
 */
export interface ModernoEditableRootProps extends EditableRootProps {
  /** Text and input height and type, matched to the Field sizes — resolves to `data-size` on the root part. */
  size?: EditableSize;
  /** What turns the text into an input. Defaults to `"dblclick"`. */
  activationMode?: EditableActivationMode;
}

/**
 * Ark's machine props the Root hands on as they are. Only the ones the
 * consumer set are handed on: a Field's `disabled`, `invalid`, `readOnly`
 * and `required` reach the machine unless the Editable sets its own.
 */
const PASSED_MACHINE_PROPS = [
  "autoResize",
  "defaultEdit",
  "disabled",
  "edit",
  "form",
  "ids",
  "invalid",
  "maxLength",
  "name",
  "onEditChange",
  "onFocusOutside",
  "onInteractOutside",
  "onPointerDownOutside",
  "onValueCommit",
  "placeholder",
  "readOnly",
  "required",
  "submitMode",
] as const satisfies readonly (keyof UseEditableProps)[];

type PassedMachineProps = Pick<UseEditableProps, (typeof PASSED_MACHINE_PROPS)[number]>;

/** The Root's remaining props split into the machine's and the root element's. */
export function splitEditableRootProps<Props extends PassedMachineProps>(
  props: Props,
): [PassedMachineProps, Omit<Props, keyof PassedMachineProps>] {
  const machine: Record<string, unknown> = {};
  const element: Record<string, unknown> = { ...props };
  for (const key of PASSED_MACHINE_PROPS) {
    if (props[key] !== undefined) machine[key] = props[key];
    delete element[key];
  }
  return [machine as PassedMachineProps, element as Omit<Props, keyof PassedMachineProps>];
}

/** What the Root tells the Moderno parts: the Ark API does not carry these. */
export interface EditableSettings {
  readonly activationMode: EditableActivationMode;
  readonly selectOnFocus: boolean;
  readonly focusReturn: EditableFocusReturn<HTMLElement>;
}

const SETTINGS = Symbol("ModernoEditableSettings");

/** The Root hands its settings to the parts inside it. */
export function setEditableSettings(settings: EditableSettings): void {
  setContext(SETTINGS, settings);
}

/** A part reads the nearest Root's settings, or the defaults outside one. */
export function getEditableSettings(): EditableSettings {
  return (
    getContext<EditableSettings | undefined>(SETTINGS) ?? {
      activationMode: EDITABLE_DEFAULT_ACTIVATION_MODE,
      selectOnFocus: true,
      focusReturn: createEditableFocusReturn<HTMLElement>(),
    }
  );
}
