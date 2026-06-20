/**
 * @moderno/react — reference React 19 bindings.
 *
 * Ark UI provides headless behaviour; `@moderno/core` recipes map props to
 * `data-*`; `@moderno/css` (the shared `components.css`) paints everything from
 * token slots. Components ship no styling of their own — import the CSS once:
 *
 *   import "@moderno/css";
 */

export { Button } from "./button.js";
export type { ButtonProps } from "./button.js";

export { Field } from "./field.js";
export type {
  FieldRootProps,
  FieldLabelProps,
  FieldInputProps,
  FieldTextareaProps,
  FieldHelperTextProps,
  FieldErrorTextProps,
} from "./field.js";

export { Dialog, Portal } from "./dialog.js";
export type {
  DialogRootProps,
  DialogTriggerProps,
  DialogBackdropProps,
  DialogPositionerProps,
  DialogContentProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseTriggerProps,
} from "./dialog.js";

export { Select, createListCollection } from "./select.js";
export type {
  SelectSize,
  ModernoSelectRootProps,
  CollectionItem,
  ListCollection,
  SelectValueChangeDetails,
} from "./select.js";
