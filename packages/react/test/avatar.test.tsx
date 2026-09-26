// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { Avatar, type AvatarStatusChangeDetails } from "../src/index.js";

afterEach(cleanup);

describe("Avatar surface (React)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Avatar: ArkAvatar } = await import("@ark-ui/react");
    for (const part of Object.keys(ArkAvatar)) {
      if (part === "Root") continue; // wrapped to inject the recipe
      expect(Avatar[part as keyof typeof Avatar], `Avatar.${part} missing`).toBeDefined();
    }
  });
});

function Demo(props: {
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  onStatusChange?: (details: AvatarStatusChangeDetails) => void;
}) {
  return (
    <Avatar.Root
      size={props.size}
      shape={props.shape}
      onStatusChange={props.onStatusChange}
      className="profile"
    >
      <Avatar.Fallback>AL</Avatar.Fallback>
      <Avatar.Image src="/ada.png" alt="Ada Lovelace" />
    </Avatar.Root>
  );
}

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="avatar"][data-part="${name}"]`)!;

describe("Avatar", () => {
  it("applies the recipe to the root part, defaulting to an md circle", () => {
    render(<Demo size="lg" shape="square" />);
    expect(part("root").getAttribute("data-size")).toBe("lg");
    expect(part("root").getAttribute("data-shape")).toBe("square");

    cleanup();
    render(<Demo />);
    expect(part("root").getAttribute("data-size")).toBe("md");
    expect(part("root").getAttribute("data-shape")).toBe("circle");
  });

  it("forwards native props to Ark's root", () => {
    render(<Demo />);
    expect(part("root").className).toBe("profile");
    expect(part("root").hasAttribute("style")).toBe(false);
  });

  it("shows the initials while the image loads", () => {
    render(<Demo />);
    expect(part("fallback").textContent).toBe("AL");
    expect(part("fallback").getAttribute("data-state")).toBe("visible");
    expect(part("fallback").hidden).toBe(false);
    expect(part("image").getAttribute("data-state")).toBe("hidden");
    expect(part("image").hidden).toBe(true);
  });

  it("swaps to the image once it loads and reports the status", async () => {
    const onStatusChange = vi.fn();
    render(<Demo onStatusChange={onStatusChange} />);

    // Zag settles the transition after the event; `act` flushes it.
    await act(async () => {
      fireEvent.load(part("image"));
    });

    expect(onStatusChange).toHaveBeenCalledWith({ status: "loaded" });
    expect(part("image").getAttribute("data-state")).toBe("visible");
    expect(part("image").hidden).toBe(false);
    expect(part("fallback").getAttribute("data-state")).toBe("hidden");
    expect(part("fallback").hidden).toBe(true);
  });

  it("keeps the initials when the image fails", async () => {
    const onStatusChange = vi.fn();
    render(<Demo onStatusChange={onStatusChange} />);

    await act(async () => {
      fireEvent.error(part("image"));
    });

    expect(onStatusChange).toHaveBeenCalledWith({ status: "error" });
    expect(part("fallback").hidden).toBe(false);
    expect(part("image").hidden).toBe(true);
  });
});
