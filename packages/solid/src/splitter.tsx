import { splitProps } from "solid-js";
import { isServer } from "solid-js/web";
import { EnvironmentProvider, Splitter as ArkSplitter, useEnvironmentContext } from "@ark-ui/solid";
import type { SplitterRootProps, UseSplitterProps } from "@ark-ui/solid";
import { serverDocument, splitterRecipe, type SplitterVariant } from "@moderno-ui/core";

export type { SplitterVariant } from "@moderno-ui/core";

export type ModernoSplitterRootProps = SplitterRootProps & {
  /** Visual style of the panels and triggers — resolves to `data-variant` on the root part. */
  variant?: SplitterVariant;
};

/*
 * Ark-Solid does not re-export the splitter machine's detail types under
 * their `Splitter…` names, as the other bindings do; they are read off the
 * Root's own props so the four packages export the same names.
 */
/** One entry of `panels`: a panel's id and limits. */
export type SplitterPanelData = UseSplitterProps["panels"][number];
/** What `onResize` reports: every panel's size, in percent. */
export type SplitterResizeDetails = Parameters<NonNullable<UseSplitterProps["onResize"]>>[0];
/** What `onResizeEnd` reports once the user lets go. */
export type SplitterResizeEndDetails = Parameters<NonNullable<UseSplitterProps["onResizeEnd"]>>[0];
/** What `onCollapse` / `onExpand` report: the panel and its new size. */
export type SplitterExpandCollapseDetails = Parameters<
  NonNullable<UseSplitterProps["onCollapse"]>
>[0];

/**
 * Splitter.Root with the Moderno `variant` recipe folded in. Ark's Root
 * spreads unknown props onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` styles the parts from it.
 *
 * The machine's environment is the consumer's own in the browser and core's
 * `serverDocument` on the server: Solid disposes a server render on a timer,
 * zag then runs the machine's exit action, and that reaches for the
 * document, which would throw there. Given a value, the provider renders no
 * markup, so the server string and the hydrated tree match.
 */
function SplitterRoot(props: ModernoSplitterRootProps) {
  const [local, rest] = splitProps(props, ["variant"]);
  const environment = useEnvironmentContext();
  const rootNode = () =>
    isServer ? (serverDocument as unknown as Document) : environment().getRootNode();
  return (
    <EnvironmentProvider value={rootNode}>
      <ArkSplitter.Root {...rest} {...splitterRecipe({ variant: local.variant })} />
    </EnvironmentProvider>
  );
}

/**
 * Splitter — panels side by side (or stacked) that the user resizes by
 * dragging the boundary between them, or with the keyboard. Ark drives all
 * of it: `panels` names each panel and its limits, each size is a
 * percentage, and each `ResizeTrigger` between two panels is a
 * `role="separator"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
 * and `aria-controls`; arrow keys move it, Home and End push it to a limit,
 * and Enter collapses or expands a collapsible panel. `Root` is wrapped to
 * inject the recipe; every other part is Ark's verbatim. The object is
 * annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
 * type (TS2742).
 */
export const Splitter: Omit<typeof ArkSplitter, "Root"> & { Root: typeof SplitterRoot } = {
  ...ArkSplitter,
  Root: SplitterRoot,
};

export type {
  SplitterRootProps,
  SplitterPanelProps,
  SplitterResizeTriggerProps,
  SplitterResizeTriggerIndicatorProps,
} from "@ark-ui/solid";
