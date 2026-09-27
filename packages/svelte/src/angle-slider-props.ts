/**
 * AngleSlider's prop types and the settings its Root hands to the Moderno
 * parts, in a `.ts` file rather than inside the `.svelte`s, for the same
 * reason as `callout-props.ts`: a `Props` interface declared inside a
 * component's instance script is not exported, so `index.ts` could not
 * re-export it by name.
 */
import { getContext, setContext } from "svelte";
import type { HTMLInputAttributes } from "svelte/elements";
import type { AngleSliderRootProps } from "@ark-ui/svelte";
import {
  angleSliderValueText,
  type AngleSliderSize,
  type AngleSliderValueChangeDetails,
} from "@moderno-ui/core";

/**
 * `AngleSlider.Root`: Ark's own props (`value` is bindable), plus the
 * Moderno `size` recipe, the snap `marks` and the spoken value. The change
 * callbacks report the settled angle.
 */
export interface ModernoAngleSliderRootProps extends Omit<
  AngleSliderRootProps,
  "onValueChange" | "onValueChangeEnd"
> {
  /** Dial diameter, field height and type — resolves to `data-size` on the root part. */
  size?: AngleSliderSize;
  /** The snap marks, in degrees: Shift while dragging pulls the angle to the nearest one. */
  marks?: number[];
  /** What a screen reader says for an angle. Defaults to `"45 degrees"`. */
  getAriaValueText?: (value: number) => string;
  /** Called while the angle changes. */
  onValueChange?: (details: AngleSliderValueChangeDetails) => void;
  /** Called once a change ends: the pointer lets go, or a key sets the angle. */
  onValueChangeEnd?: (details: AngleSliderValueChangeDetails) => void;
}

/** `AngleSlider.Input`: the angle field's own `<input>`. */
export type AngleSliderInputProps = HTMLInputAttributes;

/** What the Root tells the Moderno parts: the Ark API does not carry these. */
export interface AngleSliderSettings {
  readonly size?: AngleSliderSize;
  readonly step: number;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly invalid?: boolean;
  getAriaValueText: (value: number) => string;
  onValueChangeEnd?: (details: AngleSliderValueChangeDetails) => void;
}

const SETTINGS = Symbol("ModernoAngleSliderSettings");

/** The Root hands its settings to the parts inside it. */
export function setAngleSliderSettings(settings: AngleSliderSettings): void {
  setContext(SETTINGS, settings);
}

/** A part reads the nearest Root's settings, or the defaults outside one. */
export function getAngleSliderSettings(): AngleSliderSettings {
  return (
    getContext<AngleSliderSettings | undefined>(SETTINGS) ?? {
      step: 1,
      getAriaValueText: angleSliderValueText,
    }
  );
}
