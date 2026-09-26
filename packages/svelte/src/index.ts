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
import {
  Avatar as ArkAvatar,
  Checkbox as ArkCheckbox,
  Field as ArkField,
  PinInput as ArkPinInput,
  RadioGroup as ArkRadioGroup,
  Select as ArkSelect,
  Switch as ArkSwitch,
  Toggle as ArkToggle,
  ToggleGroup as ArkToggleGroup,
} from "@ark-ui/svelte";
import AvatarRoot from "./AvatarRoot.svelte";
import CheckboxRoot from "./CheckboxRoot.svelte";
import FieldRoot from "./FieldRoot.svelte";
import PinInputRoot from "./PinInputRoot.svelte";
import SelectRoot from "./SelectRoot.svelte";
import SwitchRoot from "./SwitchRoot.svelte";
import SwitchHiddenInput from "./SwitchHiddenInput.svelte";
import RadioGroupRoot from "./RadioGroupRoot.svelte";
import RadioGroupItemDescription from "./RadioGroupItemDescription.svelte";
import ToggleRoot from "./ToggleRoot.svelte";
import ToggleGroupRoot from "./ToggleGroupRoot.svelte";
import type { AlertPartProps, AlertRootProps } from "./alert-props.js";
import AlertRoot from "./AlertRoot.svelte";
import AlertIcon from "./AlertIcon.svelte";
import AlertContent from "./AlertContent.svelte";
import AlertTitle from "./AlertTitle.svelte";
import AlertDescription from "./AlertDescription.svelte";
import AlertAction from "./AlertAction.svelte";
import type { CalloutPartProps, CalloutRootProps } from "./callout-props.js";
import CalloutRoot from "./CalloutRoot.svelte";
import CalloutIcon from "./CalloutIcon.svelte";
import CalloutContent from "./CalloutContent.svelte";
import CalloutTitle from "./CalloutTitle.svelte";
import CalloutDescription from "./CalloutDescription.svelte";
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
 * Callout — a CSS-only soft note (no Ark machine), with the same
 * `Root > Icon + Content(Title + Description)` anatomy in every framework.
 * Annotated with the shared prop types from `callout-props.ts`, like `Alert`.
 */
export const Callout: {
  Root: Component<CalloutRootProps>;
  Icon: Component<CalloutPartProps>;
  Content: Component<CalloutPartProps>;
  Title: Component<CalloutPartProps>;
  Description: Component<CalloutPartProps>;
} = {
  Root: CalloutRoot,
  Icon: CalloutIcon,
  Content: CalloutContent,
  Title: CalloutTitle,
  Description: CalloutDescription,
};

export type { CalloutRootProps, CalloutPartProps } from "./callout-props.js";
export type { CalloutVariant } from "@moderno-ui/core";

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
 * Divider — a CSS-only rule (no Ark machine). Same `dividerRecipe` and
 * `components.css` stroke as every other binding.
 */
export { default as Divider } from "./Divider.svelte";

/**
 * Badge, Chip and Indicator — CSS-only (no Ark machine). Same recipes and
 * `components.css` rules as every other binding: a status label, a removable
 * token (it reports the press through `onRemove`) and a status dot.
 */
export { default as Badge } from "./Badge.svelte";
export { default as Chip } from "./Chip.svelte";
export { default as Indicator } from "./Indicator.svelte";
export type {
  BadgeVariant,
  BadgeSize,
  ChipVariant,
  ChipSize,
  IndicatorVariant,
  IndicatorSize,
} from "@moderno-ui/core";

/**
 * Skeleton and Spinner — CSS-only loading states (no Ark machine). Same
 * recipes and `components.css` rules as every other binding: a muted
 * placeholder in a content shape, and a ring with a screen-reader label.
 */
export { default as Skeleton } from "./Skeleton.svelte";
export { default as Spinner } from "./Spinner.svelte";
export type { SkeletonShape, SpinnerSize } from "@moderno-ui/core";

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

/**
 * PinInput — the one-time-code control for a verify screen. Ark drives focus
 * movement, paste distribution, masking and the invalid/complete flags; only
 * `Root` is wrapped (to inject the `size` recipe), every other part is Ark's
 * verbatim. Annotated so the emitted `.d.ts` doesn't inline an un-nameable
 * `@zag-js` type (TS2742).
 */
export const PinInput: Omit<typeof ArkPinInput, "Root"> & { Root: typeof PinInputRoot } = {
  ...ArkPinInput,
  Root: PinInputRoot,
};

/**
 * Avatar — a picture of a person or a team, with initials when there is none.
 * Ark shows `Fallback` while the image loads or when it fails, `Image` once it
 * has loaded; only `Root` is wrapped (to inject the `size` × `shape` recipe),
 * every other part is Ark's verbatim. Annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const Avatar: Omit<typeof ArkAvatar, "Root"> & { Root: typeof AvatarRoot } = {
  ...ArkAvatar,
  Root: AvatarRoot,
};
export type { AvatarSize, AvatarShape } from "@moderno-ui/core";

/**
 * Switch — an on/off control with a label, for a setting that applies at once.
 * Ark binds the root `<label>` to a visually hidden native input and stamps
 * `data-state` / `data-disabled` / `data-invalid` on every part. `Root` is
 * wrapped to inject the `size` recipe and `HiddenInput` to add its switch
 * role; every other part is Ark's verbatim. Annotated so the emitted `.d.ts`
 * doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const Switch: Omit<typeof ArkSwitch, "Root" | "HiddenInput"> & {
  Root: typeof SwitchRoot;
  HiddenInput: typeof SwitchHiddenInput;
} = {
  ...ArkSwitch,
  Root: SwitchRoot,
  HiddenInput: SwitchHiddenInput,
};
export type { SwitchSize } from "@moderno-ui/core";

/**
 * RadioGroup — pick exactly one option from a short list. Ark binds the root
 * `role="radiogroup"` to its `Label` and each `Item` `<label>` to a visually
 * hidden native radio, and stamps `data-state` / `data-disabled` /
 * `data-invalid` on every item part and `data-orientation` on the root.
 * `Root` is wrapped to inject the `size` recipe and `ItemDescription` is
 * Moderno's; every other part is Ark's verbatim. Annotated so the emitted
 * `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const RadioGroup: Omit<typeof ArkRadioGroup, "Root"> & {
  Root: typeof RadioGroupRoot;
  ItemDescription: typeof RadioGroupItemDescription;
} = {
  ...ArkRadioGroup,
  Root: RadioGroupRoot,
  ItemDescription: RadioGroupItemDescription,
};
export type { RadioGroupSize } from "@moderno-ui/core";
export type { RadioGroupItemDescriptionProps } from "./radio-group-props.js";

/**
 * Toggle — a button that stays pressed until it is pressed again. Ark renders
 * a native `<button>` with `aria-pressed` and `data-state="on|off"`; the
 * optional `Indicator` shows its children while on and its `fallback` snippet
 * while off. `Root` is wrapped to inject the `variant` × `size` recipe; every
 * other part is Ark's verbatim. Annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const Toggle: Omit<typeof ArkToggle, "Root"> & { Root: typeof ToggleRoot } = {
  ...ArkToggle,
  Root: ToggleRoot,
};
export type { ToggleVariant, ToggleSize } from "@moderno-ui/core";

/**
 * ToggleGroup — a row of toggle buttons; one or several stay pressed. Single
 * selection makes the root a `role="radiogroup"` of `role="radio"` buttons,
 * `multiple` a `role="group"` of `aria-pressed` buttons; items carry
 * `data-state="on|off"`, `data-disabled` and `data-orientation`. `Root` is
 * wrapped to inject the `variant` × `size` recipe; every other part is Ark's
 * verbatim. Annotated so the emitted `.d.ts` doesn't inline an un-nameable
 * `@zag-js` type (TS2742).
 */
export const ToggleGroup: Omit<typeof ArkToggleGroup, "Root"> & {
  Root: typeof ToggleGroupRoot;
} = {
  ...ArkToggleGroup,
  Root: ToggleGroupRoot,
};
export type { ToggleGroupVariant, ToggleGroupSize } from "@moderno-ui/core";

export { createListCollection } from "@ark-ui/svelte";

export type {
  CheckboxCheckedChangeDetails,
  CheckboxCheckedState,
  SelectValueChangeDetails,
  PinInputValueChangeDetails,
  PinInputValueInvalidDetails,
  AvatarStatusChangeDetails,
  SwitchCheckedChangeDetails,
  RadioGroupValueChangeDetails,
  ToggleGroupValueChangeDetails,
} from "@ark-ui/svelte";
