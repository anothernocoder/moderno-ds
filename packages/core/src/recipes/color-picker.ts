import { cva, type VariantProps } from "../cva.js";

/**
 * ColorPicker: `size` on the root — the trigger's height, swatch and type.
 * The popover keeps one density whatever the size. The value, the open
 * state, `alpha` and `swatches` are props of the component; open, disabled,
 * invalid, dragging and a checked swatch surface as Ark's own `data-*`.
 */
export const colorPickerRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** ColorPicker's density: the trigger's height, its swatch and its type. */
export type ColorPickerSize = NonNullable<VariantProps<typeof colorPickerRecipe.variants>["size"]>;

/** The colour a ColorPicker starts on when it is given none: black, as Ark's. */
export const COLOR_PICKER_DEFAULT_VALUE = "#000000";

/** The accessible names a ColorPicker gives its parts, in the reader's language. */
export interface ColorPickerTranslations {
  /** Names the trigger outside a Field, before the colour: "Color #1E90FF". */
  trigger: string;
  /** The saturation and brightness area. */
  area: string;
  /** The hue slider. */
  hue: string;
  /** The alpha slider. */
  alpha: string;
  /** The hex text box. */
  hex: string;
  /** The eyedropper button. */
  eyeDropper: string;
  /** The group of preset swatches. */
  swatches: string;
  /** Names each swatch, before its colour: "Select #FF0000". */
  swatch: string;
}

/** The English names; a `translations` prop overrides any of them. */
export const COLOR_PICKER_TRANSLATIONS: ColorPickerTranslations = {
  trigger: "Color",
  area: "Saturation and brightness",
  hue: "Hue",
  alpha: "Alpha",
  hex: "Hex",
  eyeDropper: "Pick a color from the screen",
  swatches: "Swatches",
  swatch: "Select",
};

/** 3, 4, 6 or 8 hex digits, with or without a leading `#`. */
const HEX_COLOR = /^#?([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i;

/**
 * The hex colour a person typed or pasted, written the one way a ColorPicker
 * reports it: `#RRGGBB`, or `#RRGGBBAA` while it is see-through. Takes
 * `#RGB`, `#RGBA`, `#RRGGBB` and `#RRGGBBAA`, with or without the `#`, in
 * any case and with spaces around. With `alpha: false` the alpha digits are
 * dropped, so the colour is opaque. Anything else is not a hex colour: null.
 */
export function parseHexColor(
  input: string,
  { alpha = true }: { alpha?: boolean } = {},
): string | null {
  const match = HEX_COLOR.exec(input.trim());
  if (!match) return null;
  const digits = match[1]!.toUpperCase();
  const full = digits.length <= 4 ? [...digits].map((digit) => digit + digit).join("") : digits;
  const opaque = !alpha || full.slice(6) === "FF";
  return `#${opaque ? full.slice(0, 6) : full}`;
}

/**
 * The preset swatches a ColorPicker shows, from its `swatches` prop: each
 * written as `parseHexColor` writes it (opaque without `alpha`), once each,
 * in the order given. A string that is not a hex colour is left out.
 */
export function colorPickerSwatches(
  swatches: readonly string[] | undefined,
  { alpha = true }: { alpha?: boolean } = {},
): string[] {
  const colors = (swatches ?? []).map((swatch) => parseHexColor(swatch, { alpha }));
  return [...new Set(colors.filter((color): color is string => color !== null))];
}

/**
 * Whether this browser can pick a colour from the screen (the EyeDropper
 * API; Chromium only, in a secure context). False on the server, so the
 * eyedropper button appears once the page runs in a browser that has it.
 */
export function supportsEyeDropper(): boolean {
  return typeof globalThis === "object" && "EyeDropper" in globalThis;
}
