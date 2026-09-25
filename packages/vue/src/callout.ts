import { defineComponent, h, type PropType } from "vue";
import { calloutRecipe, partAttrs, type CalloutVariant } from "@moderno-ui/core";

/**
 * Callout — a soft note inside the page's content, ported to Vue.
 *
 * Identical contract to `@moderno-ui/react`: a CSS-only primitive whose parts
 * carry `data-scope`/`data-part` plus the shared `calloutRecipe`'s
 * `data-variant`; `components.css` paints all of it from token slots.
 *
 * `inheritAttrs: false` so consumer attributes spread explicitly *before* the
 * scope/part/variant attrs — the contract attrs land last and can't be
 * clobbered. `role` is the consumer's attr falling back to `note`, mirroring
 * how the React binding resolves it.
 */
const CalloutRoot = defineComponent({
  name: "ModernoCalloutRoot",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<CalloutVariant>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          role: (attrs.role as string | undefined) ?? "note",
          ...partAttrs("callout", "root"),
          ...calloutRecipe({ variant: props.variant }),
        },
        slots.default?.(),
      );
  },
});

/** A non-root Callout part: a plain div carrying its `data-part`. */
function part(name: string, defaults: Record<string, string> = {}) {
  return defineComponent({
    name: `ModernoCallout${name.charAt(0).toUpperCase()}${name.slice(1)}`,
    inheritAttrs: false,
    setup(_props, { slots, attrs }) {
      return () =>
        h("div", { ...defaults, ...attrs, ...partAttrs("callout", name) }, slots.default?.());
    },
  });
}

/** The Callout anatomy, namespaced like every other Moderno primitive. */
export const Callout = {
  Root: CalloutRoot,
  Icon: part("icon", { "aria-hidden": "true" }),
  Content: part("content"),
  Title: part("title"),
  Description: part("description"),
};

export type { CalloutVariant } from "@moderno-ui/core";
