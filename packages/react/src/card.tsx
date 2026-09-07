import type { ComponentPropsWithRef } from "react";
import { cardRecipe, partAttrs, type VariantProps } from "@moderno-ui/core";

export interface CardRootProps
  extends ComponentPropsWithRef<"div">, VariantProps<typeof cardRecipe.variants> {}

export type CardHeaderProps = ComponentPropsWithRef<"div">;
export type CardTitleProps = ComponentPropsWithRef<"h3">;
export type CardDescriptionProps = ComponentPropsWithRef<"p">;
export type CardContentProps = ComponentPropsWithRef<"div">;
export type CardFooterProps = ComponentPropsWithRef<"div">;

/**
 * Card.Root — the surface. `data-variant`/`data-size` from `cardRecipe` key
 * every rule in `components.css`; the element itself holds no colour, border,
 * radius or padding, so a theme re-skins it untouched.
 */
function CardRoot({ variant, size, children, ...rest }: CardRootProps) {
  return (
    <div {...rest} {...partAttrs("card", "root")} {...cardRecipe({ variant, size })}>
      {children}
    </div>
  );
}

/** Card.Header — the title/description block. */
function CardHeader({ children, ...rest }: CardHeaderProps) {
  return (
    <div {...rest} {...partAttrs("card", "header")}>
      {children}
    </div>
  );
}

/**
 * Card.Title — an `h3` by default because a card is a section of a page, not
 * its heading. Pass `role`/`aria-level`, or render your own element, when the
 * document outline needs a different rank.
 */
function CardTitle({ children, ...rest }: CardTitleProps) {
  return (
    <h3 {...rest} {...partAttrs("card", "title")}>
      {children}
    </h3>
  );
}

/** Card.Description — the muted supporting line under the title. */
function CardDescription({ children, ...rest }: CardDescriptionProps) {
  return (
    <p {...rest} {...partAttrs("card", "description")}>
      {children}
    </p>
  );
}

/** Card.Content — the body. The only part that grows, so footers stay aligned. */
function CardContent({ children, ...rest }: CardContentProps) {
  return (
    <div {...rest} {...partAttrs("card", "content")}>
      {children}
    </div>
  );
}

/** Card.Footer — the actions row. */
function CardFooter({ children, ...rest }: CardFooterProps) {
  return (
    <div {...rest} {...partAttrs("card", "footer")}>
      {children}
    </div>
  );
}

/**
 * Card — a CSS-only surface with an Ark-style anatomy.
 *
 * There is no Ark machine for a card (nothing to track: no open state, no
 * focus management, no ids to wire), so unlike Field or Dialog every part is
 * authored here. What makes it a Moderno primitive is the same contract Button
 * follows, widened to a compound component: each part emits
 * `data-scope="card"` plus its own `data-part`, the root additionally carries
 * `cardRecipe`'s `data-variant`/`data-size`, and `components.css` paints all of
 * it from token slots. Consumer props spread first so behaviour and `className`
 * win; the scope/part/variant attributes land last and can't be clobbered.
 *
 * Every part is optional and order is the consumer's — `header`, `content` and
 * `footer` collapse the padding between whichever pair is adjacent.
 */
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
};

export type { CardVariant, CardSize } from "@moderno-ui/core";
