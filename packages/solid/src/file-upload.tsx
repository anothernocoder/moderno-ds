import { For, Show, createEffect, on, splitProps, untrack } from "solid-js";
import { FileUpload as ArkFileUpload, useFieldContext, useFileUploadContext } from "@ark-ui/solid";
import type { FileUploadFileChangeDetails, FileUploadRootProps } from "@ark-ui/solid";
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
export type { FileUploadFileChangeDetails } from "@ark-ui/solid";

export type FileUploadProps = Omit<
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
> & {
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
};

const svgAttrs = {
  "aria-hidden": "true" as const,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round" as const,
  "stroke-linejoin": "round" as const,
};

/** An upload arrow for the drop zone. */
function UploadIcon() {
  return (
    <svg {...partAttrs("file-upload", "dropzone-icon")} {...svgAttrs}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5" />
      <path d="M12 3v12" />
    </svg>
  );
}

/** A page glyph for a file that has no thumbnail. */
function FileIcon() {
  return (
    <svg {...svgAttrs}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

/** A cross for the remove button. */
function RemoveIcon() {
  return (
    <svg {...svgAttrs}>
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
function FileUploadRow(props: {
  file: File;
  error?: string;
  labels: FileUploadTranslations;
  locale: string;
}) {
  const name = () => splitFileName(props.file.name);
  return (
    <ArkFileUpload.Item file={props.file}>
      <ArkFileUpload.ItemPreview>
        <Show when={isImageFile(props.file)} fallback={<FileIcon />}>
          <ArkFileUpload.ItemPreviewImage alt="" />
        </Show>
      </ArkFileUpload.ItemPreview>
      <ArkFileUpload.ItemName title={props.file.name}>
        <span {...partAttrs("file-upload", "item-name-full")}>{props.file.name}</span>
        <span {...partAttrs("file-upload", "item-name-start")} aria-hidden="true">
          {name().start}
        </span>
        <span {...partAttrs("file-upload", "item-name-end")} aria-hidden="true">
          {name().end}
        </span>
      </ArkFileUpload.ItemName>
      <ArkFileUpload.ItemSizeText>
        {formatFileSize(props.file.size, props.locale)}
      </ArkFileUpload.ItemSizeText>
      <Show when={props.error}>
        <span {...partAttrs("file-upload", "item-error")}>{props.error}</span>
      </Show>
      <ArkFileUpload.ItemDeleteTrigger
        aria-label={fileUploadRemoveLabel(props.file.name, props.labels)}
        onClick={(event) => focusFileUploadDropzone(event.currentTarget)}
      >
        <RemoveIcon />
      </ArkFileUpload.ItemDeleteTrigger>
    </ArkFileUpload.Item>
  );
}

/**
 * The two lists, each only while it holds a file: the accepted files, then
 * the rejected ones. `onSettle` hears what the lists hold after each change.
 */
function FileUploadLists(props: {
  onSettle: (files: FileUploadFileChangeDetails) => void;
  labels: FileUploadTranslations;
  limits: FileUploadLimits;
}) {
  const fileUpload = useFileUploadContext();
  const files = () => ({
    acceptedFiles: fileUpload().acceptedFiles,
    rejectedFiles: fileUpload().rejectedFiles,
  });
  props.onSettle(untrack(files));
  // Solid updates this before Ark reports the change, so the change would
  // read the lists it made: hand them over once Ark has reported it.
  createEffect(on(files, (next) => queueMicrotask(() => props.onSettle(next)), { defer: true }));
  const locale = () => props.limits.locale ?? "en-US";
  return (
    <>
      <Show when={fileUpload().acceptedFiles.length > 0}>
        <ArkFileUpload.ItemGroup type="accepted">
          <For each={fileUpload().acceptedFiles}>
            {(file) => <FileUploadRow file={file} labels={props.labels} locale={locale()} />}
          </For>
        </ArkFileUpload.ItemGroup>
      </Show>
      <Show when={fileUpload().rejectedFiles.length > 0}>
        <ArkFileUpload.ItemGroup type="rejected">
          <For each={fileUpload().rejectedFiles}>
            {(rejection) => (
              <FileUploadRow
                file={rejection.file}
                error={fileUploadRejectionText(rejection.errors, props.limits, props.labels)}
                labels={props.labels}
                locale={locale()}
              />
            )}
          </For>
        </ArkFileUpload.ItemGroup>
      </Show>
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
export function FileUpload(props: FileUploadProps) {
  const [local, rest] = splitProps(props, [
    "label",
    "size",
    "translations",
    "accept",
    "maxFiles",
    "maxFileSize",
    "onFileChange",
    "onFileAccept",
    "onFileReject",
  ]);
  const labels = () => ({ ...FILE_UPLOAD_TRANSLATIONS, ...local.translations });
  const limits = (): FileUploadLimits => ({
    accept: local.accept,
    maxFiles: local.maxFiles,
    maxFileSize: local.maxFileSize,
    minFileSize: rest.minFileSize,
    locale: rest.locale ?? "en-US",
  });
  const field = useFieldContext();
  const fieldState = () => field?.();
  const title = () => local.label ?? labels().prompt;
  const hint = () => fileUploadHint(limits(), labels());
  const hintId = () => {
    const state = fieldState();
    return state && hint() ? `${state.ids.control}:hint` : undefined;
  };

  let settled: FileUploadFileChangeDetails = { acceptedFiles: [], rejectedFiles: [] };
  const reporter = createFileUploadChangeReporter({
    files: () => settled,
    onChange: (next, previous) => {
      local.onFileChange?.(next);
      const announcement = fileUploadAnnouncement(previous, next, limits(), labels());
      if (announcement) announce(announcement.message, { politeness: announcement.politeness });
    },
  });

  return (
    <ArkFileUpload.Root
      {...rest}
      {...fileUploadRecipe({ size: local.size })}
      accept={local.accept}
      maxFiles={local.maxFiles}
      maxFileSize={local.maxFileSize}
      onFileAccept={(details) => {
        reporter.accepted(details.files);
        local.onFileAccept?.(details);
      }}
      onFileReject={(details) => {
        reporter.rejected(details.files);
        local.onFileReject?.(details);
      }}
    >
      <ArkFileUpload.Dropzone
        aria-label={[title(), hint()].filter(Boolean).join(", ")}
        aria-labelledby={
          fieldState() ? [fieldState()!.ids.label, hintId()].filter(Boolean).join(" ") : undefined
        }
        aria-describedby={fieldState()?.ariaDescribedby}
      >
        <UploadIcon />
        <span {...partAttrs("file-upload", "dropzone-title")}>{title()}</span>
        <Show when={hint()}>
          <span {...partAttrs("file-upload", "dropzone-hint")} id={hintId()}>
            {hint()}
          </span>
        </Show>
      </ArkFileUpload.Dropzone>
      <ArkFileUpload.HiddenInput />
      <FileUploadLists
        onSettle={(files) => (settled = files)}
        labels={labels()}
        limits={limits()}
      />
    </ArkFileUpload.Root>
  );
}
