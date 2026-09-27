// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  FILE_UPLOAD_TRANSLATIONS,
  createFileUploadChangeReporter,
  fileUploadRemoveLabel,
  focusFileUploadDropzone,
  fileUploadAnnouncement,
  fileUploadHint,
  fileUploadRecipe,
  fileUploadRejectionText,
  fileUploadTypesText,
  formatFileSize,
  isImageFile,
  splitFileName,
  type FileUploadFiles,
} from "../../src/recipes/file-upload.js";

const file = (name: string, type = "", size = 10) => new File(["x".repeat(size)], name, { type });

describe("fileUploadRecipe", () => {
  it("defaults to size md", () => {
    expect(fileUploadRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(fileUploadRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
    expect(fileUploadRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for what the props and Ark already own", () => {
    // accept and the limits change what renders; dragging, invalid and disabled are Ark's data-*.
    expect(Object.keys(fileUploadRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a file upload size
    expect(() => fileUploadRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});

describe("formatFileSize", () => {
  it("writes sizes in decimal units, three significant digits at most", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(340_000)).toBe("340 kB");
    expect(formatFileSize(2_000_000)).toBe("2 MB");
    expect(formatFileSize(1_234_567)).toBe("1.23 MB");
    expect(formatFileSize(1_250_000_000)).toBe("1.25 GB");
    expect(formatFileSize(999_999)).toBe("1 MB");
  });

  it("writes them for the locale", () => {
    expect(formatFileSize(1_500_000, "es")).toBe("1,5 MB");
  });
});

describe("fileUploadTypesText", () => {
  it("names MIME types and extensions as a person reads them", () => {
    expect(fileUploadTypesText(["image/svg+xml", "image/png"])).toBe("SVG or PNG");
    expect(fileUploadTypesText(".otf,.ttf, .woff2")).toBe("OTF, TTF, or WOFF2");
    expect(fileUploadTypesText("application/pdf")).toBe("PDF");
  });

  it("names a whole group of types", () => {
    expect(fileUploadTypesText("image/*")).toBe("images");
    expect(fileUploadTypesText(["font/*", "text/*"])).toBe("fonts or text files");
  });

  it("uses a map's extensions, or its type when it lists none", () => {
    expect(fileUploadTypesText({ "image/jpeg": [".jpg", ".jpeg"], "image/png": [] })).toBe(
      "JPG, JPEG, or PNG",
    );
  });

  it("names each type once", () => {
    expect(fileUploadTypesText(["image/png", ".png"])).toBe("PNG");
  });

  it("is empty when any file is accepted", () => {
    expect(fileUploadTypesText(undefined)).toBe("");
    expect(fileUploadTypesText("")).toBe("");
  });

  it("joins the list in the locale's words", () => {
    expect(
      fileUploadTypesText(["image/svg+xml", "image/png"], FILE_UPLOAD_TRANSLATIONS, "es"),
    ).toBe("SVG o PNG");
  });
});

describe("fileUploadHint", () => {
  it("writes the types, the largest file and how many files", () => {
    expect(fileUploadHint({ accept: ["image/svg+xml", "image/png"], maxFileSize: 2_000_000 })).toBe(
      "SVG or PNG, up to 2 MB",
    );
    expect(fileUploadHint({ accept: "image/*", maxFiles: 3 })).toBe("Images, up to 3 files");
  });

  it("starts with a capital when it has no types", () => {
    expect(fileUploadHint({ maxFileSize: 5_000_000 })).toBe("Up to 5 MB");
  });

  it("leaves out one file and an unlimited size", () => {
    expect(fileUploadHint({ maxFiles: 1, maxFileSize: Infinity })).toBe("");
  });

  it("takes the words from translations", () => {
    const labels = { ...FILE_UPLOAD_TRANSLATIONS, maxFileSize: "hasta {size}" };
    expect(fileUploadHint({ maxFileSize: 2_000_000, locale: "es" }, labels)).toBe("Hasta 2 MB");
  });
});

describe("fileUploadRejectionText", () => {
  it("gives one sentence per rule the file broke", () => {
    expect(
      fileUploadRejectionText(["FILE_INVALID_TYPE", "FILE_TOO_LARGE"], { maxFileSize: 2_000_000 }),
    ).toBe("This file type is not accepted. Larger than 2 MB.");
    expect(fileUploadRejectionText(["TOO_MANY_FILES"], { maxFiles: 3 })).toBe(
      "Too many files. The limit is 3.",
    );
    expect(fileUploadRejectionText(["FILE_EXISTS"])).toBe("Already added.");
    expect(fileUploadRejectionText(["FILE_TOO_SMALL"], { minFileSize: 1000 })).toBe(
      "Smaller than 1 kB.",
    );
  });

  it("shows a validate message as it is", () => {
    expect(fileUploadRejectionText(["The logo must be square."])).toBe("The logo must be square.");
  });
});

describe("fileUploadAnnouncement", () => {
  const logo = file("logo.svg", "image/svg+xml");
  const icon = file("icon.png", "image/png");
  const gif = file("anim.gif", "image/gif");
  const empty: FileUploadFiles = { acceptedFiles: [], rejectedFiles: [] };

  it("says nothing when nothing changed", () => {
    expect(fileUploadAnnouncement(empty, { acceptedFiles: [], rejectedFiles: [] })).toBeNull();
  });

  it("names one added file and counts several", () => {
    expect(fileUploadAnnouncement(empty, { acceptedFiles: [logo], rejectedFiles: [] })).toEqual({
      message: "logo.svg added.",
      politeness: "polite",
    });
    expect(
      fileUploadAnnouncement(empty, { acceptedFiles: [logo, icon], rejectedFiles: [] })?.message,
    ).toBe("2 files added.");
  });

  it("names a removed file", () => {
    expect(
      fileUploadAnnouncement(
        { acceptedFiles: [logo, icon], rejectedFiles: [] },
        { acceptedFiles: [icon], rejectedFiles: [] },
      )?.message,
    ).toBe("logo.svg removed.");
  });

  it("says why a file was turned away, assertively", () => {
    const next = {
      acceptedFiles: [logo],
      rejectedFiles: [{ file: gif, errors: ["FILE_INVALID_TYPE"] }],
    };
    expect(fileUploadAnnouncement(empty, next)).toEqual({
      message: "logo.svg added. anim.gif not added. This file type is not accepted.",
      politeness: "assertive",
    });
  });

  it("counts a dismissed rejection as removed only when nothing arrived", () => {
    const withRejection = {
      acceptedFiles: [],
      rejectedFiles: [{ file: gif, errors: ["FILE_INVALID_TYPE"] }],
    };
    expect(fileUploadAnnouncement(withRejection, empty)?.message).toBe("anim.gif removed.");
    // A new pick replaces the old rejections: only what it added is news.
    expect(
      fileUploadAnnouncement(withRejection, { acceptedFiles: [logo], rejectedFiles: [] })?.message,
    ).toBe("logo.svg added.");
  });

  it("says a replaced file is gone when only one is allowed", () => {
    expect(
      fileUploadAnnouncement(
        { acceptedFiles: [logo], rejectedFiles: [] },
        { acceptedFiles: [icon], rejectedFiles: [] },
      )?.message,
    ).toBe("icon.png added. logo.svg removed.");
  });
});

describe("isImageFile", () => {
  it("is true for any image type", () => {
    expect(isImageFile(file("a.svg", "image/svg+xml"))).toBe(true);
    expect(isImageFile(file("a.otf", "font/otf"))).toBe(false);
    expect(isImageFile(file("a"))).toBe(false);
  });
});

describe("splitFileName", () => {
  it("keeps the extension and a few characters before it at the end", () => {
    expect(splitFileName("brand-logo-final.svg")).toEqual({
      start: "brand-logo-",
      end: "final.svg",
    });
    expect(splitFileName("Inter-Variable.woff2")).toEqual({
      start: "Inter-Var",
      end: "iable.woff2",
    });
  });

  it("keeps a short name whole in the end part", () => {
    expect(splitFileName("a.png")).toEqual({ start: "", end: "a.png" });
  });

  it("keeps a name with no extension, or a dotfile, by its last characters", () => {
    expect(splitFileName("README-long")).toEqual({ start: "README", end: "-long" });
    expect(splitFileName(".env")).toEqual({ start: "", end: ".env" });
  });
});

describe("createFileUploadChangeReporter", () => {
  const logo = file("logo.svg", "image/svg+xml");
  const gif = file("anim.gif", "image/gif");

  it("reports both lists once, after Ark has reported each", async () => {
    const onChange = vi.fn();
    const before: FileUploadFiles = { acceptedFiles: [], rejectedFiles: [] };
    const reporter = createFileUploadChangeReporter({ files: () => before, onChange });
    const rejectedFiles = [{ file: gif, errors: ["FILE_INVALID_TYPE"] }];
    reporter.accepted([logo]);
    reporter.rejected(rejectedFiles);
    expect(onChange).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ acceptedFiles: [logo], rejectedFiles }, before);
  });

  it("keeps the list a change leaves alone as it is", async () => {
    const onChange = vi.fn();
    const rejectedFiles = [{ file: gif, errors: ["FILE_INVALID_TYPE"] }];
    const reporter = createFileUploadChangeReporter({
      files: () => ({ acceptedFiles: [logo], rejectedFiles }),
      onChange,
    });
    reporter.accepted([]);
    await Promise.resolve();
    expect(onChange.mock.lastCall?.[0]).toEqual({ acceptedFiles: [], rejectedFiles });
  });
});

describe("fileUploadRemoveLabel", () => {
  it("names the button for its file", () => {
    expect(fileUploadRemoveLabel("logo.svg")).toBe("Remove logo.svg");
    expect(
      fileUploadRemoveLabel("logo.svg", { ...FILE_UPLOAD_TRANSLATIONS, remove: "Quitar {name}" }),
    ).toBe("Quitar logo.svg");
  });
});

describe("focusFileUploadDropzone", () => {
  it("moves focus to the drop zone of the button's own upload", () => {
    document.body.innerHTML = [
      '<div data-scope="file-upload" data-part="root">',
      '<div data-scope="file-upload" data-part="dropzone" tabindex="0" id="first"></div></div>',
      '<div data-scope="file-upload" data-part="root">',
      '<div data-scope="file-upload" data-part="dropzone" tabindex="0" id="second"></div>',
      '<button data-scope="file-upload" data-part="item-delete-trigger">Remove</button></div>',
    ].join("");
    focusFileUploadDropzone(document.querySelector("button")!);
    expect(document.activeElement?.id).toBe("second");
  });
});
