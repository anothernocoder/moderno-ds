/**
 * @moderno-ui/react — reference React 19 bindings.
 *
 * Ark UI provides headless behaviour; `@moderno-ui/core` recipes map props to
 * `data-*`; `@moderno-ui/css` (the shared `components.css`) paints everything from
 * token slots. Components ship no styling of their own — import the CSS once:
 *
 *   import "@moderno-ui/css";
 */

export { Button } from "./button.js";
export type { ButtonProps } from "./button.js";

export { Alert } from "./alert.js";
export type { AlertRootProps, AlertPartProps, AlertVariant, AlertSize } from "./alert.js";

export { Field } from "./field.js";
export type {
  FieldSize,
  ModernoFieldRootProps,
  FieldRootProps,
  FieldLabelProps,
  FieldInputProps,
  FieldTextareaProps,
  FieldHelperTextProps,
  FieldErrorTextProps,
} from "./field.js";

export { Checkbox } from "./checkbox.js";
export type {
  CheckboxSize,
  ModernoCheckboxRootProps,
  CheckboxCheckedChangeDetails,
  CheckboxCheckedState,
  CheckboxControlProps,
  CheckboxIndicatorProps,
  CheckboxLabelProps,
  CheckboxHiddenInputProps,
} from "./checkbox.js";

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

export { LineChart, AreaChart, BarChart, ScatterChart } from "./charts.js";
export type { LineChartProps, AreaChartProps, BarChartProps, ScatterChartProps } from "./charts.js";

export { Select, createListCollection } from "./select.js";
export type {
  SelectSize,
  ModernoSelectRootProps,
  CollectionItem,
  ListCollection,
  SelectValueChangeDetails,
} from "./select.js";
