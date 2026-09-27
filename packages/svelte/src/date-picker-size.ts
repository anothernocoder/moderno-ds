/**
 * The size a DatePicker.Root picked, read by its Content: the calendar
 * usually renders in a Portal, outside the root element that carries the
 * recipe's attribute, so the Root also sets it in context and the Content
 * spreads it. A getter, so a changed `size` prop follows.
 */
import { getContext, setContext } from "svelte";
import type { DatePickerSize } from "@moderno-ui/core";

const DATE_PICKER_SIZE = Symbol("ModernoDatePickerSize");

type SizeGetter = () => DatePickerSize | undefined;

export function setDatePickerSize(size: SizeGetter): void {
  setContext(DATE_PICKER_SIZE, size);
}

/** The enclosing Root's size, or none (the recipe's default) outside one. */
export function getDatePickerSize(): SizeGetter {
  return getContext<SizeGetter | undefined>(DATE_PICKER_SIZE) ?? (() => undefined);
}
