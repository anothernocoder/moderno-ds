import type { Component } from "svelte";
import type { CalloutPartProps, CalloutRootProps } from "../callout-props.js";
import CalloutRoot from "../CalloutRoot.svelte";
import CalloutIcon from "../CalloutIcon.svelte";
import CalloutContent from "../CalloutContent.svelte";
import CalloutTitle from "../CalloutTitle.svelte";
import CalloutDescription from "../CalloutDescription.svelte";

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

export type { CalloutRootProps, CalloutPartProps } from "../callout-props.js";
export type { CalloutVariant } from "@moderno-ui/core";
