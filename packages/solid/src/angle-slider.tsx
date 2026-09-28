import {
  createContext,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
  splitProps,
  useContext,
  type JSX,
} from "solid-js";
import {
  AngleSlider as ArkAngleSlider,
  NumberInput as ArkNumberInput,
  useAngleSliderContext,
} from "@ark-ui/solid";
import type {
  AngleSliderRootProps,
  AngleSliderThumbProps,
  NumberInputValueChangeDetails,
} from "@ark-ui/solid";
import {
  ANGLE_SLIDER_SHIFT_EVENTS,
  angleFromInput,
  angleSliderChangeDetails,
  angleSliderInputFormat,
  angleSliderPageValue,
  angleSliderRecipe,
  angleSliderValueText,
  createShiftTracker,
  isAngleOutsideTurn,
  numberInputRecipe,
  resolveAngle,
  wrapAngle,
  type AngleSliderSize,
  type AngleSliderValueChangeDetails,
} from "@moderno-ui/core";

export type { AngleSliderSize, AngleSliderValueChangeDetails } from "@moderno-ui/core";

export type ModernoAngleSliderRootProps = Omit<
  AngleSliderRootProps,
  "onValueChange" | "onValueChangeEnd"
> & {
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
};

/** Props of `AngleSlider.Input`: the angle field's own `<input>`. */
export type AngleSliderInputProps = JSX.InputHTMLAttributes<HTMLInputElement>;

/** What the Root tells the Moderno parts: the Ark API does not carry these. */
interface AngleSliderSettings {
  readonly size?: AngleSliderSize;
  readonly step: number;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly invalid?: boolean;
  getAriaValueText: (value: number) => string;
  onValueChangeEnd?: (details: AngleSliderValueChangeDetails) => void;
}

const AngleSliderSettingsContext = createContext<AngleSliderSettings>({
  step: 1,
  getAriaValueText: angleSliderValueText,
});

/** Whether Shift is held during the current pointer press, for snapping to the marks. */
function createShiftWhilePressed(): () => boolean {
  const tracker = createShiftTracker();
  onMount(() => {
    for (const type of ANGLE_SLIDER_SHIFT_EVENTS) {
      document.addEventListener(type, tracker.track, true);
    }
  });
  onCleanup(() => {
    if (typeof document === "undefined") return;
    for (const type of ANGLE_SLIDER_SHIFT_EVENTS) {
      document.removeEventListener(type, tracker.track, true);
    }
  });
  return tracker.isHeld;
}

/**
 * AngleSlider.Root with the Moderno `size` recipe folded in, and the angle
 * held here rather than in Ark: every value Ark reports is wrapped into one
 * turn (a drag past 360° carries on from 0°) and, while Shift is held during
 * a press, pulled to the nearest of `marks`, before the consumer sees it. Ark
 * is always given the settled angle back.
 */
function AngleSliderRoot(props: ModernoAngleSliderRootProps) {
  const [local, rest] = splitProps(props, [
    "size",
    "step",
    "marks",
    "value",
    "defaultValue",
    "disabled",
    "readOnly",
    "invalid",
    "getAriaValueText",
    "onValueChange",
    "onValueChangeEnd",
  ]);
  const [uncontrolled, setUncontrolled] = createSignal(wrapAngle(local.defaultValue ?? 0));
  const angle = () => (local.value === undefined ? uncontrolled() : wrapAngle(local.value));
  const step = () => local.step ?? 1;
  const isShiftHeld = createShiftWhilePressed();

  function settle(details: { value: number }) {
    const next = resolveAngle(details.value, { marks: local.marks, snapToMarks: isShiftHeld() });
    if (next === angle()) return;
    if (local.value === undefined) setUncontrolled(next);
    local.onValueChange?.(angleSliderChangeDetails(next));
  }

  const settings: AngleSliderSettings = {
    get size() {
      return local.size;
    },
    get step() {
      return step();
    },
    get disabled() {
      return local.disabled;
    },
    get readOnly() {
      return local.readOnly;
    },
    get invalid() {
      return local.invalid;
    },
    getAriaValueText: (value) => (local.getAriaValueText ?? angleSliderValueText)(value),
    onValueChangeEnd: (details) => local.onValueChangeEnd?.(details),
  };

  return (
    <AngleSliderSettingsContext.Provider value={settings}>
      <ArkAngleSlider.Root
        {...rest}
        {...angleSliderRecipe({ size: local.size })}
        step={step()}
        value={angle()}
        disabled={local.disabled}
        readOnly={local.readOnly}
        invalid={local.invalid}
        onValueChange={settle}
        onValueChangeEnd={(details) =>
          local.onValueChangeEnd?.(angleSliderChangeDetails(details.value))
        }
      />
    </AngleSliderSettingsContext.Provider>
  );
}

/** Page Up turns the dial forward, Page Down back. */
const PAGE_KEYS: Record<string, 1 | -1> = { PageUp: 1, PageDown: -1 };

/**
 * AngleSlider.Thumb, Ark's slider handle, with two additions made through
 * the Ark API: `aria-valuetext` says the angle in degrees, and Page Up / Page
 * Down turn it by 15° (Ark's machine handles the arrows, Home and End only).
 */
function AngleSliderThumb(props: AngleSliderThumbProps) {
  const [local, rest] = splitProps(props, ["onKeyDown"]);
  const angleSlider = useAngleSliderContext();
  const settings = useContext(AngleSliderSettingsContext);

  const handleKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (event) => {
    if (typeof local.onKeyDown === "function") local.onKeyDown(event);
    const direction = PAGE_KEYS[event.key];
    if (event.defaultPrevented || !direction || settings.disabled || settings.readOnly) return;
    event.preventDefault();
    const next = angleSliderPageValue(angleSlider().value, settings.step, direction);
    angleSlider().setValue(next);
    settings.onValueChangeEnd?.(angleSliderChangeDetails(next));
  };

  return (
    <ArkAngleSlider.Thumb
      aria-valuetext={settings.getAriaValueText(angleSlider().value)}
      {...rest}
      onKeyDown={handleKeyDown}
    />
  );
}

/**
 * AngleSlider.Input — the angle as a number field with a `°` after it, kept
 * in step with the dial both ways. Moderno's addition to Ark's anatomy: an
 * Ark NumberInput named by the slider's Label. What the user types sets the
 * dial at once, wrapped and snapped to the step; the text itself is left
 * alone while they type (unless it leaves one turn) and settles to the
 * dial's angle when they commit it.
 */
function AngleSliderInput(props: AngleSliderInputProps) {
  const angleSlider = useAngleSliderContext();
  const settings = useContext(AngleSliderSettingsContext);
  const [text, setText] = createSignal(String(angleSlider().value));
  const [textAngle, setTextAngle] = createSignal(angleSlider().value);

  // The dial moved on its own: show its angle.
  createEffect(
    on(
      () => angleSlider().value,
      (value) => {
        if (value === textAngle()) return;
        setText(String(value));
        setTextAngle(value);
      },
      { defer: true },
    ),
  );

  function handleValueChange({ value, valueAsNumber }: NumberInputValueChangeDetails) {
    const next = angleFromInput(valueAsNumber, settings.step);
    setText(next !== undefined && isAngleOutsideTurn(valueAsNumber) ? String(next) : value);
    if (next === undefined) return;
    setTextAngle(next);
    angleSlider().setValue(next);
  }

  function handleValueCommit() {
    setText(String(angleSlider().value));
    setTextAngle(angleSlider().value);
  }

  return (
    <ArkNumberInput.Root
      {...numberInputRecipe({ size: settings.size })}
      value={text()}
      formatOptions={angleSliderInputFormat}
      disabled={settings.disabled}
      readOnly={settings.readOnly}
      invalid={settings.invalid}
      translations={{ valueText: () => settings.getAriaValueText(angleSlider().value) }}
      onValueChange={handleValueChange}
      onValueCommit={handleValueCommit}
    >
      <ArkNumberInput.Control>
        <ArkNumberInput.Input aria-labelledby={angleSlider().getLabelProps().id} {...props} />
      </ArkNumberInput.Control>
    </ArkNumberInput.Root>
  );
}

/**
 * AngleSlider — a round dial to pick an angle from 0° to 359°, with a number
 * field beside it, for a gradient's direction or a rotation. 0° points up
 * and the angle grows clockwise. Ark drives the machine: the `Thumb` is a
 * `role="slider"`, a click or a drag on the `Control` sets the angle in
 * `step`s, the arrow keys step it and Home/End go to 0° and 359°; Ark rotates
 * the thumb and each `Marker` inline. `Root` and `Thumb` are wrapped (the
 * recipe, the wrap past 360°, Shift-snapping to `marks`, the spoken value
 * and Page Up / Page Down); `Input` is Moderno's; every other part is Ark's
 * verbatim. The object is annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const AngleSlider: Omit<typeof ArkAngleSlider, "Root" | "Thumb"> & {
  Root: typeof AngleSliderRoot;
  Thumb: typeof AngleSliderThumb;
  Input: typeof AngleSliderInput;
} = {
  ...ArkAngleSlider,
  Root: AngleSliderRoot,
  Thumb: AngleSliderThumb,
  Input: AngleSliderInput,
};

export type {
  AngleSliderRootProps,
  AngleSliderLabelProps,
  AngleSliderControlProps,
  AngleSliderThumbProps,
  AngleSliderMarkerGroupProps,
  AngleSliderMarkerProps,
  AngleSliderValueTextProps,
  AngleSliderHiddenInputProps,
} from "@ark-ui/solid";
