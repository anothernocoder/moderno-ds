import type { ComponentPropsWithRef } from "react";
import { buttonRecipe, partAttrs, type VariantProps } from "@moderno/core";

export interface ButtonProps
  extends ComponentPropsWithRef<"button">, VariantProps<typeof buttonRecipe.variants> {}

/**
 * Button — ejected copy of the @moderno/react reference primitive.
 *
 * Ejecting is the escape hatch: you now own this markup. Styling still comes
 * entirely from the shared components.css (via @moderno/css) keyed on the
 * data-scope/data-part/data-variant attributes, so re-theming via CSS variables
 * keeps working. Behaviour-only props (onClick, aria-*) win; the scope/part
 * attributes are applied last so they can't be clobbered.
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
