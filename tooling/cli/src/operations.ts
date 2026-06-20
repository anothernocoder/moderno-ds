import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { COMPONENTS_CONFIG, type ComponentsConfig } from "./config.ts";
import { unifiedDiff } from "./diff.ts";
import { hashContent } from "./hash.ts";
import { writeManifest } from "./manifest.ts";
import { DEFAULT_REGISTRY_URL, type RegistryClient } from "./registry.ts";
import type { Manifest, ManifestEntry, ManifestFile, RegistryItem } from "./types.ts";

/** Default consumer stylesheet that `init` scaffolds and themes append to. */
export const DEFAULT_STYLES_ENTRY = "src/styles/moderno.css";

/**
 * Scaffold the consumer project: a components.json (registry + paths) and a
 * single-import styles entry. The user imports only `moderno.css` in their app;
 * `add <theme>` later appends a relative `@import` for the theme.
 */
export async function initProject(opts: {
  projectDir: string;
  registry?: string;
  stylesEntry?: string;
}): Promise<void> {
  const stylesEntry = opts.stylesEntry ?? DEFAULT_STYLES_ENTRY;
  const configFile = join(opts.projectDir, COMPONENTS_CONFIG);
  if (!(await fileExists(configFile))) {
    const config: ComponentsConfig = {
      $schema: "https://moderno.style/schema/components.json",
      registry: opts.registry ?? DEFAULT_REGISTRY_URL,
      stylesEntry,
      aliases: { components: "src/components", ui: "src/components/ui", styles: "src/styles" },
    };
    await writeFileEnsuringDir(configFile, JSON.stringify(config, null, 2) + "\n");
  }

  const entryFile = join(opts.projectDir, stylesEntry);
  if (!(await fileExists(entryFile))) {
    await writeFileEnsuringDir(entryFile, '@import "@moderno/css";\n');
  }
}

async function fileExists(file: string): Promise<boolean> {
  try {
    await readFile(file, "utf8");
    return true;
  } catch {
    return false;
  }
}

type AddOptions = {
  registry: RegistryClient;
  projectDir: string;
  name: string;
  manifest: Manifest;
  stylesEntry?: string;
};

/** Resolve an item's registryDependencies depth-first, deepest first, deduped. */
function resolveInstallOrder(registry: RegistryClient, name: string): RegistryItem[] {
  const order: RegistryItem[] = [];
  const seen = new Set<string>();
  const visit = (n: string) => {
    if (seen.has(n)) return;
    seen.add(n);
    const item = registry.getItem(n);
    if (!item) throw new Error(`registry item not found: "${n}"`);
    for (const dep of item.registryDependencies ?? []) visit(dep);
    order.push(item);
  };
  visit(name);
  return order;
}

async function writeFileEnsuringDir(file: string, content: string): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
}

/** Append a relative `@import` for a theme to the styles entry, idempotently. */
async function appendThemeImport(
  projectDir: string,
  stylesEntry: string,
  themeTarget: string,
): Promise<void> {
  const entryFile = join(projectDir, stylesEntry);
  let css: string;
  try {
    css = await readFile(entryFile, "utf8");
  } catch {
    css = '@import "@moderno/css";\n';
  }
  const specifier = `./${basename(themeTarget)}`;
  const line = `@import "${specifier}";`;
  if (css.includes(line)) return;
  await writeFileEnsuringDir(entryFile, css.replace(/\s*$/, "\n") + line + "\n");
}

/**
 * Install a registry item (and its registryDependencies) into the project:
 * copy each file to its target, record version + a pristine content hash in the
 * manifest, and wire theme imports into the styles entry.
 */
export async function addItem(opts: AddOptions): Promise<{ installed: string[] }> {
  const { registry, projectDir, name, manifest } = opts;
  const stylesEntry = opts.stylesEntry ?? DEFAULT_STYLES_ENTRY;
  const items = resolveInstallOrder(registry, name);
  const installed: string[] = [];

  for (const item of items) {
    const files: ManifestFile[] = [];
    for (const file of item.files) {
      const content = await registry.readFile(file.path);
      await writeFileEnsuringDir(join(projectDir, file.target), content);
      files.push({ target: file.target, hash: hashContent(content) });
      if (item.type === "registry:theme") {
        await appendThemeImport(projectDir, stylesEntry, file.target);
      }
    }
    manifest.items[item.name] = { version: item.version, type: item.type, files };
    installed.push(item.name);
  }
  await writeManifest(projectDir, manifest);
  return { installed };
}

type ItemOptions = {
  registry: RegistryClient;
  projectDir: string;
  name: string;
  manifest: Manifest;
};

async function readFileOrNull(file: string): Promise<string | null> {
  try {
    return await readFile(file, "utf8");
  } catch {
    return null;
  }
}

function pristineHashFor(entry: ManifestEntry | undefined, target: string): string | undefined {
  return entry?.files.find((f) => f.target === target)?.hash;
}

export type FileUpdateStatus = "updated" | "up-to-date" | "skipped-edited";
export type UpdateResult = {
  name: string;
  version: string;
  status: FileUpdateStatus;
  files: Array<{ target: string; status: FileUpdateStatus }>;
};

/**
 * Re-install an item from the registry, but only over files the consumer has
 * NOT edited (on-disk hash still equals the manifest's pristine hash). Edited
 * files are left untouched and reported as conflicts — this is what makes
 * `update` safe to run and is why primitives must be themed, not edited.
 */
export async function updateItem(opts: ItemOptions): Promise<UpdateResult> {
  const { registry, projectDir, name, manifest } = opts;
  const item = registry.getItem(name);
  if (!item) throw new Error(`registry item not found: "${name}"`);
  const entry = manifest.items[name];
  if (!entry) throw new Error(`"${name}" is not installed (no manifest entry)`);

  const files: Array<{ target: string; status: FileUpdateStatus }> = [];
  const newManifestFiles: ManifestFile[] = [];
  let anyEdited = false;

  for (const file of item.files) {
    const dest = join(projectDir, file.target);
    const registryContent = await registry.readFile(file.path);
    const onDisk = await readFileOrNull(dest);
    const pristine = pristineHashFor(entry, file.target);

    if (onDisk !== null && pristine !== undefined && hashContent(onDisk) !== pristine) {
      anyEdited = true;
      files.push({ target: file.target, status: "skipped-edited" });
      newManifestFiles.push({ target: file.target, hash: pristine });
      continue;
    }
    if (onDisk === registryContent) {
      files.push({ target: file.target, status: "up-to-date" });
      newManifestFiles.push({ target: file.target, hash: hashContent(registryContent) });
      continue;
    }
    await writeFileEnsuringDir(dest, registryContent);
    files.push({ target: file.target, status: "updated" });
    newManifestFiles.push({ target: file.target, hash: hashContent(registryContent) });
  }

  const status: FileUpdateStatus = anyEdited
    ? "skipped-edited"
    : files.some((f) => f.status === "updated")
      ? "updated"
      : "up-to-date";

  if (!anyEdited) {
    manifest.items[name] = { version: item.version, type: item.type, files: newManifestFiles };
    await writeManifest(projectDir, manifest);
  }

  return { name, version: manifest.items[name]!.version, status, files };
}

export type DiffResult = {
  name: string;
  changed: boolean;
  files: Array<{ target: string; diff: string; changed: boolean }>;
};

/** Show what differs between the installed files and the current registry version. */
export async function diffItem(opts: ItemOptions): Promise<DiffResult> {
  const { registry, projectDir, name } = opts;
  const item = registry.getItem(name);
  if (!item) throw new Error(`registry item not found: "${name}"`);

  const files: DiffResult["files"] = [];
  for (const file of item.files) {
    const onDisk = (await readFileOrNull(join(projectDir, file.target))) ?? "";
    const registryContent = await registry.readFile(file.path);
    const diff = unifiedDiff(
      onDisk,
      registryContent,
      `installed ${file.target}`,
      `registry ${file.path}`,
    );
    files.push({ target: file.target, diff, changed: diff !== "" });
  }
  return { name, changed: files.some((f) => f.changed), files };
}
