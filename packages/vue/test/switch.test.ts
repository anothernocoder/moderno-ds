import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, type PropType } from "vue";
import { Switch, type SwitchSize } from "../src/index.js";

afterEach(cleanup);

describe("Switch surface (Vue)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Switch: ArkSwitch } = await import("@ark-ui/vue");
    for (const part of Object.keys(ArkSwitch)) {
      if (part === "Root" || part === "HiddenInput") continue; // wrapped below
      expect(Switch[part as keyof typeof Switch], `Switch.${part} missing`).toBeDefined();
    }
  });
});

const Demo = defineComponent({
  props: {
    size: { type: String as PropType<SwitchSize>, default: undefined },
    disabled: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
    defaultChecked: { type: Boolean, default: false },
    inputRole: { type: String, default: undefined },
    onCheckedChange: { type: Function, default: undefined },
  },
  setup(props) {
    return () =>
      h(
        Switch.Root,
        {
          size: props.size,
          disabled: props.disabled,
          invalid: props.invalid,
          defaultChecked: props.defaultChecked,
          class: "setting",
          onCheckedChange: props.onCheckedChange as (() => void) | undefined,
        },
        () => [
          h(Switch.Control, {}, () => h(Switch.Thumb)),
          h(Switch.Label, {}, () => "Airplane mode"),
          h(Switch.HiddenInput, { role: props.inputRole }),
        ],
      );
  },
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="switch"][data-part="${name}"]`)!;
const input = () => screen.getByRole("switch") as HTMLInputElement;

describe("Switch (Vue)", () => {
  it("applies the size recipe to the root part, defaulting to md", () => {
    render(Demo, { props: { size: "lg" } });
    expect(part("root").getAttribute("data-size")).toBe("lg");
    expect(part("control")).not.toBeNull();
    expect(part("thumb")).not.toBeNull();
    expect(part("label")).not.toBeNull();

    cleanup();
    render(Demo);
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native attributes to Ark's root", () => {
    render(Demo);
    expect(part("root").className).toBe("setting");
    expect(part("root").hasAttribute("style")).toBe(false);
  });

  it("binds the label to a hidden native input announced as a switch", () => {
    render(Demo);
    expect(input().type).toBe("checkbox");
    expect(part("root").getAttribute("for")).toBe(input().id);
    expect(input().checked).toBe(false);
    expect(part("control").getAttribute("data-state")).toBe("unchecked");
    expect(part("thumb").getAttribute("data-state")).toBe("unchecked");
  });

  it("keeps a consumer role on the hidden input", () => {
    render(Demo, { props: { inputRole: "checkbox" } });
    expect(screen.getByRole("checkbox")).toBeTruthy();
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("turns on when clicked and reports the new state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(Demo, { props: { onCheckedChange } });

    await user.click(screen.getByText("Airplane mode"));

    expect(onCheckedChange).toHaveBeenCalledWith({ checked: true });
    expect(part("control").getAttribute("data-state")).toBe("checked");
    expect(part("thumb").getAttribute("data-state")).toBe("checked");
    expect(input().checked).toBe(true);
  });

  it("puts keyboard focus on the hidden input", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.tab();
    expect(document.activeElement).toBe(input());
  });

  it("marks disabled with data-disabled and refuses to toggle", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(Demo, { props: { disabled: true, onCheckedChange } });

    expect(part("root").hasAttribute("data-disabled")).toBe(true);
    expect(input().disabled).toBe(true);

    await user.click(screen.getByText("Airplane mode"));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(part("control").getAttribute("data-state")).toBe("unchecked");
  });

  it("marks invalid on the track and the input", () => {
    render(Demo, { props: { invalid: true } });
    expect(part("control").hasAttribute("data-invalid")).toBe(true);
    expect(input().getAttribute("aria-invalid")).toBe("true");
  });
});
