import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/svelte";
import Callout from "./fixtures/CalloutFixture.svelte";

afterEach(cleanup);

describe("Callout (Svelte)", () => {
  it("is a note carrying scope/part and the recipe default", () => {
    render(Callout);
    const root = screen.getByRole("note");
    expect(root.getAttribute("data-scope")).toBe("callout");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("info");
    expect(root.hasAttribute("data-size")).toBe(false);
  });

  it("maps variant to data-variant and stays a note for every status", () => {
    render(Callout, { props: { variant: "error" } });
    const root = screen.getByRole("note");
    expect(root.getAttribute("data-variant")).toBe("error");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders every part of the anatomy under the callout scope", () => {
    const { container } = render(Callout);
    const parts = [...container.querySelectorAll('[data-scope="callout"]')].map((el) =>
      el.getAttribute("data-part"),
    );
    expect(parts).toEqual(["root", "icon", "content", "title", "description"]);
  });

  it("lets the consumer override the role", () => {
    render(Callout, { props: { variant: "warning", role: "region", ariaLabel: "migration" } });
    expect(screen.getByRole("region", { name: "migration" }).getAttribute("data-variant")).toBe(
      "warning",
    );
  });

  it("hides the decorative icon from assistive tech", () => {
    const { container } = render(Callout);
    expect(container.querySelector('[data-part="icon"]')!.getAttribute("aria-hidden")).toBe("true");
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(Callout);
    const root = screen.getByRole("note");
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });

  it("forwards native attributes to the parts", () => {
    const { container } = render(Callout, { props: { id: "export-note", titleClass: "mine" } });
    expect(container.querySelector("#export-note")!.getAttribute("data-part")).toBe("root");
    expect(container.querySelector('[data-part="title"]')!.className).toBe("mine");
  });
});
