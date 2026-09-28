import { For, Show, createSignal, onMount, splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import {
  ColorPicker as ArkColorPicker,
  parseColor,
  useColorPickerContext,
  useFieldContext,
} from "@ark-ui/solid";
import type { Color, ColorPickerRootProps } from "@ark-ui/solid";
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

export type ColorPickerProps = Omit<
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
> & {
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
};

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

/**
 * The trigger: the colour's swatch and its hex. Outside a Field it is named
 * "Color #1E90FF"; inside one, the Field's label names it and the hex joins
 * the helper and error text in its description.
 */
function ColorPickerTrigger(props: {
  alpha: boolean;
  label: string;
  valueTextId?: string;
  describedBy?: string;
}) {
  const colorPicker = useColorPickerContext();
  const hex = () => hexOf(colorPicker().value, props.alpha);
  return (
    <ArkColorPicker.Trigger
      aria-label={`${props.label} ${hex()}`}
      aria-describedby={
        [props.valueTextId, props.describedBy].filter(Boolean).join(" ") || undefined
      }
    >
      <ArkColorPicker.ValueSwatch />
      <ArkColorPicker.ValueText id={props.valueTextId}>{hex()}</ArkColorPicker.ValueText>
    </ArkColorPicker.Trigger>
  );
}

/**
 * The hex text box. What is typed stays a draft until Enter or blur; then a
 * hex colour (`#RGB`, `#RRGGBB`, `#RRGGBBAA`, `#` optional) becomes the value
 * and anything else is dropped, so the box shows the last valid colour again.
 */
function ColorPickerHexInput(props: {
  alpha: boolean;
  label: string;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const colorPicker = useColorPickerContext();
  const [draft, setDraft] = createSignal<string | null>(null);
  const hex = () => hexOf(colorPicker().value, props.alpha);

  function commit() {
    const next = parseHexColor(draft() ?? "", { alpha: props.alpha });
    if (next && next !== hex()) colorPicker().setValue(colorOf(next, props.alpha));
    setDraft(null);
  }

  return (
    <input
      {...partAttrs("color-picker", "hex-input")}
      type="text"
      aria-label={props.label}
      autocomplete="off"
      spellcheck={false}
      disabled={props.disabled}
      readOnly={props.readOnly}
      value={draft() ?? hex()}
      onInput={(event) => setDraft(event.currentTarget.value)}
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
function ColorPickerHiddenInput(props: { alpha: boolean; name: string }) {
  const colorPicker = useColorPickerContext();
  return <input type="hidden" name={props.name} value={hexOf(colorPicker().value, props.alpha)} />;
}

/** An eyedropper glyph for the button that picks from the screen. */
function EyeDropperIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
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
export function ColorPicker(props: ColorPickerProps) {
  const [local, rest] = splitProps(props, [
    "value",
    "defaultValue",
    "onValueChange",
    "alpha",
    "swatches",
    "size",
    "name",
    "portalled",
    "translations",
    "positioning",
  ]);
  const alpha = () => local.alpha ?? false;
  const labels = () => ({ ...COLOR_PICKER_TRANSLATIONS, ...local.translations });
  const field = useFieldContext();
  const fieldState = () => field?.();
  const [eyeDropper, setEyeDropper] = createSignal(false);
  onMount(() => setEyeDropper(supportsEyeDropper()));
  const initialColor = colorOf(local.defaultValue, alpha());
  // The last colour Ark reported. A controlled `value` that is still its
  // hex hands Ark that same colour back, so the hue and the area's position
  // survive the round trip through a hex string.
  let reported: Color | null = null;

  function controlledColor(hex: string): Color {
    if (reported && hexOf(reported, alpha()) === parseHexColor(hex, { alpha: alpha() })) {
      return reported;
    }
    return colorOf(hex, alpha());
  }

  const valueTextId = () => {
    const state = fieldState();
    return state ? `${state.ids.control}:value` : undefined;
  };

  const popover = () => (
    <ArkColorPicker.Positioner>
      <ArkColorPicker.Content>
        <ArkColorPicker.Area>
          <ArkColorPicker.AreaBackground />
          <ArkColorPicker.AreaThumb aria-label={labels().area} />
        </ArkColorPicker.Area>
        <ArkColorPicker.ChannelSlider channel="hue">
          <ArkColorPicker.ChannelSliderTrack />
          <ArkColorPicker.ChannelSliderThumb aria-label={labels().hue} />
        </ArkColorPicker.ChannelSlider>
        <Show when={alpha()}>
          <ArkColorPicker.ChannelSlider channel="alpha">
            <ArkColorPicker.ChannelSliderTrack />
            <ArkColorPicker.ChannelSliderThumb aria-label={labels().alpha} />
          </ArkColorPicker.ChannelSlider>
        </Show>
        <ColorPickerHexInput
          alpha={alpha()}
          label={labels().hex}
          disabled={rest.disabled ?? fieldState()?.disabled}
          readOnly={rest.readOnly ?? fieldState()?.readOnly}
        />
        <Show when={eyeDropper()}>
          <ArkColorPicker.EyeDropperTrigger aria-label={labels().eyeDropper}>
            <EyeDropperIcon />
          </ArkColorPicker.EyeDropperTrigger>
        </Show>
        <Show when={colorPickerSwatches(local.swatches, { alpha: alpha() }).length > 0}>
          <ArkColorPicker.SwatchGroup role="group" aria-label={labels().swatches}>
            <For each={colorPickerSwatches(local.swatches, { alpha: alpha() })}>
              {(color) => (
                <ArkColorPicker.SwatchTrigger
                  value={color}
                  aria-label={`${labels().swatch} ${color}`}
                >
                  <ArkColorPicker.Swatch value={color} />
                </ArkColorPicker.SwatchTrigger>
              )}
            </For>
          </ArkColorPicker.SwatchGroup>
        </Show>
      </ArkColorPicker.Content>
    </ArkColorPicker.Positioner>
  );

  return (
    <ArkColorPicker.Root
      {...rest}
      {...colorPickerRecipe({ size: local.size })}
      ids={
        fieldState()
          ? { label: fieldState()!.ids.label, trigger: fieldState()!.ids.control }
          : undefined
      }
      positioning={{ placement: "bottom-start", ...local.positioning }}
      value={local.value === undefined ? undefined : controlledColor(local.value)}
      defaultValue={initialColor}
      onValueChange={(details) => {
        reported = details.value;
        local.onValueChange?.({ value: hexOf(details.value, alpha()) });
      }}
    >
      <ArkColorPicker.Control>
        <ColorPickerTrigger
          alpha={alpha()}
          label={labels().trigger}
          valueTextId={valueTextId()}
          describedBy={fieldState()?.ariaDescribedby}
        />
      </ArkColorPicker.Control>
      <Show when={local.portalled !== false} fallback={popover()}>
        <Portal>{popover()}</Portal>
      </Show>
      <Show when={local.name}>
        {(name) => <ColorPickerHiddenInput alpha={alpha()} name={name()} />}
      </Show>
    </ArkColorPicker.Root>
  );
}
