<!--
  FileUpload's two lists, each only while it holds a file: the accepted
  files, then the rejected ones. Each row shows a thumbnail (an image) or a
  file glyph, the name truncated in the middle so the extension shows, the
  size, the reason a rejected file was turned away, and a remove button
  named for the file. `onSettle` hears what the lists hold after each change.
-->
<script lang="ts">
  import { FileUpload as ArkFileUpload, useFileUploadContext } from "@ark-ui/svelte";
  import type { FileUploadFileChangeDetails } from "@ark-ui/svelte";
  import {
    fileUploadRejectionText,
    fileUploadRemoveLabel,
    focusFileUploadDropzone,
    formatFileSize,
    isImageFile,
    partAttrs,
    splitFileName,
    type FileUploadLimits,
    type FileUploadTranslations,
  } from "@moderno-ui/core";

  let {
    onSettle,
    labels,
    limits,
  }: {
    onSettle: (files: FileUploadFileChangeDetails) => void;
    labels: FileUploadTranslations;
    limits: FileUploadLimits;
  } = $props();

  const fileUpload = useFileUploadContext();
  const locale = $derived(limits.locale ?? "en-US");

  // Svelte runs this once Ark has reported the change, so the change reads
  // the lists as they were before it.
  $effect(() => {
    onSettle({
      acceptedFiles: fileUpload().acceptedFiles,
      rejectedFiles: fileUpload().rejectedFiles,
    });
  });
</script>

{#snippet row(file: File, error?: string)}
  {@const name = splitFileName(file.name)}
  <ArkFileUpload.Item {file}>
    <ArkFileUpload.ItemPreview>
      {#if isImageFile(file)}
        <ArkFileUpload.ItemPreviewImage alt="" />
      {:else}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      {/if}
    </ArkFileUpload.ItemPreview>
    <ArkFileUpload.ItemName title={file.name}>
      <span {...partAttrs("file-upload", "item-name-full")}>{file.name}</span>
      <span {...partAttrs("file-upload", "item-name-start")} aria-hidden="true">{name.start}</span>
      <span {...partAttrs("file-upload", "item-name-end")} aria-hidden="true">{name.end}</span>
    </ArkFileUpload.ItemName>
    <ArkFileUpload.ItemSizeText>{formatFileSize(file.size, locale)}</ArkFileUpload.ItemSizeText>
    {#if error}
      <span {...partAttrs("file-upload", "item-error")}>{error}</span>
    {/if}
    <ArkFileUpload.ItemDeleteTrigger
      aria-label={fileUploadRemoveLabel(file.name, labels)}
      onclick={(event: MouseEvent) => focusFileUploadDropzone(event.currentTarget as Element)}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </ArkFileUpload.ItemDeleteTrigger>
  </ArkFileUpload.Item>
{/snippet}

{#if fileUpload().acceptedFiles.length > 0}
  <ArkFileUpload.ItemGroup type="accepted">
    {#each fileUpload().acceptedFiles as file, index (`${index}:${file.name}`)}
      {@render row(file)}
    {/each}
  </ArkFileUpload.ItemGroup>
{/if}
{#if fileUpload().rejectedFiles.length > 0}
  <ArkFileUpload.ItemGroup type="rejected">
    {#each fileUpload().rejectedFiles as rejection, index (`${index}:${rejection.file.name}`)}
      {@render row(rejection.file, fileUploadRejectionText(rejection.errors, limits, labels))}
    {/each}
  </ArkFileUpload.ItemGroup>
{/if}
