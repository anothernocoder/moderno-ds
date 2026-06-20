/**
 * Dialog — portal + focus trap + SSR-stable ids.
 *
 * Ark's Dialog machine traps focus, restores it on close, locks scroll, wires
 * `aria-labelledby`/`aria-describedby`, and generates ids with React's `useId`
 * so server and client markup agree. When closed (the default) the content is
 * not mounted, so an SSR render emits only the trigger — and hydration is a
 * clean match even though the open content later lands in a `Portal`.
 *
 * `Portal` is re-exported alongside the namespace so a dialog can be composed
 * as `Root > Trigger + Portal(> Backdrop + Positioner > Content)`. No CVA
 * variants: surfaces come straight from the token slots via `components.css`.
 */
export { Dialog, Portal } from "@ark-ui/react";
export type {
  DialogRootProps,
  DialogTriggerProps,
  DialogBackdropProps,
  DialogPositionerProps,
  DialogContentProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseTriggerProps,
} from "@ark-ui/react";
