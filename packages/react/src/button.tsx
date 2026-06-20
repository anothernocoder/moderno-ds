import type { ComponentPropsWithRef } from "react";
import { buttonRecipe, partAttrs, type VariantProps } from "@moderno/core";

export interface ButtonProps
  extends ComponentPropsWithRef<"button">, VariantProps<typeof buttonRecipe.variants> {}

/**
 * Button — the reference primitive that establishes the Moderno pattern.
 *
 * There is no Ark "button" machine (a button needs no headless behaviour), so
 * this is the purest illustration of the contract: a plain element carrying
 * `data-scope`/`data-part` plus the recipe's `data-variant`/`data-size`. Every
 * pixel of styling comes from `components.css` keyed on those attributes — the
 * component holds zero colour, radius, or font. Switching brand (re-mapping the
 * token slots) re-themes it without touching this file.
 *
 * Consumer-supplied props win for behaviour (onClick, aria-*, className), while
 * the scope/part/variant attributes are applied last so they can't be clobbered.
 */
export function Button({ variant, size, type, children, ...rest }: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      {...rest}
      {...partAttrs("button", "root")}
      {...buttonRecipe({ variant, size })}
    >
      {children}
    </button>
  );
}
