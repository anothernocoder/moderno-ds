/**
 * Forms send their values. Every control of a widget keeps its value in
 * OpenUI's form state, under its label, in one form per widget. A Button with
 * no action triggers that form, and `withFormValues` adds its values to the
 * message the host posts (`Jugar — Número: 4827; Lotería: Lotería de Bogotá`).
 * A Button with its own action sends its message as written.
 */
import {
  useFormName,
  useGetFieldValue,
  useSetDefaultValue,
  useSetFieldValue,
  type ActionEvent,
} from "@openuidev/react-lang";

/** The form a widget's controls write to, unless an OpenUI form wraps them. */
export const WIDGET_FORM = "form";

/** The form of the controls around this component. */
export function useWidgetForm(): string {
  return useFormName() ?? WIDGET_FORM;
}

/**
 * Keeps the control named `label` in the widget's form, starting at
 * `defaultValue`. Returns the setter its change handler calls.
 */
export function useFormValue(label: unknown, defaultValue?: unknown): (value: unknown) => void {
  const formName = useWidgetForm();
  const name = String(label);
  const setFieldValue = useSetFieldValue();
  const existingValue = useGetFieldValue()(formName, name);
  useSetDefaultValue({ formName, componentType: undefined, name, existingValue, defaultValue });
  return (value) => setFieldValue(formName, undefined, name, value, false);
}

function format(value: unknown): string {
  return Array.isArray(value) ? value.map(String).join(", ") : String(value ?? "");
}

/** The event with the values of the form it triggered added to its message. */
export function withFormValues(event: ActionEvent): ActionEvent {
  const form = event.formName ? event.formState?.[event.formName] : undefined;
  if (!form || typeof form !== "object") return event;
  const values = Object.entries(form).flatMap(([name, field]) => {
    const value = format((field as { value?: unknown } | null)?.value);
    return value ? [`${name}: ${value}`] : [];
  });
  if (!values.length) return event;
  return { ...event, humanFriendlyMessage: `${event.humanFriendlyMessage} — ${values.join("; ")}` };
}
