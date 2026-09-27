import { useEffect, useRef, useState } from "react";
import {
  ColorPicker as ArkColorPicker,
  Portal,
  parseColor,
  useColorPickerContext,
  useFieldContext,
} from "@ark-ui/react";
import type { Color, ColorPickerRootProps } from "@ark-ui/react";
import {
  COLOR_PICKER_DEFAULT_VALUE,
  COLOR_PICKER_TRANSLATIONS,
  colorPickerRecipe,
  colorPickerSwatches,
  parseHexColor,
  partAttrs,
  supportsEyeDropper,
  type ColorPickerSize,
  type ColorPickerTranslations,
} from "@moderno-ui/core";

export type { ColorPickerSize, ColorPickerTranslations } from "@moderno-ui/core";

/** What `onValueChange` reports: the new colour as `#RRGGBB` (or `#RRGGBBAA`). */
export interface ColorPickerValueChangeDetails {
  value: string;
}

export interface ColorPickerProps extends Omit<
  ColorPickerRootProps,
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "onValueChangeEnd"
  | "format"
  | "defaultFormat"
  | "onFormatChange"
  | "inline"
  | "name"
  | "ids"
  | "asChild"
  | "children"
> {
  /** The colour, as a hex string (`#1E90FF`). Pass it with `onValueChange` to control the picker. */
  value?: string;
  /** The colour it starts on when uncontrolled, as a hex string. */
  defaultValue?: string;
  /** Called while the colour changes, dragging included, with the new hex. */
  onValueChange?: (details: ColorPickerValueChangeDetails) => void;
  /** Show the alpha slider, so the colour can be see-through. Off: the colour is always opaque. */
  alpha?: boolean;
  /** Preset colours shown under the controls, as hex strings. Clicking one selects it. */
  swatches?: string[];
  /** The trigger's height, swatch and type — resolves to `data-size` on the root; `md` by default. */
  size?: ColorPickerSize;
  /** Submits the hex with a form under this name. */
  name?: string;
  /** Render the popover at the end of the body, so no parent clips it. Default true. */
  portalled?: boolean;
  /** The parts' accessible names, in the reader's language. */
  translations?: Partial<ColorPickerTranslations>;
}

/** The picker's value as it reports it: `#RRGGBB`, or `#RRGGBBAA` with `alpha` while see-through. */
function hexOf(color: Color, alpha: boolean): string {
  return parseHexColor(color.toString("hexa"), { alpha }) ?? COLOR_PICKER_DEFAULT_VALUE;
}

/**
 * A hex string as Ark's colour. HSB, the model the area and the hue slider
 * draw, so a hue survives a trip through grey. Not a hex colour: black.
 */
function colorOf(hex: string | undefined, alpha: boolean): Color {
  const parsed = parseHexColor(hex ?? "", { alpha }) ?? COLOR_PICKER_DEFAULT_VALUE;
  return parseColor(parsed).toFormat("hsba");
}

/** Whether the browser can pick from the screen; false until mounted, as on the server. */
function useEyeDropperSupport(): boolean {
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(supportsEyeDropper()), []);
  return supported;
}

/**
 * The trigger: the colour's swatch and its hex. Outside a Field it is named
 * "Color #1E90FF"; inside one, the Field's label names it and the hex joins
 * the helper and error text in its description.
 */
function ColorPickerTrigger({
  alpha,
  label,
  valueTextId,
  describedBy,
}: {
  alpha: boolean;
  label: string;
  valueTextId?: string;
  describedBy?: string;
}) {
  const hex = hexOf(useColorPickerContext().value, alpha);
  const description = [valueTextId, describedBy].filter(Boolean).join(" ") || undefined;
  return (
    <ArkColorPicker.Trigger aria-label={`${label} ${hex}`} aria-describedby={description}>
      <ArkColorPicker.ValueSwatch />
      <ArkColorPicker.ValueText id={valueTextId}>{hex}</ArkColorPicker.ValueText>
    </ArkColorPicker.Trigger>
  );
}

/**
 * The hex text box. What is typed stays a draft until Enter or blur; then a
 * hex colour (`#RGB`, `#RRGGBB`, `#RRGGBBAA`, `#` optional) becomes the value
 * and anything else is dropped, so the box shows the last valid colour again.
 */
function ColorPickerHexInput({
  alpha,
  label,
  disabled,
  readOnly,
}: {
  alpha: boolean;
  label: string;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const colorPicker = useColorPickerContext();
  const [draft, setDraft] = useState<string | null>(null);
  const hex = hexOf(colorPicker.value, alpha);

  function commit() {
    const next = parseHexColor(draft ?? "", { alpha });
    if (next && next !== hex) colorPicker.setValue(colorOf(next, alpha));
    setDraft(null);
  }

  return (
    <input
      {...partAttrs("color-picker", "hex-input")}
      type="text"
      aria-label={label}
      autoComplete="off"
      spellCheck={false}
      disabled={disabled}
      readOnly={readOnly}
      value={draft ?? hex}
      onChange={(event) => setDraft(event.currentTarget.value)}
      onFocus={(event) => event.currentTarget.select()}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        commit();
      }}
    />
  );
}

/** Submits the colour's hex with a form. */
function ColorPickerHiddenInput({ alpha, name }: { alpha: boolean; name: string }) {
  const colorPicker = useColorPickerContext();
  return <input type="hidden" name={name} value={hexOf(colorPicker.value, alpha)} />;
}

/** An eyedropper glyph for the button that picks from the screen. */
function EyeDropperIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 22 1-1h3l9-9" />
      <path d="M3 21v-3l9-9" />
      <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
    </svg>
  );
}

/**
 * ColorPicker — pick a colour from a popover: a saturation and brightness
 * area, a hue slider, an optional alpha slider, a hex box, an eyedropper
 * (where the browser has one) and optional preset swatches. The trigger
 * shows the colour and its hex.
 *
 * Ark's color-picker machine drives it: dragging and arrow keys in the area
 * and the sliders, opening, closing on Escape or outside, and returning focus
 * to the trigger. The value in and out is a hex string: `#RRGGBB`, or
 * `#RRGGBBAA` with `alpha` while the colour is see-through. Inside a `Field`,
 * the Field's label names the trigger and its helper and error text describe
 * it. `size` is the recipe's; every other prop goes to Ark's Root.
 */
export function ColorPicker({
  value,
  defaultValue,
  onValueChange,
  alpha = false,
  swatches,
  size,
  name,
  portalled = true,
  translations,
  positioning,
  ...rest
}: ColorPickerProps) {
  const labels = { ...COLOR_PICKER_TRANSLATIONS, ...translations };
  const field = useFieldContext();
  const eyeDropper = useEyeDropperSupport();
  const [initialColor] = useState(() => colorOf(defaultValue, alpha));
  // The last colour Ark reported. A controlled `value` that is still its
  // hex hands Ark that same colour back, so the hue and the area's position
  // survive the round trip through a hex string.
  const reported = useRef<Color | null>(null);

  function controlledColor(hex: string): Color {
    const last = reported.current;
    if (last && hexOf(last, alpha) === parseHexColor(hex, { alpha })) return last;
    return colorOf(hex, alpha);
  }

  const valueTextId = field ? `${field.ids.control}:value` : undefined;

  return (
    <ArkColorPicker.Root
      {...rest}
      {...colorPickerRecipe({ size })}
      ids={field ? { label: field.ids.label, trigger: field.ids.control } : undefined}
      positioning={{ placement: "bottom-start", ...positioning }}
      value={value === undefined ? undefined : controlledColor(value)}
      defaultValue={initialColor}
      onValueChange={(details) => {
        reported.current = details.value;
        onValueChange?.({ value: hexOf(details.value, alpha) });
      }}
    >
      <ArkColorPicker.Control>
        <ColorPickerTrigger
          alpha={alpha}
          label={labels.trigger}
          valueTextId={valueTextId}
          describedBy={field?.ariaDescribedby}
        />
      </ArkColorPicker.Control>
      <Portal disabled={!portalled}>
        <ArkColorPicker.Positioner>
          <ArkColorPicker.Content>
            <ArkColorPicker.Area>
              <ArkColorPicker.AreaBackground />
              <ArkColorPicker.AreaThumb aria-label={labels.area} />
            </ArkColorPicker.Area>
            <ArkColorPicker.ChannelSlider channel="hue">
              <ArkColorPicker.ChannelSliderTrack />
              <ArkColorPicker.ChannelSliderThumb aria-label={labels.hue} />
            </ArkColorPicker.ChannelSlider>
            {alpha ? (
              <ArkColorPicker.ChannelSlider channel="alpha">
                <ArkColorPicker.ChannelSliderTrack />
                <ArkColorPicker.ChannelSliderThumb aria-label={labels.alpha} />
              </ArkColorPicker.ChannelSlider>
            ) : null}
            <ColorPickerHexInput
              alpha={alpha}
              label={labels.hex}
              disabled={rest.disabled ?? field?.disabled}
              readOnly={rest.readOnly ?? field?.readOnly}
            />
            {eyeDropper ? (
              <ArkColorPicker.EyeDropperTrigger aria-label={labels.eyeDropper}>
                <EyeDropperIcon />
              </ArkColorPicker.EyeDropperTrigger>
            ) : null}
            <ColorPickerSwatches alpha={alpha} swatches={swatches} labels={labels} />
          </ArkColorPicker.Content>
        </ArkColorPicker.Positioner>
      </Portal>
      {name ? <ColorPickerHiddenInput alpha={alpha} name={name} /> : null}
    </ArkColorPicker.Root>
  );
}

/** The preset swatches, one button each; none without `swatches`. */
function ColorPickerSwatches({
  alpha,
  swatches,
  labels,
}: {
  alpha: boolean;
  swatches: string[] | undefined;
  labels: ColorPickerTranslations;
}) {
  const colors = colorPickerSwatches(swatches, { alpha });
  if (colors.length === 0) return null;
  return (
    <ArkColorPicker.SwatchGroup role="group" aria-label={labels.swatches}>
      {colors.map((color) => (
        <ArkColorPicker.SwatchTrigger
          key={color}
          value={color}
          aria-label={`${labels.swatch} ${color}`}
        >
          <ArkColorPicker.Swatch value={color} />
        </ArkColorPicker.SwatchTrigger>
      ))}
    </ArkColorPicker.SwatchGroup>
  );
}
