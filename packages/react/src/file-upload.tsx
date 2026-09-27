import { useRef, useState } from "react";
import { FileUpload as ArkFileUpload, useFieldContext, useFileUploadContext } from "@ark-ui/react";
import type { FileUploadFileChangeDetails, FileUploadRootProps } from "@ark-ui/react";
import {
  FILE_UPLOAD_TRANSLATIONS,
  announce,
  createFileUploadChangeReporter,
  fileUploadAnnouncement,
  fileUploadHint,
  fileUploadRecipe,
  fileUploadRejectionText,
  fileUploadRemoveLabel,
  focusFileUploadDropzone,
  formatFileSize,
  isImageFile,
  partAttrs,
  splitFileName,
  type FileUploadAccept,
  type FileUploadLimits,
  type FileUploadSize,
  type FileUploadTranslations,
} from "@moderno-ui/core";

export type { FileUploadAccept, FileUploadSize, FileUploadTranslations } from "@moderno-ui/core";
export type { FileUploadFileChangeDetails } from "@ark-ui/react";

export interface FileUploadProps extends Omit<
  FileUploadRootProps,
  | "accept"
  | "maxFiles"
  | "maxFileSize"
  | "onFileChange"
  | "disabled"
  | "translations"
  | "ids"
  | "asChild"
  | "children"
> {
  /** The files it takes, as MIME types or extensions, like `image/png` or `.svg`. Any file by default. */
  accept?: FileUploadAccept;
  /** How many files it holds. Default 1: a new file replaces the one there. */
  maxFiles?: number;
  /** The largest file it takes, in bytes. No limit by default. */
  maxFileSize?: number;
  /** Called when the files change, with the accepted files and the rejected ones and why. */
  onFileChange?: (details: FileUploadFileChangeDetails) => void;
  /** Turns the drop zone and the remove buttons off. */
  disabled?: boolean;
  /** The drop zone's title, like "Upload logo". "Drop files here or click to browse" by default. */
  label?: string;
  /** The drop zone's height, padding and type — resolves to `data-size` on the root; `md` by default. */
  size?: FileUploadSize;
  /** The words it shows and announces, in the reader's language. */
  translations?: Partial<FileUploadTranslations>;
}

/** An upload arrow for the drop zone. */
function UploadIcon() {
  return (
    <svg
      {...partAttrs("file-upload", "dropzone-icon")}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5" />
      <path d="M12 3v12" />
    </svg>
  );
}

/** A page glyph for a file that has no thumbnail. */
function FileIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

/** A cross for the remove button. */
function RemoveIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * One file in a list: a thumbnail (an image) or a file glyph, the name,
 * truncated in the middle so the extension shows, the size, the reason a
 * rejected file was turned away, and a remove button named for the file.
 */
function FileUploadRow({
  file,
  error,
  labels,
  locale,
}: {
  file: File;
  error?: string;
  labels: FileUploadTranslations;
  locale: string;
}) {
  const { start, end } = splitFileName(file.name);
  return (
    <ArkFileUpload.Item file={file}>
      <ArkFileUpload.ItemPreview>
        {isImageFile(file) ? <ArkFileUpload.ItemPreviewImage alt="" /> : <FileIcon />}
      </ArkFileUpload.ItemPreview>
      <ArkFileUpload.ItemName title={file.name}>
        <span {...partAttrs("file-upload", "item-name-full")}>{file.name}</span>
        <span {...partAttrs("file-upload", "item-name-start")} aria-hidden="true">
          {start}
        </span>
        <span {...partAttrs("file-upload", "item-name-end")} aria-hidden="true">
          {end}
        </span>
      </ArkFileUpload.ItemName>
      <ArkFileUpload.ItemSizeText>{formatFileSize(file.size, locale)}</ArkFileUpload.ItemSizeText>
      {error ? <span {...partAttrs("file-upload", "item-error")}>{error}</span> : null}
      <ArkFileUpload.ItemDeleteTrigger
        aria-label={fileUploadRemoveLabel(file.name, labels)}
        onClick={(event) => focusFileUploadDropzone(event.currentTarget)}
      >
        <RemoveIcon />
      </ArkFileUpload.ItemDeleteTrigger>
    </ArkFileUpload.Item>
  );
}

/**
 * The two lists, each only while it holds a file: the accepted files, then
 * the rejected ones. Each render keeps `files` on what the lists now hold,
 * so a change can tell what it changed.
 */
function FileUploadLists({
  files,
  labels,
  limits,
  locale,
}: {
  files: { current: FileUploadFileChangeDetails };
  labels: FileUploadTranslations;
  limits: FileUploadLimits;
  locale: string;
}) {
  const { acceptedFiles, rejectedFiles } = useFileUploadContext();
  files.current = { acceptedFiles, rejectedFiles };
  return (
    <>
      {acceptedFiles.length > 0 ? (
        <ArkFileUpload.ItemGroup type="accepted">
          {acceptedFiles.map((file, index) => (
            <FileUploadRow
              key={`${index}:${file.name}`}
              file={file}
              labels={labels}
              locale={locale}
            />
          ))}
        </ArkFileUpload.ItemGroup>
      ) : null}
      {rejectedFiles.length > 0 ? (
        <ArkFileUpload.ItemGroup type="rejected">
          {rejectedFiles.map(({ file, errors }, index) => (
            <FileUploadRow
              key={`${index}:${file.name}`}
              file={file}
              error={fileUploadRejectionText(errors, limits, labels)}
              labels={labels}
              locale={locale}
            />
          ))}
        </ArkFileUpload.ItemGroup>
      ) : null}
    </>
  );
}

/**
 * FileUpload — a drop zone that takes files dragged onto it or picked from
 * the file dialog (click it, or Enter / Space), and the list of the files
 * chosen: a thumbnail for an image, the name and size, and a remove button.
 *
 * Ark's file-upload machine drives it and checks each file against
 * `accept`, `maxFiles` and `maxFileSize`; a file that fails is listed with
 * the reason. The zone writes what it takes ("SVG or PNG, up to 2 MB") and
 * is named with it. Inside a `Field`, the Field's label names the zone and
 * its helper and error text describe it. Each change calls `onFileChange`
 * once, with both lists, and is announced to screen readers. `size` is the
 * recipe's; every other prop goes to Ark's Root.
 */
export function FileUpload({
  label,
  size,
  translations,
  accept,
  maxFiles,
  maxFileSize,
  onFileChange,
  onFileAccept,
  onFileReject,
  ...rest
}: FileUploadProps) {
  const labels = { ...FILE_UPLOAD_TRANSLATIONS, ...translations };
  const field = useFieldContext();
  const locale = rest.locale ?? "en-US";
  const limits: FileUploadLimits = {
    accept,
    maxFiles,
    maxFileSize,
    minFileSize: rest.minFileSize,
    locale,
  };
  const title = label ?? labels.prompt;
  const hint = fileUploadHint(limits, labels);
  const hintId = field && hint ? `${field.ids.control}:hint` : undefined;

  const files = useRef<FileUploadFileChangeDetails>({ acceptedFiles: [], rejectedFiles: [] });
  // The props of the render a change happens in, read once Ark is done.
  const latest = useRef({ onFileChange, labels, limits });
  latest.current = { onFileChange, labels, limits };
  const [reporter] = useState(() =>
    createFileUploadChangeReporter({
      files: () => files.current,
      onChange: (next, previous) => {
        const { onFileChange, labels, limits } = latest.current;
        onFileChange?.(next);
        const announcement = fileUploadAnnouncement(previous, next, limits, labels);
        if (announcement) announce(announcement.message, { politeness: announcement.politeness });
      },
    }),
  );

  return (
    <ArkFileUpload.Root
      {...rest}
      {...fileUploadRecipe({ size })}
      accept={accept}
      maxFiles={maxFiles}
      maxFileSize={maxFileSize}
      onFileAccept={(details) => {
        reporter.accepted(details.files);
        onFileAccept?.(details);
      }}
      onFileReject={(details) => {
        reporter.rejected(details.files);
        onFileReject?.(details);
      }}
    >
      <ArkFileUpload.Dropzone
        aria-label={[title, hint].filter(Boolean).join(", ")}
        aria-labelledby={field ? [field.ids.label, hintId].filter(Boolean).join(" ") : undefined}
        aria-describedby={field?.ariaDescribedby}
      >
        <UploadIcon />
        <span {...partAttrs("file-upload", "dropzone-title")}>{title}</span>
        {hint ? (
          <span {...partAttrs("file-upload", "dropzone-hint")} id={hintId}>
            {hint}
          </span>
        ) : null}
      </ArkFileUpload.Dropzone>
      <ArkFileUpload.HiddenInput />
      <FileUploadLists files={files} labels={labels} limits={limits} locale={locale} />
    </ArkFileUpload.Root>
  );
}
