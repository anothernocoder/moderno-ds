import type { Component } from "svelte";
import type { AlertPartProps, AlertRootProps } from "../alert-props.js";
import AlertRoot from "../AlertRoot.svelte";
import AlertIcon from "../AlertIcon.svelte";
import AlertContent from "../AlertContent.svelte";
import AlertTitle from "../AlertTitle.svelte";
import AlertDescription from "../AlertDescription.svelte";
import AlertAction from "../AlertAction.svelte";

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

export type { AlertRootProps, AlertPartProps } from "../alert-props.js";
export type { AlertVariant, AlertSize } from "@moderno-ui/core";
