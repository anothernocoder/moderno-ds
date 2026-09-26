import { Checkbox as ArkCheckbox } from "@ark-ui/svelte";
import CheckboxRoot from "../CheckboxRoot.svelte";

/**
 * Checkbox — tri-state (unchecked / checked / indeterminate) with a label. Ark
 * binds the root `<label>` to a visually hidden native input and stamps
 * `data-state` / `data-disabled` / `data-invalid` on every part; only `Root` is
 * wrapped, to inject the `size` recipe. Annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const Checkbox: Omit<typeof ArkCheckbox, "Root"> & { Root: typeof CheckboxRoot } = {
  ...ArkCheckbox,
  Root: CheckboxRoot,
};
export type { CheckboxCheckedChangeDetails, CheckboxCheckedState } from "@ark-ui/svelte";
