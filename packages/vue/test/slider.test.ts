import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, type PropType } from "vue";
import { Slider, type SliderSize, type SliderValueChangeDetails } from "../src/index.js";

afterEach(cleanup);

describe("Slider surface (Vue)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Slider: ArkSlider } = await import("@ark-ui/vue");
    for (const part of Object.keys(ArkSlider)) {
      if (part === "Root") continue; // wrapped below
      expect(Slider[part as keyof typeof Slider], `Slider.${part} missing`).toBeDefined();
    }
  });
});

const Demo = defineComponent({
  props: {
    size: { type: String as PropType<SliderSize>, default: undefined },
    value: { type: Array as PropType<number[]>, default: undefined },
    defaultValue: { type: Array as PropType<number[]>, default: undefined },
    disabled: { type: Boolean, default: false },
    onValueChange: {
      type: Function as PropType<(details: SliderValueChangeDetails) => void>,
      default: undefined,
    },
  },
  setup(props) {
    return () => {
      const thumbs = (props.value ?? props.defaultValue ?? [0]).map((_, index) => index);
      return h(
        Slider.Root,
        {
          size: props.size,
          modelValue: props.value,
          defaultValue: props.defaultValue,
          disabled: props.disabled,
          onValueChange: props.onValueChange,
          class: "volume",
        },
        () => [
          h(Slider.Label, {}, () => "Volume"),
          h(Slider.ValueText),
          h(Slider.Control, {}, () => [
            h(Slider.Track, {}, () => h(Slider.Range)),
            ...thumbs.map((index) =>
              h(Slider.Thumb, { key: index, index }, () => h(Slider.HiddenInput)),
            ),
          ]),
          h(Slider.MarkerGroup, {}, () => [
            h(Slider.Marker, { value: 0 }, () => "0"),
            h(Slider.Marker, { value: 50 }, () => "50"),
            h(Slider.Marker, { value: 100 }, () => "100"),
          ]),
        ],
      );
    };
  },
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="slider"][data-part="${name}"]`)!;
/*
 * Ark keeps a thumb `visibility: hidden` until it has measured it, so the
 * thumb stays inside the track at both ends; jsdom never lays anything out,
 * so role queries here include hidden elements.
 */
const sliders = () => screen.getAllByRole("slider", { hidden: true });
const parts = (name: string) => [
  ...document.querySelectorAll<HTMLElement>(`[data-scope="slider"][data-part="${name}"]`),
];

describe("Slider", () => {
  it("applies the recipe to the root part, defaulting to md", () => {
    render(Demo, { props: { size: "lg" as const, defaultValue: [40] } });
    expect(part("root").getAttribute("data-size")).toBe("lg");
    // Ark's own anatomy is intact around the recipe attribute.
    expect(part("control").contains(part("track"))).toBe(true);
    expect(part("track").contains(part("range"))).toBe(true);
    expect(part("control").contains(part("thumb"))).toBe(true);

    cleanup();
    render(Demo, { props: { defaultValue: [40] } });
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native attributes to Ark's root", () => {
    render(Demo, { props: { defaultValue: [40] } });
    expect(part("root").className).toBe("volume");
  });

  it("makes the thumb a slider named by the label, and fills the range to it", () => {
    render(Demo, { props: { defaultValue: [40] } });
    const [thumb] = sliders();
    expect(thumb).toBe(part("thumb"));
    expect(thumb!.getAttribute("aria-labelledby")).toBe(part("label").id);
    expect(part("label").textContent).toBe("Volume");
    expect(thumb!.getAttribute("aria-valuenow")).toBe("40");
    expect(thumb!.getAttribute("aria-valuemin")).toBe("0");
    expect(thumb!.getAttribute("aria-valuemax")).toBe("100");
    expect(part("value-text").textContent).toBe("40");
    expect(part("root").style.getPropertyValue("--slider-range-start")).toBe("0%");
    expect(part("root").style.getPropertyValue("--slider-range-end")).toBe("60%");
    // The thumb carries the value into a form through Ark's hidden input.
    expect(thumb!.querySelector<HTMLInputElement>("input[hidden]")!.value).toBe("40");
  });

  it("holds a range between two thumbs", () => {
    render(Demo, { props: { defaultValue: [20, 80] } });
    const thumbs = sliders();
    expect(thumbs.map((t) => t.getAttribute("aria-valuenow"))).toEqual(["20", "80"]);
    // Each thumb stops at the other: the first cannot pass 80, the second 20.
    expect(thumbs.map((t) => t.getAttribute("aria-valuemax"))).toEqual(["80", "100"]);
    expect(thumbs.map((t) => t.getAttribute("aria-valuemin"))).toEqual(["0", "20"]);
    expect(part("value-text").textContent).toBe("20, 80");
    expect(part("root").style.getPropertyValue("--slider-range-start")).toBe("20%");
    expect(part("root").style.getPropertyValue("--slider-range-end")).toBe("20%");
  });

  it("marks each marker under, at or over the value", () => {
    render(Demo, { props: { defaultValue: [50] } });
    expect(parts("marker").map((m) => m.getAttribute("data-state"))).toEqual([
      "under-value",
      "at-value",
      "over-value",
    ]);
    expect(parts("marker").map((m) => m.getAttribute("data-value"))).toEqual(["0", "50", "100"]);
    expect(part("marker-group").getAttribute("aria-hidden")).toBe("true");
  });

  it("steps the value with the arrow keys and reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { defaultValue: [40], onValueChange } });
    await user.tab();
    expect(document.activeElement).toBe(part("thumb"));

    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(part("thumb").getAttribute("aria-valuenow")).toBe("41"));
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: [41] }));
    await user.keyboard("{End}");
    await waitFor(() => expect(part("thumb").getAttribute("aria-valuenow")).toBe("100"));
  });

  it("follows a controlled value", async () => {
    const { rerender } = render(Demo, { props: { value: [30] } });
    await rerender({ value: [70] });
    expect(part("thumb").getAttribute("aria-valuenow")).toBe("70");
    expect(part("value-text").textContent).toBe("70");
  });

  it("disables every part and takes the thumb out of the tab order", () => {
    render(Demo, { props: { defaultValue: [40], disabled: true } });
    for (const name of ["root", "label", "control", "track", "range", "thumb"]) {
      expect(part(name).hasAttribute("data-disabled"), name).toBe(true);
    }
    expect(part("thumb").getAttribute("aria-disabled")).toBe("true");
    expect(part("thumb").hasAttribute("tabindex")).toBe(false);
  });
});
