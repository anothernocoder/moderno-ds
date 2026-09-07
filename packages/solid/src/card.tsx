import { splitProps, type JSX } from "solid-js";
import { cardRecipe, partAttrs, type CardSize, type CardVariant } from "@moderno-ui/core";

export interface CardRootProps extends JSX.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  size?: CardSize;
}

export type CardHeaderProps = JSX.HTMLAttributes<HTMLDivElement>;
export type CardTitleProps = JSX.HTMLAttributes<HTMLHeadingElement>;
export type CardDescriptionProps = JSX.HTMLAttributes<HTMLParagraphElement>;
export type CardContentProps = JSX.HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = JSX.HTMLAttributes<HTMLDivElement>;

/**
 * Card.Root — the surface. `splitProps` peels the recipe props off; everything
 * else is forwarded, and the scope/part/variant attrs spread last so they can't
 * be clobbered — mirroring the React binding's prop order.
 */
function CardRoot(props: CardRootProps) {
  const [local, rest] = splitProps(props, ["variant", "size", "children"]);
  return (
    <div
      {...rest}
      {...partAttrs("card", "root")}
      {...cardRecipe({ variant: local.variant, size: local.size })}
    >
      {local.children}
    </div>
  );
}

/** Card.Header — the title/description block. */
function CardHeader(props: CardHeaderProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <div {...rest} {...partAttrs("card", "header")}>
      {local.children}
    </div>
  );
}

/**
 * Card.Title — an `h3` by default because a card is a section of a page, not
 * its heading. Pass `role`/`aria-level` when the outline needs another rank.
 */
function CardTitle(props: CardTitleProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <h3 {...rest} {...partAttrs("card", "title")}>
      {local.children}
    </h3>
  );
}

/** Card.Description — the muted supporting line under the title. */
function CardDescription(props: CardDescriptionProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <p {...rest} {...partAttrs("card", "description")}>
      {local.children}
    </p>
  );
}

/** Card.Content — the body. The only part that grows, so footers stay aligned. */
function CardContent(props: CardContentProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <div {...rest} {...partAttrs("card", "content")}>
      {local.children}
    </div>
  );
}

/** Card.Footer — the actions row. */
function CardFooter(props: CardFooterProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <div {...rest} {...partAttrs("card", "footer")}>
      {local.children}
    </div>
  );
}

/**
 * Card — a CSS-only surface with an Ark-style anatomy, ported to Solid.
 *
 * Identical contract to `@moderno-ui/react`: no Ark machine (a card tracks no
 * state), so every part is authored here; each emits `data-scope="card"` plus
 * its own `data-part`, and the root carries `cardRecipe`'s `data-variant`/
 * `data-size`. Zero styling lives here — `components.css` paints it from token
 * slots.
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
