/**
 * @moderno-ui/svelte — Svelte 5 bindings (and the docs island runtime).
 *
 * Ark UI provides headless behaviour; `@moderno-ui/core` recipes map props to
 * `data-*`; `@moderno-ui/css` (the shared `components.css`) paints everything from
 * token slots. Components ship no styling of their own — import the CSS once:
 *
 *   import "@moderno-ui/css";
 */
import type { Component } from "svelte";
import { Checkbox as ArkCheckbox, Field as ArkField, Select as ArkSelect } from "@ark-ui/svelte";
import CheckboxRoot from "./CheckboxRoot.svelte";
import FieldRoot from "./FieldRoot.svelte";
import SelectRoot from "./SelectRoot.svelte";
import type { AlertPartProps, AlertRootProps } from "./alert-props.js";
import AlertRoot from "./AlertRoot.svelte";
import AlertIcon from "./AlertIcon.svelte";
import AlertContent from "./AlertContent.svelte";
import AlertTitle from "./AlertTitle.svelte";
import AlertDescription from "./AlertDescription.svelte";
import AlertAction from "./AlertAction.svelte";
import CardRoot from "./CardRoot.svelte";
import CardHeader from "./CardHeader.svelte";
import CardTitle from "./CardTitle.svelte";
import CardDescription from "./CardDescription.svelte";
import CardContent from "./CardContent.svelte";
import CardFooter from "./CardFooter.svelte";

export { default as Button } from "./Button.svelte";

/**
 * Alert — a CSS-only primitive (no Ark machine: an alert is a static region).
 * The anatomy is namespaced like every other Moderno primitive, so the same
 * `Alert.Root > Alert.Icon + Alert.Content(…)` composition reads identically in
 * React, Vue, Svelte and Solid.
 *
 * Annotated with the shared prop types from `alert-props.ts`: an unannotated
 * object would infer each component's own un-exported `Props` interface, and
 * `svelte-package` would drop the declaration rather than emit a type it can't
 * name — the same hazard the `Select` export is annotated against.
 */
export const Alert: {
  Root: Component<AlertRootProps>;
  Icon: Component<AlertPartProps>;
  Content: Component<AlertPartProps>;
  Title: Component<AlertPartProps>;
  Description: Component<AlertPartProps>;
  Action: Component<AlertPartProps>;
} = {
  Root: AlertRoot,
  Icon: AlertIcon,
  Content: AlertContent,
  Title: AlertTitle,
  Description: AlertDescription,
  Action: AlertAction,
};

export type { AlertRootProps, AlertPartProps } from "./alert-props.js";
export type { AlertVariant, AlertSize } from "@moderno-ui/core";

/**
 * Card — a CSS-only surface with an Ark-style anatomy. No Ark machine exists
 * for a card (nothing to track), so every part is authored here; each emits
 * `data-scope="card"` plus its own `data-part`, and the root carries
 * `cardRecipe`'s `data-variant`/`data-size`. Exposed as a namespace so the
 * usage reads the same as in React/Vue/Solid: `<Card.Root>`, `<Card.Title>`, …
 */
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
};

export type {
  CardRootProps,
  CardDivPartProps,
  CardTitleProps,
  CardDescriptionProps,
} from "./card-props.js";
export type { CardVariant, CardSize } from "@moderno-ui/core";

/**
 * Charts (Phase 4) — pure SVG maps over `@moderno-ui/charts-core` models. Each
 * renders the identical scaffold across frameworks; they carry zero colour and
 * paint from `--chart-*` via the data-series index in components.css.
 */
export { default as LineChart } from "./LineChart.svelte";
export { default as AreaChart } from "./AreaChart.svelte";
export { default as BarChart } from "./BarChart.svelte";
export { default as ScatterChart } from "./ScatterChart.svelte";

/**
 * Field — only `Root` is wrapped (to inject the `size` recipe); every other
 * part is Ark's verbatim. Ark wires `label[for]` ↔ control `id` and emits
 * `data-invalid`/`data-disabled`/`data-required`, which the shared
 * `components.css` styles directly. Annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const Field: Omit<typeof ArkField, "Root"> & { Root: typeof FieldRoot } = {
  ...ArkField,
  Root: FieldRoot,
};

/**
 * Dialog + Portal — re-exported from `@ark-ui/svelte` (portal + focus trap +
 * SSR-stable ids). Composed as
 * `Root > Trigger + Portal(> Backdrop + Positioner > Content)`.
 */
export { Dialog, Portal } from "@ark-ui/svelte";

/**
 * Checkbox — tri-state (unchecked / checked / indeterminate) with a label. Ark
 * binds the root `<label>` to a visually hidden native input and stamps
 * `data-state` / `data-disabled` / `data-invalid` on every part; only `Root` is
 * wrapped, to inject the `size` recipe. Annotated so the emitted `.d.ts`
 * doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const Checkbox: Omit<typeof ArkCheckbox, "Root"> & { Root: typeof CheckboxRoot } = {
  ...ArkCheckbox,
  Root: CheckboxRoot,
};

/**
 * Select — only `Root` is wrapped (to inject the `size` recipe); every other
 * part is Ark's verbatim. Annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const Select: Omit<typeof ArkSelect, "Root"> & { Root: typeof SelectRoot } = {
  ...ArkSelect,
  Root: SelectRoot,
};

export { createListCollection } from "@ark-ui/svelte";

export type {
  CheckboxCheckedChangeDetails,
  CheckboxCheckedState,
  SelectValueChangeDetails,
} from "@ark-ui/svelte";
