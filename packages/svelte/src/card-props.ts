/**
 * Card's prop types, in a plain module rather than inline in each `.svelte`
 * file.
 *
 * `index.ts` exposes the parts as one `Card` namespace object, so `svelte-package`
 * has to *name* each part's props type when it emits `index.d.ts` — an interface
 * declared inside a `.svelte` instance script has no importable name, and the
 * whole declaration file silently fails to build (the same TS2742 class of
 * problem the wrapped `Select` export is annotated for). Declaring them here
 * gives every part a nameable type, and lets the five body parts share one.
 */
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { CardSize, CardVariant } from "@moderno-ui/core";

/** `Card.Root` — the surface, plus the recipe's variant/size. */
export interface CardRootProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  size?: CardSize;
  children?: Snippet;
}

/** Any part that is a plain `div` (`header`, `content`, `footer`). */
export interface CardDivPartProps extends HTMLAttributes<HTMLDivElement> {
  children?: Snippet;
}

/** `Card.Title` — an `h3`. */
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: Snippet;
}

/** `Card.Description` — a `p`. */
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: Snippet;
}
