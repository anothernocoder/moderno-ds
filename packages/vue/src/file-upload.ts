import {
  computed,
  defineComponent,
  h,
  type Component,
  type DefineComponent,
  type PropType,
} from "vue";
import { FileUpload as ArkFileUpload, useFieldContext, useFileUpload } from "@ark-ui/vue";
import type {
  FileUploadFileAcceptDetails,
  FileUploadFileChangeDetails,
  FileUploadFileError,
  FileUploadFileRejectDetails,
  FileUploadFileValidateDetails,
} from "@ark-ui/vue";
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
export type { FileUploadFileChangeDetails } from "@ark-ui/vue";

/** FileUpload's public surface: its own props and Ark's file-upload props. */
export interface FileUploadProps {
  /** The files it takes, as MIME types or extensions, like `image/png` or `.svg`. Any file by default. */
  accept?: FileUploadAccept;
  /** How many files it holds. Default 1: a new file replaces the one there. */
  maxFiles?: number;
  /** The largest file it takes, in bytes. No limit by default. */
  maxFileSize?: number;
  /** The smallest file it takes, in bytes. */
  minFileSize?: number;
  /** The accepted files, to control the list; bind it with `v-model:accepted-files`. */
  acceptedFiles?: File[];
  /** The files it starts with when uncontrolled. */
  defaultAcceptedFiles?: File[];
  /** Turns the drop zone and the remove buttons off. */
  disabled?: boolean;
  /** Shows the files but the user cannot change them. */
  readOnly?: boolean;
  /** Marks the upload as wrong: the zone's edge turns `--destructive`. */
  invalid?: boolean;
  /** A file is needed to submit the form. */
  required?: boolean;
  /** Submits the files with a form under this name. */
  name?: string;
  /** A BCP 47 tag for sizes and lists of types; `en-US` by default. */
  locale?: string;
  /** Your own check: return the reasons a file is turned away, or null. */
  validate?: (file: File, details: FileUploadFileValidateDetails) => FileUploadFileError[] | null;
  /** The drop zone's title, like "Upload logo". "Drop files here or click to browse" by default. */
  label?: string;
  /** The drop zone's height, padding and type — resolves to `data-size` on the root; `md` by default. */
  size?: FileUploadSize;
  /** The words it shows and announces, in the reader's language. */
  translations?: Partial<FileUploadTranslations>;
  onFileChange?: (details: FileUploadFileChangeDetails) => void;
  onFileAccept?: (details: FileUploadFileAcceptDetails) => void;
  onFileReject?: (details: FileUploadFileRejectDetails) => void;
  "onUpdate:acceptedFiles"?: (files: File[]) => void;
}

// Ark's parts re-typed as plain Components, so each merged bag isn't checked
// against their full prop unions (only data-*, aria-* and a few props are added).
const Ark = ArkFileUpload as unknown as Record<keyof typeof ArkFileUpload, Component>;

const svgAttrs = {
  "aria-hidden": "true",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
};

/** An upload arrow for the drop zone. */
const uploadIcon = () =>
  h("svg", { ...partAttrs("file-upload", "dropzone-icon"), ...svgAttrs }, [
    h("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
    h("path", { d: "m17 8-5-5-5 5" }),
    h("path", { d: "M12 3v12" }),
  ]);

/** A page glyph for a file that has no thumbnail. */
const fileIcon = () =>
  h("svg", svgAttrs, [
    h("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
    h("path", { d: "M14 2v6h6" }),
  ]);

/** A cross for the remove button. */
const removeIcon = () =>
  h("svg", svgAttrs, [h("path", { d: "M18 6 6 18" }), h("path", { d: "m6 6 12 12" })]);

/**
 * One file in a list: a thumbnail (an image) or a file glyph, the name,
 * truncated in the middle so the extension shows, the size, the reason a
 * rejected file was turned away, and a remove button named for the file.
 */
function fileRow(file: File, labels: FileUploadTranslations, locale: string, error?: string) {
  const { start, end } = splitFileName(file.name);
  return h(Ark.Item, { file }, () => [
    h(Ark.ItemPreview, () =>
      isImageFile(file) ? h(Ark.ItemPreviewImage, { alt: "" }) : fileIcon(),
    ),
    h(Ark.ItemName, { title: file.name }, () => [
      h("span", partAttrs("file-upload", "item-name-full"), file.name),
      h("span", { ...partAttrs("file-upload", "item-name-start"), "aria-hidden": "true" }, start),
      h("span", { ...partAttrs("file-upload", "item-name-end"), "aria-hidden": "true" }, end),
    ]),
    h(Ark.ItemSizeText, () => formatFileSize(file.size, locale)),
    error ? h("span", partAttrs("file-upload", "item-error"), error) : null,
    h(
      Ark.ItemDeleteTrigger,
      {
        "aria-label": fileUploadRemoveLabel(file.name, labels),
        onClick: (event: MouseEvent) => focusFileUploadDropzone(event.currentTarget as Element),
      },
      removeIcon,
    ),
  ]);
}

/**
 * FileUpload — a drop zone that takes files dragged onto it or picked from
 * the file dialog (click it, or Enter / Space), and the list of the files
 * chosen: a thumbnail for an image, the name and size, and a remove button.
 *
 * Ark's file-upload machine drives it and checks each file against
 * `accept`, `max-files` and `max-file-size`; a file that fails is listed
 * with the reason. The zone writes what it takes ("SVG or PNG, up to 2 MB")
 * and is named with it. Inside a `Field`, the Field's label names the zone
 * and its helper and error text describe it. Each change emits
 * `file-change` once, with both lists, and is announced to screen readers.
 * Built with `useFileUpload` + RootProvider, because Ark-Vue's Root takes no
 * `acceptedFiles`; the list binds with `v-model:accepted-files`. `size` is
 * the recipe's; other attributes go to the root element.
 */
const FileUploadImpl = defineComponent({
  name: "ModernoFileUpload",
  inheritAttrs: false,
  props: {
    accept: {
      type: [String, Array, Object] as PropType<FileUploadAccept>,
      default: undefined,
    },
    maxFiles: { type: Number, default: undefined },
    maxFileSize: { type: Number, default: undefined },
    minFileSize: { type: Number, default: undefined },
    acceptedFiles: { type: Array as PropType<File[]>, default: undefined },
    defaultAcceptedFiles: { type: Array as PropType<File[]>, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    name: { type: String, default: undefined },
    locale: { type: String, default: undefined },
    validate: {
      type: Function as PropType<FileUploadProps["validate"]>,
      default: undefined,
    },
    label: { type: String, default: undefined },
    size: { type: String as PropType<FileUploadSize>, default: undefined },
    translations: {
      type: Object as PropType<Partial<FileUploadTranslations>>,
      default: undefined,
    },
  },
  emits: {
    "update:acceptedFiles": (files: File[]) => Array.isArray(files),
    fileChange: (details: FileUploadFileChangeDetails) => Array.isArray(details.acceptedFiles),
    fileAccept: (details: FileUploadFileAcceptDetails) => Array.isArray(details.files),
    fileReject: (details: FileUploadFileRejectDetails) => Array.isArray(details.files),
  },
  setup(props, { attrs, emit }) {
    const field = useFieldContext();
    const labels = computed(() => ({ ...FILE_UPLOAD_TRANSLATIONS, ...props.translations }));
    const limits = computed<FileUploadLimits>(() => ({
      accept: props.accept,
      maxFiles: props.maxFiles,
      maxFileSize: props.maxFileSize,
      minFileSize: props.minFileSize,
      locale: props.locale ?? "en-US",
    }));

    // What the lists held at the last render: a change reads them before Ark
    // updates its context, so it can tell what it changed.
    let rendered: FileUploadFileChangeDetails = { acceptedFiles: [], rejectedFiles: [] };
    const reporter = createFileUploadChangeReporter({
      files: () => rendered,
      onChange: (next, previous) => {
        emit("update:acceptedFiles", next.acceptedFiles);
        emit("fileChange", next);
        const announcement = fileUploadAnnouncement(previous, next, limits.value, labels.value);
        if (announcement) announce(announcement.message, { politeness: announcement.politeness });
      },
    });

    const fileUpload = useFileUpload(
      computed(() => ({
        accept: props.accept,
        maxFiles: props.maxFiles,
        maxFileSize: props.maxFileSize,
        minFileSize: props.minFileSize,
        acceptedFiles: props.acceptedFiles,
        defaultAcceptedFiles: props.defaultAcceptedFiles,
        disabled: props.disabled,
        readOnly: props.readOnly,
        invalid: props.invalid,
        required: props.required,
        name: props.name,
        locale: props.locale,
        validate: props.validate,
        onFileAccept: (details: FileUploadFileAcceptDetails) => {
          reporter.accepted(details.files);
          emit("fileAccept", details);
        },
        onFileReject: (details: FileUploadFileRejectDetails) => {
          reporter.rejected(details.files);
          emit("fileReject", details);
        },
      })),
    );

    return () => {
      const fieldState = field?.value;
      const { acceptedFiles, rejectedFiles } = fileUpload.value;
      rendered = { acceptedFiles, rejectedFiles };
      const locale = limits.value.locale ?? "en-US";
      const title = props.label ?? labels.value.prompt;
      const hint = fileUploadHint(limits.value, labels.value);
      const hintId = fieldState && hint ? `${fieldState.ids.control}:hint` : undefined;
      return h(
        Ark.RootProvider,
        { ...attrs, ...fileUploadRecipe({ size: props.size }), value: fileUpload.value },
        () => [
          h(
            Ark.Dropzone,
            {
              "aria-label": [title, hint].filter(Boolean).join(", "),
              "aria-labelledby": fieldState
                ? [fieldState.ids.label, hintId].filter(Boolean).join(" ")
                : undefined,
              "aria-describedby": fieldState?.ariaDescribedby,
            },
            () => [
              uploadIcon(),
              h("span", partAttrs("file-upload", "dropzone-title"), title),
              hint
                ? h("span", { ...partAttrs("file-upload", "dropzone-hint"), id: hintId }, hint)
                : null,
            ],
          ),
          h(Ark.HiddenInput),
          acceptedFiles.length > 0
            ? h(Ark.ItemGroup, { type: "accepted" }, () =>
                acceptedFiles.map((file) => fileRow(file, labels.value, locale)),
              )
            : null,
          rejectedFiles.length > 0
            ? h(Ark.ItemGroup, { type: "rejected" }, () =>
                rejectedFiles.map(({ file, errors }) =>
                  fileRow(
                    file,
                    labels.value,
                    locale,
                    fileUploadRejectionText(errors, limits.value, labels.value),
                  ),
                ),
              )
            : null,
        ],
      );
    };
  },
});

/**
 * Annotated so the emitted `.d.ts` names `FileUploadProps` instead of
 * inlining Ark's types from an internal `@zag-js` path (TS2742).
 */
export const FileUpload = FileUploadImpl as unknown as DefineComponent<FileUploadProps>;
