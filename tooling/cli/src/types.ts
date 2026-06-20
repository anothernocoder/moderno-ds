/** Shared types for the Moderno registry + CLI. */

export type RegistryFile = {
  /** Path to the file's content, relative to the registry root. */
  path: string;
  type: string;
  /** Destination in the consumer project, relative to its root. */
  target: string;
};

export type RegistryItem = {
  name: string;
  type: string;
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
  type: string;
  files: ManifestFile[];
};

export type Manifest = {
  $schema?: string;
  registry?: string;
  items: Record<string, ManifestEntry>;
};
