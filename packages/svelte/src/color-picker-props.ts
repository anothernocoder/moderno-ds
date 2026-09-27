/**
 * ColorPicker's prop types, in a `.ts` file rather than inside the `.svelte`:
 * a `Props` interface declared in a component's instance script is not
 * exported, so a consumer could not name it. Declaring it here gives the
 * component and the package's exports one nameable type.
 */
import type { ColorPickerRootProps } from "@ark-ui/svelte";
import type { ColorPickerSize, ColorPickerTranslations } from "@moderno-ui/core";

/** What `onValueChange` reports: the new colour as `#RRGGBB` (or `#RRGGBBAA`). */
export interface ColorPickerValueChangeDetails {
  value: string;
}

/** ColorPicker's own props, plus Ark Root's (open state, positioning, disabled, …). */
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
  /** The colour, as a hex string (`#1E90FF`); bindable. */
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
