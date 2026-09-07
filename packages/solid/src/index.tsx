/**
 * @moderno-ui/solid — Solid bindings.
 *
 * Ark UI provides headless behaviour; `@moderno-ui/core` recipes map props to
 * `data-*`; `@moderno-ui/css` (the shared `components.css`) paints everything from
 * token slots. Components ship no styling of their own — import the CSS once:
 *
 *   import "@moderno-ui/css";
 */

export { Button } from "./button.jsx";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./button.jsx";

export { Card } from "./card.jsx";
export type {
  CardRootProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
  CardVariant,
  CardSize,
} from "./card.jsx";

export { Alert } from "./alert.jsx";
export type { AlertRootProps, AlertPartProps, AlertVariant, AlertSize } from "./alert.jsx";

export { Field } from "./field.jsx";
export type {
  FieldSize,
  ModernoFieldRootProps,
  FieldRootProps,
  FieldLabelProps,
  FieldInputProps,
  FieldTextareaProps,
  FieldHelperTextProps,
  FieldErrorTextProps,
} from "./field.jsx";

export { Checkbox } from "./checkbox.jsx";
export type {
  CheckboxSize,
  ModernoCheckboxRootProps,
  CheckboxRootProps,
  CheckboxControlProps,
  CheckboxIndicatorProps,
  CheckboxLabelProps,
  CheckboxHiddenInputProps,
  CheckboxCheckedChangeDetails,
  CheckboxCheckedState,
} from "./checkbox.jsx";

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

export { Select, createListCollection } from "./select.jsx";
export type {
  SelectSize,
  ModernoSelectRootProps,
  CollectionItem,
  ListCollection,
  SelectValueChangeDetails,
} from "./select.jsx";

export { LineChart, AreaChart, BarChart, ScatterChart } from "./charts.jsx";
export type {
  LineChartProps,
  AreaChartProps,
  BarChartProps,
  ScatterChartProps,
} from "./charts.jsx";
