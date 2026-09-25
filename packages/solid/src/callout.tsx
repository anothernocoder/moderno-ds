import { splitProps, type JSX } from "solid-js";
import { calloutRecipe, partAttrs, type CalloutVariant } from "@moderno-ui/core";

export interface CalloutRootProps extends JSX.HTMLAttributes<HTMLDivElement> {
  variant?: CalloutVariant;
}

/** Props of every non-root Callout part: a plain div, styled by its `data-part`. */
export type CalloutPartProps = JSX.HTMLAttributes<HTMLDivElement>;

/**
 * Callout — a soft note inside the page's content, ported to Solid.
 *
 * Identical contract to `@moderno-ui/react`: a CSS-only primitive whose parts
 * carry `data-scope`/`data-part` plus the shared `calloutRecipe`'s
 * `data-variant`, painted entirely by `components.css`. The root is
 * `role="note"`, resolved (not spread over), so a consumer's `role` wins while
 * `undefined` keeps the default.
 */
export function CalloutRoot(props: CalloutRootProps) {
  const [local, rest] = splitProps(props, ["variant", "role", "children"]);
  return (
    <div
      {...rest}
      role={local.role ?? "note"}
      {...partAttrs("callout", "root")}
      {...calloutRecipe({ variant: local.variant })}
    >
      {local.children}
    </div>
  );
}

export function CalloutIcon(props: CalloutPartProps) {
  const [local, rest] = splitProps(props, ["children", "aria-hidden"]);
  return (
    <div {...rest} aria-hidden={local["aria-hidden"] ?? true} {...partAttrs("callout", "icon")}>
      {local.children}
    </div>
  );
}

export function CalloutContent(props: CalloutPartProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <div {...rest} {...partAttrs("callout", "content")}>
      {local.children}
    </div>
  );
}

export function CalloutTitle(props: CalloutPartProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <div {...rest} {...partAttrs("callout", "title")}>
      {local.children}
    </div>
  );
}

export function CalloutDescription(props: CalloutPartProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <div {...rest} {...partAttrs("callout", "description")}>
      {local.children}
    </div>
  );
}

/** The Callout anatomy, namespaced like every other Moderno primitive. */
export const Callout = {
  Root: CalloutRoot,
  Icon: CalloutIcon,
  Content: CalloutContent,
  Title: CalloutTitle,
  Description: CalloutDescription,
};

export type { CalloutVariant } from "@moderno-ui/core";
