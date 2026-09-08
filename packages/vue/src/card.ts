import { defineComponent, h, type PropType } from "vue";
import { cardRecipe, partAttrs, type CardSize, type CardVariant } from "@moderno-ui/core";

/**
 * Card — a CSS-only surface with an Ark-style anatomy, ported to Vue.
 *
 * Identical contract to `@moderno-ui/react`: no Ark machine (a card tracks no
 * state), so every part is authored here and emits `data-scope="card"` plus its
 * own `data-part`; the root additionally carries `cardRecipe`'s
 * `data-variant`/`data-size`. Zero styling lives here — `components.css` paints
 * it from token slots, so one theme re-skins Vue and React alike.
 *
 * `inheritAttrs: false` so consumer attributes (class, onClick, aria-*) spread
 * explicitly *before* the scope/part/variant attrs — the contract attrs land
 * last and can't be clobbered, mirroring the React binding's prop order.
 */
const CardRoot = defineComponent({
  name: "ModernoCardRoot",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<CardVariant>, default: undefined },
    size: { type: String as PropType<CardSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          ...partAttrs("card", "root"),
          ...cardRecipe({ variant: props.variant, size: props.size }),
        },
        slots.default?.(),
      );
  },
});

/** One part component: a plain element carrying `data-scope`/`data-part`. */
function cardPart(name: string, part: string, tag: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_props, { slots, attrs }) {
      return () => h(tag, { ...attrs, ...partAttrs("card", part) }, slots.default?.());
    },
  });
}

const CardHeader = cardPart("ModernoCardHeader", "header", "div");
/**
 * An `h3` by default because a card is a section of a page, not its heading.
 * Pass `role`/`aria-level` when the document outline needs a different rank.
 */
const CardTitle = cardPart("ModernoCardTitle", "title", "h3");
const CardDescription = cardPart("ModernoCardDescription", "description", "p");
const CardContent = cardPart("ModernoCardContent", "content", "div");
const CardFooter = cardPart("ModernoCardFooter", "footer", "div");

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
};

export type { CardVariant, CardSize } from "@moderno-ui/core";
