import { defineComponent, h, type PropType } from "vue";
import {
  alertRecipe,
  alertRole,
  partAttrs,
  type AlertSize,
  type AlertVariant,
} from "@moderno-ui/core";

/**
 * Alert — an inline, page-level status message, ported to Vue.
 *
 * Identical contract to `@moderno-ui/react`: a CSS-only primitive whose parts
 * carry `data-scope`/`data-part` plus the shared `alertRecipe`'s
 * `data-variant`/`data-size`; `components.css` paints all of it from token
 * slots, so one brand re-themes Vue and React alike.
 *
 * `inheritAttrs: false` so consumer attributes spread explicitly *before* the
 * scope/part/variant attrs — the contract attrs land last and can't be
 * clobbered. `role` is resolved from the consumer's attr falling back to
 * `alertRole`, mirroring how the React binding resolves it.
 */
const AlertRoot = defineComponent({
  name: "ModernoAlertRoot",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<AlertVariant>, default: undefined },
    size: { type: String as PropType<AlertSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          role: (attrs.role as string | undefined) ?? alertRole(props.variant),
          ...partAttrs("alert", "root"),
          ...alertRecipe({ variant: props.variant, size: props.size }),
        },
        slots.default?.(),
      );
  },
});

/** A non-root Alert part: a plain div carrying its `data-part`. */
function part(name: string, defaults: Record<string, string> = {}) {
  return defineComponent({
    name: `ModernoAlert${name.charAt(0).toUpperCase()}${name.slice(1)}`,
    inheritAttrs: false,
    setup(_props, { slots, attrs }) {
      return () =>
        h("div", { ...defaults, ...attrs, ...partAttrs("alert", name) }, slots.default?.());
    },
  });
}

/** The Alert anatomy, namespaced like every other Moderno primitive. */
export const Alert = {
  Root: AlertRoot,
  Icon: part("icon", { "aria-hidden": "true" }),
  Content: part("content"),
  Title: part("title"),
  Description: part("description"),
  Action: part("action"),
};

export type { AlertVariant, AlertSize } from "@moderno-ui/core";
