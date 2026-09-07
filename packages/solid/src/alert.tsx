import { splitProps, type JSX } from "solid-js";
import {
  alertRecipe,
  alertRole,
  partAttrs,
  type AlertSize,
  type AlertVariant,
} from "@moderno-ui/core";

export interface AlertRootProps extends JSX.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  size?: AlertSize;
}

/** Props of every non-root Alert part: a plain div, styled by its `data-part`. */
export type AlertPartProps = JSX.HTMLAttributes<HTMLDivElement>;

/**
 * Alert — an inline, page-level status message, ported to Solid.
 *
 * Identical contract to `@moderno-ui/react`: a CSS-only primitive whose parts
 * carry `data-scope`/`data-part` plus the shared `alertRecipe`'s
 * `data-variant`/`data-size`, painted entirely by `components.css`. `role`
 * defaults from the shared `alertRole` and is resolved (not spread over), so a
 * consumer's `role` wins while `undefined` keeps the default.
 */
export function AlertRoot(props: AlertRootProps) {
  const [local, rest] = splitProps(props, ["variant", "size", "role", "children"]);
  return (
    <div
      {...rest}
      role={local.role ?? alertRole(local.variant)}
      {...partAttrs("alert", "root")}
      {...alertRecipe({ variant: local.variant, size: local.size })}
    >
      {local.children}
    </div>
  );
}

export function AlertIcon(props: AlertPartProps) {
  const [local, rest] = splitProps(props, ["children", "aria-hidden"]);
  return (
    <div {...rest} aria-hidden={local["aria-hidden"] ?? true} {...partAttrs("alert", "icon")}>
      {local.children}
    </div>
  );
}

export function AlertContent(props: AlertPartProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <div {...rest} {...partAttrs("alert", "content")}>
      {local.children}
    </div>
  );
}

export function AlertTitle(props: AlertPartProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <div {...rest} {...partAttrs("alert", "title")}>
      {local.children}
    </div>
  );
}

export function AlertDescription(props: AlertPartProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <div {...rest} {...partAttrs("alert", "description")}>
      {local.children}
    </div>
  );
}

export function AlertAction(props: AlertPartProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <div {...rest} {...partAttrs("alert", "action")}>
      {local.children}
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
