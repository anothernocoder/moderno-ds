import { splitProps, type JSX } from "solid-js";
import { buttonRecipe, partAttrs, type VariantProps } from "@moderno/core";

type ButtonVariant = NonNullable<VariantProps<typeof buttonRecipe.variants>["variant"]>;
type ButtonSize = NonNullable<VariantProps<typeof buttonRecipe.variants>["size"]>;

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/**
 * Button — the reference primitive, ported to Solid.
 *
 * Identical contract to `@moderno/react`: a plain `<button>` carrying
 * `data-scope`/`data-part` plus the shared `buttonRecipe`'s `data-variant`/
 * `data-size`. Zero styling lives here — `components.css` paints it from token
 * slots. `splitProps` peels the recipe props off; everything else (onClick,
 * aria-*, class) is forwarded, and the scope/part/variant attrs are spread last
 * so they can't be clobbered — mirroring the React binding's prop order.
 */
export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, ["variant", "size", "type", "children"]);
  return (
    <button
      type={local.type ?? "button"}
      {...rest}
      {...partAttrs("button", "root")}
      {...buttonRecipe({ variant: local.variant, size: local.size })}
    >
      {local.children}
    </button>
  );
}

export type { ButtonVariant, ButtonSize };
