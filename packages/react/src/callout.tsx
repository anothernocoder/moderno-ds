import type { ComponentPropsWithRef } from "react";
import { calloutRecipe, partAttrs, type VariantProps } from "@moderno-ui/core";

export interface CalloutRootProps
  extends ComponentPropsWithRef<"div">, VariantProps<typeof calloutRecipe.variants> {}

/** Props of every non-root Callout part: a plain div, styled by its `data-part`. */
export type CalloutPartProps = ComponentPropsWithRef<"div">;

/**
 * Callout — a soft note inside the page's content: a tip, a caveat, a
 * heads-up the reader should not miss.
 *
 * A CSS-only primitive, like Alert: elements carrying `data-scope`/`data-part`
 * plus the recipe's `data-variant`, with every pixel coming from
 * `components.css`. It differs from Alert in what it means, not only in how it
 * looks: a callout is part of the content, so its root is `role="note"`
 * rather than a live region, and nothing is announced when it renders.
 *
 * `role` is resolved like Alert's — a consumer's `role` wins, but passing
 * `undefined` keeps the default instead of erasing the attribute. `Icon` is a
 * slot, never an icon set, and is decorative by default.
 */
export function CalloutRoot({ variant, role, children, ...rest }: CalloutRootProps) {
  return (
    <div
      {...rest}
      role={role ?? "note"}
      {...partAttrs("callout", "root")}
      {...calloutRecipe({ variant })}
    >
      {children}
    </div>
  );
}

export function CalloutIcon({ children, "aria-hidden": ariaHidden, ...rest }: CalloutPartProps) {
  return (
    <div {...rest} aria-hidden={ariaHidden ?? true} {...partAttrs("callout", "icon")}>
      {children}
    </div>
  );
}

export function CalloutContent({ children, ...rest }: CalloutPartProps) {
  return (
    <div {...rest} {...partAttrs("callout", "content")}>
      {children}
    </div>
  );
}

export function CalloutTitle({ children, ...rest }: CalloutPartProps) {
  return (
    <div {...rest} {...partAttrs("callout", "title")}>
      {children}
    </div>
  );
}

export function CalloutDescription({ children, ...rest }: CalloutPartProps) {
  return (
    <div {...rest} {...partAttrs("callout", "description")}>
      {children}
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
