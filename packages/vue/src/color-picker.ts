import {
  defineComponent,
  h,
  onMounted,
  ref,
  type Component,
  type DefineComponent,
  type PropType,
} from "vue";
import {
  ColorPicker as ArkColorPicker,
  parseColor,
  useColorPickerContext,
  useFieldContext,
} from "@ark-ui/vue";
import type { Color, ColorPickerRootProps } from "@ark-ui/vue";
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
import { Portal } from "./dialog.js";

export type { ColorPickerSize, ColorPickerTranslations } from "@moderno-ui/core";

/** What `value-change` reports: the new colour as `#RRGGBB` (or `#RRGGBBAA`). */
export interface ColorPickerValueChangeDetails {
  value: string;
}

/**
 * ColorPicker's public surface. Ark Root's other props and listeners
 * (`default-open`, `@open-change`, …) pass through as attributes.
 */
export interface ColorPickerProps {
  /** The colour, as a hex string (`#1E90FF`); bind it with `v-model`. */
  modelValue?: string;
  /** The colour it starts on when uncontrolled, as a hex string. */
  defaultValue?: string;
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
  /** Where the popover sits against the trigger; `bottom-start` by default. */
  positioning?: ColorPickerRootProps["positioning"];
  disabled?: boolean;
  readOnly?: boolean;
  onValueChange?: (details: ColorPickerValueChangeDetails) => void;
  "onUpdate:modelValue"?: (value: string) => void;
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

// Ark's parts re-typed as plain Components, so each merged bag isn't checked
// against their full prop unions (only data-*, aria-* and a few props are added).
const Ark = ArkColorPicker as unknown as Record<keyof typeof ArkColorPicker, Component>;

/**
 * The trigger: the colour's swatch and its hex. Outside a Field it is named
 * "Color #1E90FF"; inside one, the Field's label names it and the hex joins
 * the helper and error text in its description.
 */
const ColorPickerTrigger = defineComponent({
  name: "ModernoColorPickerTrigger",
  props: {
    alpha: { type: Boolean, required: true },
    label: { type: String, required: true },
    valueTextId: { type: String, default: undefined },
    describedBy: { type: String, default: undefined },
  },
  setup(props) {
    const colorPicker = useColorPickerContext();
    return () => {
      const hex = hexOf(colorPicker.value.value, props.alpha);
      return h(
        Ark.Trigger,
        {
          "aria-label": `${props.label} ${hex}`,
          "aria-describedby":
            [props.valueTextId, props.describedBy].filter(Boolean).join(" ") || undefined,
        },
        () => [h(Ark.ValueSwatch), h(Ark.ValueText, { id: props.valueTextId }, () => hex)],
      );
    };
  },
});

/**
 * The hex text box. What is typed stays a draft until Enter or blur; then a
 * hex colour (`#RGB`, `#RRGGBB`, `#RRGGBBAA`, `#` optional) becomes the value
 * and anything else is dropped, so the box shows the last valid colour again.
 */
const ColorPickerHexInput = defineComponent({
  name: "ModernoColorPickerHexInput",
  props: {
    alpha: { type: Boolean, required: true },
    label: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
  },
  setup(props) {
    const colorPicker = useColorPickerContext();
    const draft = ref<string | null>(null);

    function commit() {
      const next = parseHexColor(draft.value ?? "", { alpha: props.alpha });
      if (next && next !== hexOf(colorPicker.value.value, props.alpha)) {
        colorPicker.value.setValue(colorOf(next, props.alpha));
      }
      draft.value = null;
    }

    return () =>
      h("input", {
        ...partAttrs("color-picker", "hex-input"),
        type: "text",
        "aria-label": props.label,
        autocomplete: "off",
        spellcheck: false,
        disabled: props.disabled,
        readonly: props.readOnly,
        value: draft.value ?? hexOf(colorPicker.value.value, props.alpha),
        onInput: (event: Event) => {
          draft.value = (event.currentTarget as HTMLInputElement).value;
        },
        onFocus: (event: FocusEvent) => (event.currentTarget as HTMLInputElement).select(),
        onBlur: commit,
        onKeydown: (event: KeyboardEvent) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          commit();
        },
      });
  },
});

/** Submits the colour's hex with a form. */
const ColorPickerHiddenInput = defineComponent({
  name: "ModernoColorPickerHiddenInput",
  props: {
    alpha: { type: Boolean, required: true },
    name: { type: String, required: true },
  },
  setup(props) {
    const colorPicker = useColorPickerContext();
    return () =>
      h("input", {
        type: "hidden",
        name: props.name,
        value: hexOf(colorPicker.value.value, props.alpha),
      });
  },
});

/** An eyedropper glyph for the button that picks from the screen. */
const eyeDropperIcon = () =>
  h(
    "svg",
    {
      "aria-hidden": "true",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    [
      h("path", { d: "m2 22 1-1h3l9-9" }),
      h("path", { d: "M3 21v-3l9-9" }),
      h("path", {
        d: "m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z",
      }),
    ],
  );

/** One channel slider — hue or alpha — named for a screen reader. */
const channelSlider = (channel: "hue" | "alpha", label: string) =>
  h(Ark.ChannelSlider, { channel }, () => [
    h(Ark.ChannelSliderTrack),
    h(Ark.ChannelSliderThumb, { "aria-label": label }),
  ]);

/** The preset swatches, one button each; none without `swatches`. */
function swatchGroup(colors: string[], labels: ColorPickerTranslations) {
  if (colors.length === 0) return null;
  return h(Ark.SwatchGroup, { role: "group", "aria-label": labels.swatches }, () =>
    colors.map((color) =>
      h(
        Ark.SwatchTrigger,
        { key: color, value: color, "aria-label": `${labels.swatch} ${color}` },
        () => h(Ark.Swatch, { value: color }),
      ),
    ),
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
 * `#RRGGBBAA` with `alpha` while the colour is see-through. Bind it with
 * `v-model`, or start it with `default-value` and listen with
 * `@value-change`. Inside a `Field`, the Field's label names the trigger and
 * its helper and error text describe it. `size` is the recipe's; every other
 * attribute and listener (`default-open`, `@open-change`, …) goes to Ark's
 * Root via `inheritAttrs: false`.
 */
const ColorPickerImpl = defineComponent({
  name: "ModernoColorPicker",
  inheritAttrs: false,
  props: {
    /** The colour, as a hex string (`#1E90FF`); bind it with `v-model`. */
    modelValue: { type: String, default: undefined },
    /** The colour it starts on when uncontrolled, as a hex string. */
    defaultValue: { type: String, default: undefined },
    /** Show the alpha slider, so the colour can be see-through. Off: the colour is always opaque. */
    alpha: { type: Boolean, default: false },
    /** Preset colours shown under the controls, as hex strings. Clicking one selects it. */
    swatches: { type: Array as PropType<string[]>, default: undefined },
    /** The trigger's height, swatch and type — resolves to `data-size` on the root; `md` by default. */
    size: { type: String as PropType<ColorPickerSize>, default: undefined },
    /** Submits the hex with a form under this name. */
    name: { type: String, default: undefined },
    /** Render the popover at the end of the body, so no parent clips it. */
    portalled: { type: Boolean, default: true },
    /** The parts' accessible names, in the reader's language. */
    translations: {
      type: Object as PropType<Partial<ColorPickerTranslations>>,
      default: undefined,
    },
    /** Where the popover sits against the trigger; `bottom-start` by default. */
    positioning: {
      type: Object as PropType<ColorPickerRootProps["positioning"]>,
      default: undefined,
    },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
  },
  emits: {
    "update:modelValue": (value: string) => typeof value === "string",
    valueChange: (details: ColorPickerValueChangeDetails) => typeof details.value === "string",
  },
  setup(props, { attrs, emit }) {
    const field = useFieldContext();
    const eyeDropper = ref(false);
    onMounted(() => {
      eyeDropper.value = supportsEyeDropper();
    });
    const initialColor = colorOf(props.defaultValue, props.alpha);
    // The last colour Ark reported. A bound value that is still its hex hands
    // Ark that same colour back, so the hue and the area's position survive
    // the round trip through a hex string.
    let reported: Color | null = null;

    function boundColor(hex: string): Color {
      if (reported && hexOf(reported, props.alpha) === parseHexColor(hex, { alpha: props.alpha })) {
        return reported;
      }
      return colorOf(hex, props.alpha);
    }

    return () => {
      const labels = { ...COLOR_PICKER_TRANSLATIONS, ...props.translations };
      const fieldState = field?.value;
      const disabled = props.disabled ?? fieldState?.disabled;
      const readOnly = props.readOnly ?? fieldState?.readOnly;
      const valueTextId = fieldState ? `${fieldState.ids.control}:value` : undefined;
      return h(
        Ark.Root,
        {
          ...attrs,
          ...colorPickerRecipe({ size: props.size }),
          ids: fieldState
            ? { label: fieldState.ids.label, trigger: fieldState.ids.control }
            : undefined,
          positioning: { placement: "bottom-start", ...props.positioning },
          disabled,
          readOnly,
          modelValue: props.modelValue === undefined ? undefined : boundColor(props.modelValue),
          defaultValue: initialColor,
          onValueChange: (details: { value: Color }) => {
            reported = details.value;
            const value = hexOf(details.value, props.alpha);
            emit("update:modelValue", value);
            emit("valueChange", { value });
          },
        },
        () => [
          h(Ark.Control, () =>
            h(ColorPickerTrigger, {
              alpha: props.alpha,
              label: labels.trigger,
              valueTextId,
              describedBy: fieldState?.ariaDescribedby,
            }),
          ),
          h(Portal, { disabled: !props.portalled }, () =>
            h(Ark.Positioner, () =>
              h(Ark.Content, () => [
                h(Ark.Area, () => [
                  h(Ark.AreaBackground),
                  h(Ark.AreaThumb, { "aria-label": labels.area }),
                ]),
                channelSlider("hue", labels.hue),
                props.alpha ? channelSlider("alpha", labels.alpha) : null,
                h(ColorPickerHexInput, {
                  alpha: props.alpha,
                  label: labels.hex,
                  disabled,
                  readOnly,
                }),
                eyeDropper.value
                  ? h(Ark.EyeDropperTrigger, { "aria-label": labels.eyeDropper }, eyeDropperIcon)
                  : null,
                swatchGroup(colorPickerSwatches(props.swatches, { alpha: props.alpha }), labels),
              ]),
            ),
          ),
          props.name ? h(ColorPickerHiddenInput, { alpha: props.alpha, name: props.name }) : null,
        ],
      );
    };
  },
});

/**
 * Annotated so the emitted `.d.ts` names `ColorPickerProps` instead of
 * inlining Ark's positioning type from an internal `@zag-js` path (TS2742).
 */
export const ColorPicker = ColorPickerImpl as unknown as DefineComponent<ColorPickerProps>;
