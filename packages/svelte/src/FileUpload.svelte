<!--
  FileUpload — a drop zone that takes files dragged onto it or picked from
  the file dialog (click it, or Enter / Space), and the list of the files
  chosen: a thumbnail for an image, the name and size, and a remove button.

  Ark's file-upload machine drives it and checks each file against `accept`,
  `maxFiles` and `maxFileSize`; a file that fails is listed with the reason.
  The zone writes what it takes ("SVG or PNG, up to 2 MB") and is named with
  it. Inside a `Field`, the Field's label names the zone and its helper and
  error text describe it; Ark-Svelte's Root does not read the Field, so its
  ids and state are passed here. Each change calls `onFileChange` once, with
  both lists, and is announced to screen readers. `acceptedFiles` is
  bindable. `size` is the recipe's; every other prop goes to Ark's Root.
-->
<script lang="ts">
  import { FileUpload as ArkFileUpload, useFieldContext } from "@ark-ui/svelte";
  import type { FileUploadFileChangeDetails } from "@ark-ui/svelte";
  import {
    FILE_UPLOAD_TRANSLATIONS,
    announce,
    createFileUploadChangeReporter,
    fileUploadAnnouncement,
    fileUploadHint,
    fileUploadRecipe,
    partAttrs,
    type FileUploadLimits,
  } from "@moderno-ui/core";
  import FileUploadLists from "./FileUploadLists.svelte";
  import type { FileUploadProps } from "./file-upload-props.js";

  let {
    acceptedFiles = $bindable(),
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
  }: FileUploadProps = $props();

  const labels = $derived({ ...FILE_UPLOAD_TRANSLATIONS, ...translations });
  const limits: FileUploadLimits = $derived({
    accept,
    maxFiles,
    maxFileSize,
    minFileSize: rest.minFileSize,
    locale: rest.locale ?? "en-US",
  });
  const field = useFieldContext();
  const fieldState = $derived(field?.());
  const title = $derived(label ?? labels.prompt);
  const hint = $derived(fileUploadHint(limits, labels));
  const hintId = $derived(fieldState && hint ? `${fieldState.ids.control}:hint` : undefined);

  let settled: FileUploadFileChangeDetails = { acceptedFiles: [], rejectedFiles: [] };
  const reporter = createFileUploadChangeReporter({
    files: () => settled,
    onChange: (next, previous) => {
      onFileChange?.(next);
      const announcement = fileUploadAnnouncement(previous, next, limits, labels);
      if (announcement) announce(announcement.message, { politeness: announcement.politeness });
    },
  });
</script>

<ArkFileUpload.Root
  {...rest}
  {...fileUploadRecipe({ size })}
  bind:acceptedFiles
  ids={fieldState ? { label: fieldState.ids.label, hiddenInput: fieldState.ids.control } : undefined}
  disabled={rest.disabled ?? fieldState?.disabled}
  invalid={rest.invalid ?? fieldState?.invalid}
  required={rest.required ?? fieldState?.required}
  readOnly={rest.readOnly ?? fieldState?.readOnly}
  {accept}
  {maxFiles}
  {maxFileSize}
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
    aria-labelledby={fieldState
      ? [fieldState.ids.label, hintId].filter(Boolean).join(" ")
      : undefined}
    aria-describedby={fieldState?.ariaDescribedby}
  >
    <svg
      {...partAttrs("file-upload", "dropzone-icon")}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5" />
      <path d="M12 3v12" />
    </svg>
    <span {...partAttrs("file-upload", "dropzone-title")}>{title}</span>
    {#if hint}
      <span {...partAttrs("file-upload", "dropzone-hint")} id={hintId}>{hint}</span>
    {/if}
  </ArkFileUpload.Dropzone>
  <ArkFileUpload.HiddenInput />
  <FileUploadLists onSettle={(files) => (settled = files)} {labels} {limits} />
</ArkFileUpload.Root>
