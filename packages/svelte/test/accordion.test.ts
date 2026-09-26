import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { Accordion } from "../src/index.js";
import Demo from "./fixtures/AccordionFixture.svelte";

afterEach(cleanup);

describe("Accordion surface (Svelte)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Accordion: ArkAccordion } = await import("@ark-ui/svelte");
    for (const part of Object.keys(ArkAccordion)) {
      if (part === "Root") continue; // wrapped below
      expect(Accordion[part as keyof typeof Accordion], `Accordion.${part} missing`).toBeDefined();
    }
  });
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="accordion"][data-part="${name}"]`)!;
const parts = <T extends HTMLElement = HTMLElement>(name: string) =>
  Array.from(document.querySelectorAll<T>(`[data-scope="accordion"][data-part="${name}"]`));
const triggers = () => parts<HTMLButtonElement>("item-trigger");
const openContents = () =>
  parts("item-content")
    .filter((content) => !content.hidden)
    .map((content) => content.textContent);

describe("Accordion", () => {
  it("applies the recipe to the root part, defaulting to line md", () => {
    render(Demo, { props: { variant: "enclosed" as const, size: "sm" as const } });
    expect(part("root").getAttribute("data-variant")).toBe("enclosed");
    expect(part("root").getAttribute("data-size")).toBe("sm");
    // Ark's own anatomy is intact around the recipe attributes.
    expect(part("item").contains(part("item-trigger"))).toBe(true);
    expect(part("item-trigger").contains(part("item-indicator"))).toBe(true);

    cleanup();
    render(Demo);
    expect(part("root").getAttribute("data-variant")).toBe("line");
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native props to Ark's root", () => {
    render(Demo);
    expect(part("root").className).toBe("faq");
  });

  it("gives each item a native button trigger that labels its region", () => {
    render(Demo);
    // The indicator is aria-hidden, so it adds nothing to the accessible name.
    const shipping = screen.getByRole("button", { name: "Shipping" }) as HTMLButtonElement;
    expect(shipping.tagName).toBe("BUTTON");
    expect(shipping.type).toBe("button");
    expect(shipping.getAttribute("aria-expanded")).toBe("true");
    expect(shipping.getAttribute("data-state")).toBe("open");
    expect(triggers()[1]!.getAttribute("aria-expanded")).toBe("false");
    expect(parts("item").map((item) => item.getAttribute("data-state"))).toEqual([
      "open",
      "closed",
      "closed",
      "closed",
    ]);

    const region = screen.getByRole("region", { name: "Shipping" });
    expect(region.textContent).toBe("Shipping answer");
    expect(shipping.getAttribute("aria-controls")).toBe(region.id);
    expect(openContents()).toEqual(["Shipping answer"]);
  });

  it("opens one item at a time on click and reports the new value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { onValueChange } });

    await user.click(triggers()[1]!);

    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: ["returns"] }));
    expect(triggers()[1]!.getAttribute("aria-expanded")).toBe("true");
    expect(triggers()[0]!.getAttribute("aria-expanded")).toBe("false");
    await waitFor(() => expect(openContents()).toEqual(["Returns answer"]));
  });

  it("keeps several items open with multiple", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { multiple: true } });

    await user.click(triggers()[1]!);

    await waitFor(() => expect(openContents()).toEqual(["Shipping answer", "Returns answer"]));
  });

  it("closes the open item only when collapsible", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.click(triggers()[0]!);
    expect(triggers()[0]!.getAttribute("aria-expanded")).toBe("true");

    cleanup();
    render(Demo, { props: { collapsible: true } });
    await user.click(triggers()[0]!);
    expect(triggers()[0]!.getAttribute("aria-expanded")).toBe("false");
    await waitFor(() => expect(openContents()).toEqual([]));
  });

  it("moves focus between triggers with the arrow keys, skipping a disabled item", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.tab();
    expect(document.activeElement).toBe(triggers()[0]);

    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement).toBe(triggers()[1]));
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement).toBe(triggers()[3]));
    await user.keyboard("{Home}");
    await waitFor(() => expect(document.activeElement).toBe(triggers()[0]));
    await user.keyboard("{End}");
    await waitFor(() => expect(document.activeElement).toBe(triggers()[3]));
  });

  it("marks a disabled item natively and with data-disabled, and refuses to open it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { onValueChange } });
    const warranty = triggers()[2]!;

    expect(warranty.disabled).toBe(true);
    expect(parts("item")[2]!.hasAttribute("data-disabled")).toBe(true);

    await user.click(warranty);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(warranty.getAttribute("aria-expanded")).toBe("false");
  });
});
