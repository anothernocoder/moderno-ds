import { createProps } from "@zag-js/types";
import type { VectorPadProps } from "./vector-pad.types.js";

/** Every prop the machine reads; `createProps` fails to compile when one is missing. */
export const props = createProps<VectorPadProps>()([
  "aria-label",
  "aria-labelledby",
  "defaultValue",
  "dir",
  "disabled",
  "getAriaValueText",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "invertY",
  "max",
  "min",
  "onValueChange",
  "onValueChangeEnd",
  "readOnly",
  "step",
  "value",
]);

const MACHINE_PROPS = new Set<PropertyKey>(props);

/**
 * Splits a binding's props into the machine's and the rest, which the
 * binding spreads on the root element.
 */
export function splitProps<T extends Partial<VectorPadProps>>(
  all: T,
): [Partial<VectorPadProps>, Omit<T, keyof VectorPadProps>] {
  const machineProps: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(all)) {
    (MACHINE_PROPS.has(key) ? machineProps : rest)[key] = value;
  }
  return [machineProps as Partial<VectorPadProps>, rest as Omit<T, keyof VectorPadProps>];
}
