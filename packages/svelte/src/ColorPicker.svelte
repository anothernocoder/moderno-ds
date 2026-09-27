<!--
  ColorPicker — pick a colour from a popover: a saturation and brightness
  area, a hue slider, an optional alpha slider, a hex box, an eyedropper
  (where the browser has one) and optional preset swatches. The trigger shows
  the colour and its hex.

  Ark's color-picker machine drives it: dragging and arrow keys in the area
  and the sliders, opening, closing on Escape or outside, and returning focus
  to the trigger. The value in and out is a hex string: `#RRGGBB`, or
  `#RRGGBBAA` with `alpha` while the colour is see-through. `value` is
  bindable (`bind:value`); `defaultValue` starts it uncontrolled. Inside a
  `Field`, the Field's label names the trigger and its helper and error text
  describe it. `size` is the recipe's; every other prop goes to Ark's Root.
-->
<script lang="ts">
  import {
    ColorPicker as ArkColorPicker,
    Portal,
    parseColor,
    useFieldContext,
  } from "@ark-ui/svelte";
  import type { ColorPickerColor as Color } from "@ark-ui/svelte";
  import {
    COLOR_PICKER_DEFAULT_VALUE,
    COLOR_PICKER_TRANSLATIONS,
    colorPickerRecipe,
    colorPickerSwatches,
    parseHexColor,
    partAttrs,
    supportsEyeDropper,
  } from "@moderno-ui/core";
  import type { ColorPickerProps } from "./color-picker-props.js";

  let {
    value = $bindable(),
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
  }: ColorPickerProps = $props();

  /** The picker's value as it reports it: `#RRGGBB`, or `#RRGGBBAA` with `alpha` while see-through. */
  function hexOf(color: Color): string {
    return parseHexColor(color.toString("hexa"), { alpha }) ?? COLOR_PICKER_DEFAULT_VALUE;
  }

  /**
   * A hex string as Ark's colour. HSB, the model the area and the hue slider
   * draw, so a hue survives a trip through grey. Not a hex colour: black.
   */
  function colorOf(hex: string | undefined): Color {
    const parsed = parseHexColor(hex ?? "", { alpha }) ?? COLOR_PICKER_DEFAULT_VALUE;
    return parseColor(parsed).toFormat("hsba");
  }

  const labels = $derived({ ...COLOR_PICKER_TRANSLATIONS, ...translations });
  const field = useFieldContext();
  const fieldState = $derived(field?.());
  const valueTextId = $derived(fieldState ? `${fieldState.ids.control}:value` : undefined);
  const description = $derived(
    [valueTextId, fieldState?.ariaDescribedby].filter(Boolean).join(" ") || undefined,
  );
  const colors = $derived(colorPickerSwatches(swatches, { alpha }));

  // Whether the browser can pick from the screen; false until mounted, as on the server.
  let eyeDropper = $state(false);
  $effect(() => {
    eyeDropper = supportsEyeDropper();
  });

  // Read once: the colour an uncontrolled picker starts on.
  // svelte-ignore state_referenced_locally
  const initialColor = colorOf(defaultValue);
  // The last colour Ark reported. A bound value that is still its hex hands
  // Ark that same colour back, so the hue and the area's position survive the
  // round trip through a hex string.
  let reported: Color | null = null;

  function boundColor(hex: string): Color {
    if (reported && hexOf(reported) === parseHexColor(hex, { alpha })) return reported;
    return colorOf(hex);
  }

  // The hex box's draft: what is typed stays a draft until Enter or blur.
  let draft = $state<string | null>(null);

  /**
   * A hex colour (`#RGB`, `#RRGGBB`, `#RRGGBBAA`, `#` optional) becomes the
   * value; anything else is dropped, so the box shows the last valid colour.
   */
  function commit(setValue: (color: Color) => void, current: Color) {
    const next = parseHexColor(draft ?? "", { alpha });
    if (next && next !== hexOf(current)) setValue(colorOf(next));
    draft = null;
  }
</script>

{#snippet eyeDropperIcon()}
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
    <path
      d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"
    />
  </svg>
{/snippet}

<ArkColorPicker.Root
  {...rest}
  {...colorPickerRecipe({ size })}
  ids={fieldState ? { label: fieldState.ids.label, trigger: fieldState.ids.control } : undefined}
  positioning={{ placement: "bottom-start", ...positioning }}
  value={value === undefined ? undefined : boundColor(value)}
  defaultValue={initialColor}
  onValueChange={(details) => {
    reported = details.value;
    const hex = hexOf(details.value);
    if (value !== undefined) value = hex;
    onValueChange?.({ value: hex });
  }}
>
  <ArkColorPicker.Control>
    <ArkColorPicker.Context>
      {#snippet render(colorPicker)}
        <ArkColorPicker.Trigger
          aria-label={`${labels.trigger} ${hexOf(colorPicker().value)}`}
          aria-describedby={description}
        >
          <ArkColorPicker.ValueSwatch />
          <ArkColorPicker.ValueText id={valueTextId}>
            {hexOf(colorPicker().value)}
          </ArkColorPicker.ValueText>
        </ArkColorPicker.Trigger>
      {/snippet}
    </ArkColorPicker.Context>
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
        {#if alpha}
          <ArkColorPicker.ChannelSlider channel="alpha">
            <ArkColorPicker.ChannelSliderTrack />
            <ArkColorPicker.ChannelSliderThumb aria-label={labels.alpha} />
          </ArkColorPicker.ChannelSlider>
        {/if}
        <ArkColorPicker.Context>
          {#snippet render(colorPicker)}
            <input
              {...partAttrs("color-picker", "hex-input")}
              type="text"
              aria-label={labels.hex}
              autocomplete="off"
              spellcheck={false}
              disabled={rest.disabled ?? fieldState?.disabled}
              readonly={rest.readOnly ?? fieldState?.readOnly}
              value={draft ?? hexOf(colorPicker().value)}
              oninput={(event) => (draft = event.currentTarget.value)}
              onfocus={(event) => event.currentTarget.select()}
              onblur={() => commit(colorPicker().setValue, colorPicker().value)}
              onkeydown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                commit(colorPicker().setValue, colorPicker().value);
              }}
            />
          {/snippet}
        </ArkColorPicker.Context>
        {#if eyeDropper}
          <ArkColorPicker.EyeDropperTrigger aria-label={labels.eyeDropper}>
            {@render eyeDropperIcon()}
          </ArkColorPicker.EyeDropperTrigger>
        {/if}
        {#if colors.length > 0}
          <ArkColorPicker.SwatchGroup role="group" aria-label={labels.swatches}>
            {#each colors as color (color)}
              <ArkColorPicker.SwatchTrigger
                value={color}
                aria-label={`${labels.swatch} ${color}`}
              >
                <ArkColorPicker.Swatch value={color} />
              </ArkColorPicker.SwatchTrigger>
            {/each}
          </ArkColorPicker.SwatchGroup>
        {/if}
      </ArkColorPicker.Content>
    </ArkColorPicker.Positioner>
  </Portal>
  {#if name}
    <ArkColorPicker.Context>
      {#snippet render(colorPicker)}
        <input type="hidden" {name} value={hexOf(colorPicker().value)} />
      {/snippet}
    </ArkColorPicker.Context>
  {/if}
</ArkColorPicker.Root>
