/**
 * FileUpload's prop types, in a `.ts` file rather than inside the `.svelte`:
 * a `Props` interface declared in a component's instance script is not
 * exported, so a consumer could not name it. Declaring it here gives the
 * component and the package's exports one nameable type.
 */
import type { FileUploadFileChangeDetails, FileUploadRootProps } from "@ark-ui/svelte";
import type { FileUploadAccept, FileUploadSize, FileUploadTranslations } from "@moderno-ui/core";

export type { FileUploadFileChangeDetails } from "@ark-ui/svelte";

/** FileUpload's own props, plus Ark Root's (`name`, `invalid`, `validate`, …). */
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
