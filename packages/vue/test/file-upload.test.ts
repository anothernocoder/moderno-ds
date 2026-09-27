import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref } from "vue";
import { FileUpload, Field } from "../src/index.js";

const LOGO_TYPES = ["image/svg+xml", "image/png"];

const file = (name: string, type: string, size = 1000) =>
  new File([new Uint8Array(size)], name, { type });

const zone = () => document.querySelector<HTMLElement>('[data-part="dropzone"]')!;
const hiddenInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;
const rows = (type = "accepted") =>
  [...document.querySelectorAll(`[data-part="item"][data-type="${type}"]`)] as HTMLElement[];
const names = (type = "accepted") =>
  rows(type).map((row) => row.querySelector('[data-part="item-name-full"]')?.textContent);
const liveRegion = () => document.querySelector<HTMLElement>("[data-live-announcer]");

/** The text of the elements an element's aria-describedby points at, in order. */
const description = (element: HTMLElement) =>
  (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .map((id) => document.getElementById(id)?.textContent)
    .join(" ");

/** A drag of `files` from the desktop, as the browser hands it to the drop zone. */
const dataTransfer = (files: File[]) => ({
  types: ["Files"],
  files,
  items: files.map((dragged) => ({
    kind: "file",
    type: dragged.type,
    getAsFile: () => dragged,
    webkitGetAsEntry: () => ({ isFile: true, isDirectory: false }),
  })),
  dropEffect: "none",
});

async function pick(files: File[]) {
  const user = userEvent.setup({ applyAccept: false });
  await user.upload(hiddenInput(), files);
  return user;
}

beforeEach(() => {
  // jsdom has no object URLs; the thumbnails need one.
  URL.createObjectURL = vi.fn((blob: Blob) => `blob:${(blob as File).name}`);
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("FileUpload (Vue)", () => {
  it("puts the recipe's size and native attributes on the root, md by default", async () => {
    const { container, rerender } = render(FileUpload, { attrs: { class: "brand" } });
    const root = () => container.querySelector('[data-scope="file-upload"][data-part="root"]')!;
    expect(root().getAttribute("data-size")).toBe("md");
    expect(root().classList.contains("brand")).toBe(true);
    await rerender({ size: "lg" });
    expect(root().getAttribute("data-size")).toBe("lg");
  });

  it("makes the zone a focusable button named for what it takes", () => {
    render(FileUpload, {
      props: { label: "Upload logo", accept: LOGO_TYPES, maxFileSize: 2_000_000 },
    });
    expect(screen.getByRole("button", { name: "Upload logo, SVG or PNG, up to 2 MB" })).toBe(
      zone(),
    );
    expect(zone().tabIndex).toBe(0);
    expect(zone().querySelector('[data-part="dropzone-title"]')?.textContent).toBe("Upload logo");
    expect(zone().querySelector('[data-part="dropzone-hint"]')?.textContent).toBe(
      "SVG or PNG, up to 2 MB",
    );
  });

  it("says how to add files when it has no label or limits", () => {
    render(FileUpload);
    expect(zone().getAttribute("aria-label")).toBe("Drop files here or click to browse");
    expect(zone().querySelector('[data-part="dropzone-hint"]')).toBeNull();
  });

  it("opens the file dialog on click, Enter and Space", async () => {
    render(FileUpload);
    const click = vi.spyOn(hiddenInput(), "click");
    const user = userEvent.setup();
    await user.click(zone());
    await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
    zone().focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(click).toHaveBeenCalledTimes(2));
    await user.keyboard(" ");
    await waitFor(() => expect(click).toHaveBeenCalledTimes(3));
  });

  it("lists a picked file with its thumbnail, name, size and remove button", async () => {
    render(FileUpload, { props: { accept: LOGO_TYPES } });
    await pick([file("logo.png", "image/png", 2400)]);
    await waitFor(() => expect(names()).toEqual(["logo.png"]));
    const row = rows()[0]!;
    await waitFor(() =>
      expect(row.querySelector("img")?.getAttribute("src")).toBe("blob:logo.png"),
    );
    expect(row.querySelector("img")?.getAttribute("alt")).toBe("");
    expect(row.querySelector('[data-part="item-size-text"]')?.textContent).toBe("2.4 kB");
    expect(screen.getByRole("button", { name: "Remove logo.png" })).toBeTruthy();
  });

  it("shows a file glyph for a file that is not an image", async () => {
    render(FileUpload);
    await pick([file("Inter.woff2", "font/woff2")]);
    await waitFor(() => expect(rows()).toHaveLength(1));
    const preview = rows()[0]!.querySelector('[data-part="item-preview"]')!;
    expect(preview.querySelector("img")).toBeNull();
    expect(preview.querySelector("svg")).not.toBeNull();
  });

  it("takes files dropped on the zone, and changes look while they are over it", async () => {
    render(FileUpload, { props: { maxFiles: 3 } });
    const files = [file("a.svg", "image/svg+xml"), file("b.png", "image/png")];
    await fireEvent.dragOver(zone(), { dataTransfer: dataTransfer(files) });
    await waitFor(() => expect(zone().hasAttribute("data-dragging")).toBe(true));
    await fireEvent.dragLeave(zone(), { dataTransfer: dataTransfer(files) });
    await waitFor(() => expect(zone().hasAttribute("data-dragging")).toBe(false));
    await fireEvent.dragOver(zone(), { dataTransfer: dataTransfer(files) });
    await fireEvent.drop(zone(), { dataTransfer: dataTransfer(files) });
    await waitFor(() => expect(names()).toEqual(["a.svg", "b.png"]));
    expect(zone().hasAttribute("data-dragging")).toBe(false);
  });

  it("lists a file of the wrong type with the reason", async () => {
    render(FileUpload, { props: { accept: LOGO_TYPES } });
    await pick([file("anim.gif", "image/gif")]);
    await waitFor(() => expect(names("rejected")).toEqual(["anim.gif"]));
    expect(names()).toEqual([]);
    expect(rows("rejected")[0]!.querySelector('[data-part="item-error"]')?.textContent).toBe(
      "This file type is not accepted.",
    );
  });

  it("turns away a file over maxFileSize and files past maxFiles", async () => {
    render(FileUpload, { props: { maxFileSize: 2_000_000, maxFiles: 2 } });
    await pick([file("huge.png", "image/png", 3_000_000)]);
    await waitFor(() => expect(rows("rejected")).toHaveLength(1));
    expect(rows("rejected")[0]!.querySelector('[data-part="item-error"]')?.textContent).toBe(
      "Larger than 2 MB.",
    );
    cleanup();
    render(FileUpload, { props: { maxFiles: 2 } });
    await pick([
      file("a.png", "image/png"),
      file("b.png", "image/png"),
      file("c.png", "image/png"),
    ]);
    await waitFor(() => expect(names("rejected")).toEqual(["a.png", "b.png", "c.png"]));
    expect(names()).toEqual([]);
    expect(rows("rejected")[0]!.querySelector('[data-part="item-error"]')?.textContent).toBe(
      "Too many files. The limit is 2.",
    );
  });

  it("replaces the file when it holds one", async () => {
    render(FileUpload);
    await pick([file("a.png", "image/png")]);
    await pick([file("b.png", "image/png")]);
    await waitFor(() => expect(names()).toEqual(["b.png"]));
  });

  it("emits file-change once per change, with the accepted and the rejected files", async () => {
    const { emitted } = render(FileUpload, { props: { accept: LOGO_TYPES, maxFiles: 3 } });
    const logo = file("logo.svg", "image/svg+xml");
    const gif = file("anim.gif", "image/gif");
    await pick([logo, gif]);
    await waitFor(() => expect(emitted().fileChange).toHaveLength(1));
    expect(emitted().fileChange![0]).toEqual([
      { acceptedFiles: [logo], rejectedFiles: [{ file: gif, errors: ["FILE_INVALID_TYPE"] }] },
    ]);
    expect(emitted()["update:acceptedFiles"]![0]).toEqual([[logo]]);
  });

  it("removes a file with its button and moves focus to the zone", async () => {
    render(FileUpload, { props: { maxFiles: 3 } });
    const user = await pick([file("a.png", "image/png"), file("b.png", "image/png")]);
    await user.click(await screen.findByRole("button", { name: "Remove a.png" }));
    await waitFor(() => expect(names()).toEqual(["b.png"]));
    expect(document.activeElement).toBe(zone());
  });

  it("announces added, removed and rejected files", async () => {
    render(FileUpload, { props: { accept: LOGO_TYPES, maxFiles: 3 } });
    const user = await pick([file("logo.svg", "image/svg+xml")]);
    await waitFor(() => expect(liveRegion()?.textContent).toBe("logo.svg added."));
    expect(liveRegion()?.getAttribute("aria-live")).toBe("polite");

    await pick([file("anim.gif", "image/gif")]);
    await waitFor(() =>
      expect(liveRegion()?.textContent).toBe("anim.gif not added. This file type is not accepted."),
    );
    expect(liveRegion()?.getAttribute("aria-live")).toBe("assertive");

    await user.click(screen.getByRole("button", { name: "Remove logo.svg" }));
    await waitFor(() => expect(liveRegion()?.textContent).toBe("logo.svg removed."));
  });

  it("keeps the extension of a long name visible", async () => {
    render(FileUpload);
    await pick([file("moderno-brand-logo-primary-final.svg", "image/svg+xml")]);
    await waitFor(() => expect(rows()).toHaveLength(1));
    const name = rows()[0]!.querySelector('[data-part="item-name"]')!;
    expect(name.getAttribute("title")).toBe("moderno-brand-logo-primary-final.svg");
    expect(name.querySelector('[data-part="item-name-start"]')?.textContent).toBe(
      "moderno-brand-logo-primary-",
    );
    expect(name.querySelector('[data-part="item-name-end"]')?.textContent).toBe("final.svg");
  });

  it("does nothing while disabled", async () => {
    const { container } = render(FileUpload, { props: { disabled: true } });
    const click = vi.spyOn(hiddenInput(), "click");
    expect(container.querySelector('[data-part="root"]')!.hasAttribute("data-disabled")).toBe(true);
    expect(zone().getAttribute("aria-disabled")).toBe("true");
    expect(zone().hasAttribute("tabindex")).toBe(false);
    await fireEvent.click(zone());
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(click).not.toHaveBeenCalled();
  });

  it("takes its name, description, invalid and disabled state from a Field", async () => {
    const InField = defineComponent({
      props: { invalid: Boolean, disabled: Boolean },
      setup(props) {
        return () =>
          h(Field.Root, { invalid: props.invalid, disabled: props.disabled }, () => [
            h(Field.Label, () => "Logo"),
            h(FileUpload, { accept: LOGO_TYPES }),
            h(Field.HelperText, () => "Square works best."),
            h(Field.ErrorText, () => "Add a logo."),
          ]);
      },
    });
    const { rerender } = render(InField, { props: { invalid: true } });
    const dropzone = await screen.findByRole("button", { name: "Logo SVG or PNG" });
    expect(description(dropzone)).toBe("Add a logo. Square works best.");
    expect(dropzone.hasAttribute("data-invalid")).toBe(true);
    expect(screen.getByText("Logo").getAttribute("for")).toBe(hiddenInput().id);

    await rerender({ invalid: false, disabled: true });
    await waitFor(() => expect(zone().getAttribute("aria-disabled")).toBe("true"));
  });

  it("follows v-model:accepted-files", async () => {
    const Bound = defineComponent({
      setup() {
        const files = ref<File[]>([]);
        return () => [
          h(FileUpload, {
            maxFiles: 3,
            acceptedFiles: files.value,
            "onUpdate:acceptedFiles": (next: File[]) => (files.value = [...next]),
          }),
          h("button", { type: "button", onClick: () => (files.value = []) }, "Clear"),
        ];
      },
    });
    render(Bound);
    const user = await pick([file("a.png", "image/png")]);
    await pick([file("b.png", "image/png")]);
    await waitFor(() => expect(names()).toEqual(["a.png", "b.png"]));
    await user.click(screen.getByRole("button", { name: "Clear" }));
    await waitFor(() => expect(names()).toEqual([]));
  });

  it("speaks the reader's language through translations", async () => {
    render(FileUpload, {
      props: {
        maxFileSize: 1_000_000,
        translations: {
          prompt: "Suelta archivos aquí",
          maxFileSize: "hasta {size}",
          remove: "Quitar {name}",
        },
      },
    });
    expect(zone().getAttribute("aria-label")).toBe("Suelta archivos aquí, Hasta 1 MB");
    await pick([file("a.png", "image/png")]);
    expect(await screen.findByRole("button", { name: "Quitar a.png" })).toBeTruthy();
  });
});
