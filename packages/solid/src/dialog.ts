/**
 * Dialog — re-exported from `@ark-ui/solid` (portal + focus trap + SSR ids).
 *
 * Ark traps focus, restores it on close, locks scroll, wires
 * `aria-labelledby`/`aria-describedby`, and generates ids deterministically so
 * server and client markup agree. Composed as
 * `Root > Trigger + Portal(> Backdrop + Positioner > Content)`. No CVA variants:
 * surfaces come straight from the token slots via `components.css`.
 *
 * `Portal` comes from `solid-js/web` (Solid's own portal), re-exported here so
 * the dialog/select markup reads the same across every framework binding.
 */
export { Dialog } from "@ark-ui/solid";
export { Portal } from "solid-js/web";
export type {
  DialogRootProps,
  DialogTriggerProps,
  DialogBackdropProps,
  DialogPositionerProps,
  DialogContentProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseTriggerProps,
} from "@ark-ui/solid";
