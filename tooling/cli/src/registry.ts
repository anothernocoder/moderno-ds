import { readFile as fsReadFile } from "node:fs/promises";
import { join } from "node:path";
import type { Registry, RegistryItem } from "./types.ts";

/** Default public registry (served from the docs deploy in Phase 6). */
export const DEFAULT_REGISTRY_URL = "https://moderno.style/r/registry.json";

export type RegistryClient = {
  load(): Promise<RegistryClient>;
  getItem(name: string): RegistryItem | undefined;
  readFile(relPath: string): Promise<string>;
  readonly source: string;
};

function isUrl(source: string): boolean {
  return /^https?:\/\//i.test(source);
}

/** Split a source into a base (dir/URL) and the registry.json location. */
function resolveSource(source: string): { base: string; manifest: string } {
  const url = isUrl(source);
  if (source.endsWith(".json")) {
    const sep = url
      ? source.lastIndexOf("/")
      : Math.max(source.lastIndexOf("/"), source.lastIndexOf("\\"));
    return { base: source.slice(0, sep), manifest: source };
  }
  const base = source.replace(/[/\\]$/, "");
  return { base, manifest: url ? `${base}/registry.json` : join(base, "registry.json") };
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`registry fetch failed (${res.status}): ${url}`);
  return res.text();
}

/**
 * A registry client over a local directory or a remote URL. `path`/`target` in
 * items are resolved relative to the registry root, so the same registry.json
 * works whether served from disk (dev) or from /r/ on the docs site (prod).
 */
export function createRegistry(source: string): RegistryClient {
  const { base, manifest } = resolveSource(source);
  const url = isUrl(source);
  let registry: Registry | undefined;
  const byName = new Map<string, RegistryItem>();

  const read = (loc: string): Promise<string> => (url ? fetchText(loc) : fsReadFile(loc, "utf8"));

  const client: RegistryClient = {
    source,
    async load() {
      registry = JSON.parse(await read(manifest)) as Registry;
      byName.clear();
      for (const item of registry.items) byName.set(item.name, item);
      return client;
    },
    getItem(name) {
      return byName.get(name);
    },
    readFile(relPath) {
      return read(url ? `${base}/${relPath}` : join(base, relPath));
    },
  };
  return client;
}
