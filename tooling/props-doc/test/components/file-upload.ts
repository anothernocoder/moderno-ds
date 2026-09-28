import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** FileUpload's own props, recipe and parts — what validate_usage checks against. */
export default function expectFileUpload(fileUpload: AgentComponent): void {
  expect(fileUpload.scope).toBe("file-upload");
  expect(fileUpload.props.map((p) => p.name).sort()).toEqual([
    "accept",
    "disabled",
    "label",
    "maxFileSize",
    "maxFiles",
    "onFileChange",
    "size",
    "translations",
  ]);
  expect(fileUpload.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(fileUpload.parts.map((p) => p.name)).toEqual([
    "root",
    "dropzone",
    "dropzone-icon",
    "dropzone-title",
    "dropzone-hint",
    "item-group",
    "item",
    "item-preview",
    "item-preview-image",
    "item-name",
    "item-name-full",
    "item-name-start",
    "item-name-end",
    "item-size-text",
    "item-error",
    "item-delete-trigger",
  ]);
  // Ark's own Root props (name, invalid, validate, acceptedFiles, …) live under node_modules.
  expect(fileUpload.propsComplete).toBe(false);
}
