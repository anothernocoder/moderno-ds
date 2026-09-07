import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/svelte";
import Alert from "./fixtures/AlertFixture.svelte";

afterEach(cleanup);

describe("Alert (Svelte)", () => {
  it("carries scope/part and the recipe defaults", () => {
    render(Alert);
    const root = screen.getByRole("status");
    expect(root.getAttribute("data-scope")).toBe("alert");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("info");
    expect(root.getAttribute("data-size")).toBe("md");
  });

  it("maps variant/size props to data-attributes", () => {
    render(Alert, { props: { variant: "warning", size: "sm" } });
    const root = screen.getByRole("alert");
    expect(root.getAttribute("data-variant")).toBe("warning");
    expect(root.getAttribute("data-size")).toBe("sm");
  });

  it("renders every part of the anatomy under the alert scope", () => {
    const { container } = render(Alert);
    const parts = [...container.querySelectorAll('[data-scope="alert"]')].map((el) =>
      el.getAttribute("data-part"),
    );
    expect(parts).toEqual(["root", "icon", "content", "title", "description", "action"]);
  });

  it("announces urgently only for the urgent statuses", () => {
    const { unmount } = render(Alert, { props: { variant: "error" } });
    expect(screen.getByRole("alert").textContent).toContain("Trial ending");
    unmount();
    render(Alert, { props: { variant: "success" } });
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("lets the consumer override the role", () => {
    render(Alert, { props: { variant: "error", role: "region", ariaLabel: "billing" } });
    expect(screen.getByRole("region", { name: "billing" }).getAttribute("data-variant")).toBe(
      "error",
    );
  });

  it("hides the decorative icon from assistive tech", () => {
    const { container } = render(Alert);
    expect(container.querySelector('[data-part="icon"]')!.getAttribute("aria-hidden")).toBe("true");
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(Alert);
    const root = screen.getByRole("status");
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });
});
