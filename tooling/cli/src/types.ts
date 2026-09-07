/** Shared types for the Moderno registry + CLI. */

/**
 * The item types the registry publishes (ADR-0005): a theme, then the copy
 * tiers from the bottom up — an ejected primitive, a block, a screen, a flow.
 * A theme composes nothing and is composed by nothing, so it sits outside that
 * ladder; `tiers.ts` owns which type may depend on which.
 */
export const REGISTRY_ITEM_TYPES = [
  "registry:theme",
  "registry:component",
  "registry:block",
  "registry:screen",
  "registry:flow",
] as const;

export type RegistryItemType = (typeof REGISTRY_ITEM_TYPES)[number];

export function isRegistryItemType(value: string): value is RegistryItemType {
  return (REGISTRY_ITEM_TYPES as readonly string[]).includes(value);
}

export type RegistryFile = {
  /** Path to the file's content, relative to the registry root. */
  path: string;
  type: string;
  /** Destination in the consumer project, relative to its root. */
  target: string;
};

export type RegistryItem = {
  name: string;
  type: RegistryItemType;
  version: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
};

export type Registry = {
  $schema?: string;
  name: string;
  homepage?: string;
  items: RegistryItem[];
};

/** One installed file recorded in .moderno/manifest.json. */
export type ManifestFile = {
  target: string;
  /** sha256 of the content as written by the CLI (the "pristine" hash). */
  hash: string;
};

export type ManifestEntry = {
  version: string;
  type: RegistryItemType;
  files: ManifestFile[];
};

export type Manifest = {
  $schema?: string;
  registry?: string;
  items: Record<string, ManifestEntry>;
};
