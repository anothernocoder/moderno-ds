import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/vue";
import { defineComponent, h, type PropType } from "vue";
import { Avatar, type AvatarShape, type AvatarSize } from "../src/index.js";

afterEach(cleanup);

describe("Avatar surface (Vue)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Avatar: ArkAvatar } = await import("@ark-ui/vue");
    for (const part of Object.keys(ArkAvatar)) {
      if (part === "Root") continue; // wrapped to inject the recipe
      expect(Avatar[part as keyof typeof Avatar], `Avatar.${part} missing`).toBeDefined();
    }
  });
});

const Demo = defineComponent({
  props: {
    size: { type: String as PropType<AvatarSize>, default: undefined },
    shape: { type: String as PropType<AvatarShape>, default: undefined },
    onStatusChange: { type: Function, default: undefined },
  },
  setup(props) {
    return () =>
      h(
        Avatar.Root,
        {
          size: props.size,
          shape: props.shape,
          class: "profile",
          onStatusChange: props.onStatusChange as (() => void) | undefined,
        },
        () => [
          h(Avatar.Fallback, {}, () => "AL"),
          h(Avatar.Image, { src: "/ada.png", alt: "Ada Lovelace" }),
        ],
      );
  },
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="avatar"][data-part="${name}"]`)!;

describe("Avatar (Vue)", () => {
  it("applies the recipe to the root part, defaulting to an md circle", () => {
    render(Demo, { props: { size: "lg", shape: "square" } });
    expect(part("root").getAttribute("data-size")).toBe("lg");
    expect(part("root").getAttribute("data-shape")).toBe("square");

    cleanup();
    render(Demo);
    expect(part("root").getAttribute("data-size")).toBe("md");
    expect(part("root").getAttribute("data-shape")).toBe("circle");
  });

  it("forwards native attributes to Ark's root", () => {
    render(Demo);
    expect(part("root").className).toBe("profile");
    expect(part("root").hasAttribute("style")).toBe(false);
  });

  it("shows the initials while the image loads", () => {
    render(Demo);
    expect(part("fallback").textContent).toBe("AL");
    expect(part("fallback").getAttribute("data-state")).toBe("visible");
    expect(part("fallback").hidden).toBe(false);
    expect(part("image").getAttribute("data-state")).toBe("hidden");
    expect(part("image").hidden).toBe(true);
  });

  it("swaps to the image once it loads and reports the status", async () => {
    const onStatusChange = vi.fn();
    render(Demo, { props: { onStatusChange } });

    await fireEvent.load(part("image"));

    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith({ status: "loaded" }));
    await waitFor(() => expect(part("image").hidden).toBe(false));
    expect(part("image").getAttribute("data-state")).toBe("visible");
    expect(part("fallback").getAttribute("data-state")).toBe("hidden");
    expect(part("fallback").hidden).toBe(true);
  });

  it("keeps the initials when the image fails", async () => {
    const onStatusChange = vi.fn();
    render(Demo, { props: { onStatusChange } });

    await fireEvent.error(part("image"));

    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith({ status: "error" }));
    expect(part("fallback").hidden).toBe(false);
    expect(part("image").hidden).toBe(true);
  });
});
