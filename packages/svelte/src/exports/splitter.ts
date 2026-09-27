import { Splitter as ArkSplitter } from "@ark-ui/svelte";
import SplitterRoot from "../SplitterRoot.svelte";

/**
 * Splitter — panels side by side (or stacked) that the user resizes by
 * dragging the boundary between them, or with the keyboard. Ark renders each
 * `ResizeTrigger` between two panels as a `role="separator"` with
 * `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-controls`;
 * `panels` names each panel and its limits, and each size is a percentage.
 * `Root` is wrapped to inject the `variant` recipe; every other part is
 * Ark's verbatim. Annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const Splitter: Omit<typeof ArkSplitter, "Root"> & { Root: typeof SplitterRoot } = {
  ...ArkSplitter,
  Root: SplitterRoot,
};
export type { SplitterVariant } from "@moderno-ui/core";
export type {
  SplitterPanelData,
  SplitterResizeDetails,
  SplitterResizeEndDetails,
  SplitterExpandCollapseDetails,
} from "@ark-ui/svelte";
