import type { ComponentPropsWithRef } from "react";
import { alertRecipe, alertRole, partAttrs, type VariantProps } from "@moderno-ui/core";

export interface AlertRootProps
  extends ComponentPropsWithRef<"div">, VariantProps<typeof alertRecipe.variants> {}

/** Props of every non-root Alert part: a plain div, styled by its `data-part`. */
export type AlertPartProps = ComponentPropsWithRef<"div">;

/**
 * Alert — an inline, page-level status message.
 *
 * A CSS-only primitive: Ark has no alert machine because there is no behaviour
 * to own — an alert is a static region. So, like Button, this is the pure form
 * of the contract: elements carrying `data-scope`/`data-part` plus the recipe's
 * `data-variant`/`data-size`, with every pixel coming from `components.css`.
 *
 * The anatomy is Ark-shaped (`root > icon + content(> title + description +
 * action)`) so a consumer overrides any part through `[data-part]` rather than a
 * wrapper class. `Icon` is a slot, never an icon set: primitives stay
 * icon-agnostic, so the consumer passes their own glyph and the part hands it
 * the status hue through `currentColor`.
 *
 * `role` defaults from `alertRole` (shared with every other binding) so the
 * urgent statuses announce assertively. It is resolved like Button's `type`
 * rather than spread over — a consumer's `role` wins, but passing `undefined`
 * keeps the default instead of erasing the attribute.
 */
export function AlertRoot({ variant, size, role, children, ...rest }: AlertRootProps) {
  return (
    <div
      {...rest}
      role={role ?? alertRole(variant)}
      {...partAttrs("alert", "root")}
      {...alertRecipe({ variant, size })}
    >
      {children}
    </div>
  );
}

export function AlertIcon({ children, "aria-hidden": ariaHidden, ...rest }: AlertPartProps) {
  return (
    <div {...rest} aria-hidden={ariaHidden ?? true} {...partAttrs("alert", "icon")}>
      {children}
    </div>
  );
}

export function AlertContent({ children, ...rest }: AlertPartProps) {
  return (
    <div {...rest} {...partAttrs("alert", "content")}>
      {children}
    </div>
  );
}

export function AlertTitle({ children, ...rest }: AlertPartProps) {
  return (
    <div {...rest} {...partAttrs("alert", "title")}>
      {children}
    </div>
  );
}

export function AlertDescription({ children, ...rest }: AlertPartProps) {
  return (
    <div {...rest} {...partAttrs("alert", "description")}>
      {children}
    </div>
  );
}

export function AlertAction({ children, ...rest }: AlertPartProps) {
  return (
    <div {...rest} {...partAttrs("alert", "action")}>
      {children}
    </div>
  );
}

/** The Alert anatomy, namespaced like every other Moderno primitive. */
export const Alert = {
  Root: AlertRoot,
  Icon: AlertIcon,
  Content: AlertContent,
  Title: AlertTitle,
  Description: AlertDescription,
  Action: AlertAction,
};

export type { AlertVariant, AlertSize } from "@moderno-ui/core";
