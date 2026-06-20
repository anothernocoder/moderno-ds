import { defineComponent, h, Teleport, type Component, type PropType } from "vue";

/**
 * Dialog — re-exported from `@ark-ui/vue` (portal + focus trap + SSR-stable ids).
 *
 * Ark traps focus, restores it on close, locks scroll, wires
 * `aria-labelledby`/`aria-describedby`, and generates ids via Vue's `useId` so
 * server and client markup agree. Composed as
 * `Root > Trigger + Portal(> Backdrop + Positioner > Content)`. No CVA variants:
 * surfaces come straight from the token slots via `components.css`.
 */
export { Dialog } from "@ark-ui/vue";

/**
 * Portal — Vue has no Ark `Portal`; this wraps the native `<Teleport>` so the
 * dialog/select markup reads the same across every framework binding (API
 * parity, F3.1). Defaults to `body`, matching React's Portal.
 */
export const Portal = defineComponent({
  name: "ModernoPortal",
  props: {
    to: { type: [String, Object] as PropType<string | HTMLElement>, default: "body" },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    // `h(Teleport, …)` trips the generic-component overload (its `__isTeleport`
    // brand); cast to a plain Component — the runtime value is unchanged.
    const Portal = Teleport as unknown as Component;
    return () => h(Portal, { to: props.to, disabled: props.disabled }, slots.default?.());
  },
});

export type {
  DialogRootProps,
  DialogTriggerProps,
  DialogBackdropProps,
  DialogPositionerProps,
  DialogContentProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseTriggerProps,
} from "@ark-ui/vue";
