import { cva, type VariantProps } from "../cva.js";
import type { AnnouncePoliteness } from "../announce.js";

/**
 * FileUpload: `size` on the root — the drop zone's height, padding, icon
 * and type; the file list keeps one density. `accept`, `maxFiles`,
 * `maxFileSize` and the files are props of the component; dragging,
 * disabled and invalid surface as Ark's own `data-*`.
 */
export const fileUploadRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** FileUpload's density: the drop zone's height, padding, icon and type. */
export type FileUploadSize = NonNullable<VariantProps<typeof fileUploadRecipe.variants>["size"]>;

/**
 * The files a FileUpload accepts, as Ark takes them: a comma-separated
 * string (`"image/png,.svg"`), a list (`["image/png", ".svg"]`) or a map of
 * MIME types to extensions (`{ "font/otf": [".otf"] }`).
 */
export type FileUploadAccept = string | string[] | Record<string, string[]>;

/** A file that was not added, with the codes of every rule it broke. */
export interface FileUploadRejection {
  file: File;
  /** Ark's codes (`FILE_INVALID_TYPE`, `FILE_TOO_LARGE`, …) or a `validate` message. */
  errors: readonly string[];
}

/** The two lists a FileUpload holds: the files it took and the ones it turned away. */
export interface FileUploadFiles {
  acceptedFiles: readonly File[];
  rejectedFiles: readonly FileUploadRejection[];
}

/** The limits a FileUpload checks each file against, and the locale it writes them in. */
export interface FileUploadLimits {
  accept?: FileUploadAccept;
  maxFiles?: number;
  maxFileSize?: number;
  minFileSize?: number;
  /** A BCP 47 tag for sizes and lists ("SVG or PNG"); `en-US` by default. */
  locale?: string;
}

/**
 * The words a FileUpload shows and announces, in the reader's language.
 * `{name}`, `{count}`, `{size}`, `{type}` and `{reason}` are filled in.
 */
export interface FileUploadTranslations {
  /** The drop zone's title when no `label` is given. */
  prompt: string;
  /** In the hint: the largest file allowed. */
  maxFileSize: string;
  /** In the hint: how many files it takes, when more than one. */
  maxFiles: string;
  /** In the hint, for `image/*`. */
  images: string;
  /** In the hint, for `video/*`. */
  videos: string;
  /** In the hint, for `audio/*`. */
  audio: string;
  /** In the hint, for `font/*`. */
  fonts: string;
  /** In the hint, for any other `{type}/*`. */
  anyOfType: string;
  /** Names each remove button. */
  remove: string;
  /** Why a file was not added: its type is not in `accept`. */
  invalidType: string;
  /** Why a file was not added: it is over `maxFileSize`. */
  tooLarge: string;
  /** Why a file was not added: it is under `minFileSize`. */
  tooSmall: string;
  /** Why a file was not added: it would pass `maxFiles`. */
  tooMany: string;
  /** Why a file was not added: the same file is already in the list. */
  exists: string;
  /** Why a file was not added: the browser could not read it. */
  invalid: string;
  /** Announced when one file is added. */
  added: string;
  /** Announced when several files are added at once. */
  addedMany: string;
  /** Announced when one file is removed. */
  removed: string;
  /** Announced when several files are removed at once. */
  removedMany: string;
  /** Announced for each file that was not added. */
  rejected: string;
}

/** The English words; a `translations` prop overrides any of them. */
export const FILE_UPLOAD_TRANSLATIONS: FileUploadTranslations = {
  prompt: "Drop files here or click to browse",
  maxFileSize: "up to {size}",
  maxFiles: "up to {count} files",
  images: "images",
  videos: "videos",
  audio: "audio",
  fonts: "fonts",
  anyOfType: "{type} files",
  remove: "Remove {name}",
  invalidType: "This file type is not accepted.",
  tooLarge: "Larger than {size}.",
  tooSmall: "Smaller than {size}.",
  tooMany: "Too many files. The limit is {count}.",
  exists: "Already added.",
  invalid: "This file cannot be read.",
  added: "{name} added.",
  addedMany: "{count} files added.",
  removed: "{name} removed.",
  removedMany: "{count} files removed.",
  rejected: "{name} not added. {reason}",
};

/** `template` with each `{key}` replaced by its value. */
function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** `text` with its first letter in upper case, as a sentence starts. */
function capitalize(text: string, locale: string): string {
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

const BYTE_UNITS = ["kilobyte", "megabyte", "gigabyte", "terabyte"] as const;

/**
 * A file size as a person reads it, in decimal units: `512 B`, `340 kB`,
 * `2 MB`, `1.25 GB`. Three significant digits at most, written for `locale`.
 */
export function formatFileSize(bytes: number, locale = "en-US"): string {
  let value = Math.max(0, bytes);
  // Intl writes a lone byte as "byte"; "B" is what every file manager shows.
  if (value < 1000) return `${new Intl.NumberFormat(locale).format(Math.round(value))} B`;
  let unit = 0;
  value /= 1000;
  // Compare the rounded value, so 999,999 bytes reads "1 MB", not "1,000 kB".
  while (Number(value.toPrecision(3)) >= 1000 && unit < BYTE_UNITS.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: BYTE_UNITS[unit],
    unitDisplay: "short",
    maximumFractionDigits: 2,
  }).format(Number(value.toPrecision(3)));
}

/** Each type `accept` names, one entry per MIME type or extension. */
function acceptEntries(accept: FileUploadAccept | undefined): string[] {
  if (accept === undefined) return [];
  if (typeof accept === "string") return accept.split(",");
  if (Array.isArray(accept)) return accept;
  return Object.entries(accept).flatMap(([type, extensions]) =>
    extensions.length > 0 ? extensions : [type],
  );
}

/**
 * One accepted type as a person names it: `.woff2` → "WOFF2",
 * `image/svg+xml` → "SVG", `image/*` → "images".
 */
function typeName(entry: string, labels: FileUploadTranslations): string {
  if (entry.startsWith(".")) return entry.slice(1).toUpperCase();
  const [group = "", subtype = ""] = entry.split("/");
  if (subtype === "*") {
    const groups: Record<string, string> = {
      image: labels.images,
      video: labels.videos,
      audio: labels.audio,
      font: labels.fonts,
    };
    return groups[group] ?? fill(labels.anyOfType, { type: group });
  }
  const name = subtype.split("+")[0]!.split(".").pop()!;
  return name.replace(/^x-/, "").toUpperCase();
}

/**
 * The types `accept` names, as one list a person reads: "SVG or PNG",
 * "OTF, TTF, or WOFF2". Empty when any file is accepted.
 */
export function fileUploadTypesText(
  accept: FileUploadAccept | undefined,
  labels: FileUploadTranslations = FILE_UPLOAD_TRANSLATIONS,
  locale = "en-US",
): string {
  const names = acceptEntries(accept)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => typeName(entry, labels));
  const unique = [...new Set(names)];
  if (unique.length === 0) return "";
  return new Intl.ListFormat(locale, { type: "disjunction" }).format(unique);
}

/**
 * What the drop zone writes under its title and adds to its accessible
 * name: the types it accepts, the largest file and how many files, e.g.
 * "SVG or PNG, up to 2 MB". Empty when it has no limits.
 */
export function fileUploadHint(
  { accept, maxFiles = 1, maxFileSize, locale = "en-US" }: FileUploadLimits,
  labels: FileUploadTranslations = FILE_UPLOAD_TRANSLATIONS,
): string {
  const parts = [
    fileUploadTypesText(accept, labels, locale),
    maxFileSize !== undefined && Number.isFinite(maxFileSize)
      ? fill(labels.maxFileSize, { size: formatFileSize(maxFileSize, locale) })
      : "",
    maxFiles > 1 && Number.isFinite(maxFiles) ? fill(labels.maxFiles, { count: maxFiles }) : "",
  ].filter(Boolean);
  return parts.length === 0 ? "" : capitalize(parts.join(", "), locale);
}

/**
 * Why a file was not added, one sentence per rule it broke: "Larger than
 * 2 MB." A code Ark does not know is a message from `validate`, shown as it is.
 */
export function fileUploadRejectionText(
  errors: readonly string[],
  { maxFiles = 1, maxFileSize, minFileSize, locale = "en-US" }: FileUploadLimits = {},
  labels: FileUploadTranslations = FILE_UPLOAD_TRANSLATIONS,
): string {
  const size = (bytes: number | undefined) => formatFileSize(bytes ?? 0, locale);
  const messages: Record<string, string> = {
    FILE_INVALID_TYPE: labels.invalidType,
    FILE_TOO_LARGE: fill(labels.tooLarge, { size: size(maxFileSize) }),
    FILE_TOO_SMALL: fill(labels.tooSmall, { size: size(minFileSize) }),
    TOO_MANY_FILES: fill(labels.tooMany, { count: maxFiles }),
    FILE_EXISTS: labels.exists,
    FILE_INVALID: labels.invalid,
  };
  return [...new Set(errors)].map((code) => messages[code] ?? code).join(" ");
}

/** What a screen reader hears after the lists change, and how urgently. */
export interface FileUploadAnnouncement {
  message: string;
  politeness: AnnouncePoliteness;
}

/**
 * What to announce when a FileUpload's lists go from `previous` to `next`:
 * the files added, the files removed and every file turned away with its
 * reason, as one message (a new message replaces the one before it in the
 * live region). A turned-away file counts as removed only when nothing
 * arrived, so a new pick that replaces old rejections says what it added.
 * Assertive when a file was turned away; null when nothing changed.
 */
export function fileUploadAnnouncement(
  previous: FileUploadFiles,
  next: FileUploadFiles,
  limits: FileUploadLimits = {},
  labels: FileUploadTranslations = FILE_UPLOAD_TRANSLATIONS,
): FileUploadAnnouncement | null {
  const had = new Set(previous.acceptedFiles);
  const has = new Set(next.acceptedFiles);
  const hadRejected = new Set(previous.rejectedFiles.map(({ file }) => file));
  const hasRejected = new Set(next.rejectedFiles.map(({ file }) => file));

  const added = next.acceptedFiles.filter((file) => !had.has(file));
  const rejected = next.rejectedFiles.filter(({ file }) => !hadRejected.has(file));
  const dismissed =
    added.length === 0 && rejected.length === 0
      ? previous.rejectedFiles.filter(({ file }) => !hasRejected.has(file)).map(({ file }) => file)
      : [];
  const removed = [...previous.acceptedFiles.filter((file) => !has.has(file)), ...dismissed];

  const count = (files: readonly File[], one: string, many: string) => {
    if (files.length === 0) return "";
    if (files.length === 1) return fill(one, { name: files[0]!.name });
    return fill(many, { count: files.length });
  };
  const message = [
    count(added, labels.added, labels.addedMany),
    count(removed, labels.removed, labels.removedMany),
    ...rejected.map(({ file, errors }) =>
      fill(labels.rejected, {
        name: file.name,
        reason: fileUploadRejectionText(errors, limits, labels),
      }),
    ),
  ]
    .filter(Boolean)
    .join(" ");
  if (!message) return null;
  return { message, politeness: rejected.length > 0 ? "assertive" : "polite" };
}

/** Takes Ark's reports of one list changing; see `createFileUploadChangeReporter`. */
export interface FileUploadChangeReporter<Files extends FileUploadFiles> {
  /** Ark's `onFileAccept`: the accepted list is now `files`. */
  accepted(files: Files["acceptedFiles"]): void;
  /** Ark's `onFileReject`: the rejected list is now `rejections`. */
  rejected(rejections: Files["rejectedFiles"]): void;
}

/**
 * Gathers Ark's reports of a change into one. Ark reports the accepted and
 * the rejected list separately, one after the other, while a pick or a drop
 * is handled — and its own `onFileChange` pairs each with the other list as
 * it was before, so the first of the two calls is stale. The reporter takes
 * both, then calls `onChange` once, after Ark is done, with both lists as
 * they now are and as they were. `files` reads the lists as they are, so a
 * list a change leaves alone keeps its current value.
 */
export function createFileUploadChangeReporter<Files extends FileUploadFiles>({
  files,
  onChange,
}: {
  files: () => Files;
  onChange: (next: Files, previous: Files) => void;
}): FileUploadChangeReporter<Files> {
  let pending: { previous: Files; next: Files } | null = null;

  function update(patch: Partial<FileUploadFiles>) {
    if (!pending) {
      const previous = files();
      const change = { previous, next: { ...previous } };
      pending = change;
      queueMicrotask(() => {
        pending = null;
        onChange(change.next, change.previous);
      });
    }
    Object.assign(pending.next, patch);
  }

  return {
    accepted: (acceptedFiles) => update({ acceptedFiles }),
    rejected: (rejectedFiles) => update({ rejectedFiles }),
  };
}

/** The name of a file's remove button: "Remove logo.svg". */
export function fileUploadRemoveLabel(
  name: string,
  labels: FileUploadTranslations = FILE_UPLOAD_TRANSLATIONS,
): string {
  return fill(labels.remove, { name });
}

/**
 * Moves focus from a remove button to its FileUpload's drop zone. Call it
 * as the button is pressed: the row, and the button with it, is about to
 * go, and focus would otherwise fall back to the page.
 */
export function focusFileUploadDropzone(removeButton: Element): void {
  const root = removeButton.closest('[data-scope="file-upload"][data-part="root"]');
  root?.querySelector<HTMLElement>('[data-scope="file-upload"][data-part="dropzone"]')?.focus();
}

/** Whether the list shows a file as a thumbnail: any `image/*`. */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/** How many characters of a name, before its extension, stay beside the extension. */
const NAME_TAIL = 5;

/**
 * A file name cut in two for truncating in the middle: `start` gives way to
 * an ellipsis when the row is narrow, `end` (the extension and the few
 * characters before it) always shows. "brand-logo-final.svg" →
 * "brand-logo-" + "final.svg".
 */
export function splitFileName(name: string): { start: string; end: string } {
  const dot = name.lastIndexOf(".");
  const extension = dot > 0 ? name.slice(dot) : "";
  const tail = Math.min(name.length, extension.length + NAME_TAIL);
  return { start: name.slice(0, name.length - tail), end: name.slice(name.length - tail) };
}
