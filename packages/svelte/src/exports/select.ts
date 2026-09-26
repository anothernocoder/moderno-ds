import { Select as ArkSelect } from "@ark-ui/svelte";
import SelectRoot from "../SelectRoot.svelte";

/**
 * Select — only `Root` is wrapped (to inject the `size` recipe); every other
 * part is Ark's verbatim. Annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const Select: Omit<typeof ArkSelect, "Root"> & { Root: typeof SelectRoot } = {
  ...ArkSelect,
  Root: SelectRoot,
};
export type { SelectValueChangeDetails } from "@ark-ui/svelte";
