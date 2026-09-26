import CardRoot from "../CardRoot.svelte";
import CardHeader from "../CardHeader.svelte";
import CardTitle from "../CardTitle.svelte";
import CardDescription from "../CardDescription.svelte";
import CardContent from "../CardContent.svelte";
import CardFooter from "../CardFooter.svelte";

/**
 * Card — a CSS-only surface with an Ark-style anatomy. No Ark machine exists
 * for a card (nothing to track), so every part is authored here; each emits
 * `data-scope="card"` plus its own `data-part`, and the root carries
 * `cardRecipe`'s `data-variant`/`data-size`. Exposed as a namespace so the
 * usage reads the same as in React/Vue/Solid: `<Card.Root>`, `<Card.Title>`, …
 */
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
};

export type {
  CardRootProps,
  CardDivPartProps,
  CardTitleProps,
  CardDescriptionProps,
} from "../card-props.js";
export type { CardVariant, CardSize } from "@moderno-ui/core";
