/**
 * Resolving a shadcn-style registry manifest to the source files it ships.
 *
 * The gate #77 asks for runs over "the registry sources", and the manifest is
 * the only honest definition of that set: a glob over `registry/` would also
 * sweep up files no item references (and miss any item whose files move), so
 * what CI lints is exactly what the CLI would copy into a consumer project.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** The slice of the registry manifest this resolver reads. */
interface RegistryManifest {
  items?: { name?: string; type?: string; files?: { path?: string; type?: string }[] }[];
}

/** One file a registry item ships, with the item context a caller needs to filter on. */
export interface RegistryFile {
  /** The owning item's name, for diagnostics. */
  item: string;
  /** The file's own `registry:*` type, falling back to its item's. */
  type: string;
  /** Absolute path, resolved against the manifest's directory. */
  path: string;
}

/**
 * Themes are the one registry type whose whole job is to carry literal brand
 * values — `--primary: oklch(…)` is the *point* of a theme file, not a contract
 * breach (CONTRACT.md, "The three layers": names are neutral, values are
 * branded). Linting them for hardcoded colour would flag every line. They are
 * gated instead by `theme-compile`, which validates a theme's
 * `tokens.dtcg.json` against the required slots and warns on WCAG AA.
 */
const UNLINTED_TYPES = new Set(["registry:theme"]);

/**
 * Every file the manifest at `manifestPath` ships, in manifest order.
 *
 * Throws on unreadable or malformed JSON — a broken manifest is a repo bug the
 * caller should surface, not something to lint around.
 */
export function registryFiles(manifestPath: string): RegistryFile[] {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as RegistryManifest;
  if (!Array.isArray(manifest.items)) {
    throw new Error(`registry manifest has no "items" array: ${manifestPath}`);
  }
  const base = dirname(resolve(manifestPath));
  const out: RegistryFile[] = [];
  for (const item of manifest.items) {
    for (const file of item.files ?? []) {
      if (typeof file.path !== "string" || file.path.length === 0) continue;
      out.push({
        item: item.name ?? "(unnamed)",
        type: file.type ?? item.type ?? "",
        path: resolve(base, file.path),
      });
    }
  }
  return out;
}

/**
 * The lintable subset of `registryFiles`: everything but the types whose
 * content is values by design. Duplicates are collapsed and the result sorted,
 * so a run's output is stable regardless of manifest order.
 */
export function registrySourceFiles(manifestPath: string): string[] {
  const paths = new Set<string>();
  for (const file of registryFiles(manifestPath)) {
    if (UNLINTED_TYPES.has(file.type)) continue;
    paths.add(file.path);
  }
  return [...paths].sort();
}

/** One `@/…` specifier a registry source imports, and the file it stands for. */
export interface RegistryAlias {
  /** The specifier as written in the registry source, e.g. `@/components/blocks/LoginForm.vue`. */
  find: string;
  /** Absolute path to the registry file the CLI copies there. */
  replacement: string;
}

/** The tiers whose files another tier imports through a `@/components/<dir>/…` path. */
const COMPOSED_DIRS = ["blocks", "screens"] as const;

/**
 * The `@/components/{blocks,screens}/…` aliases a `framework`'s registry
 * sources import.
 *
 * A screen composes blocks — and a flow composes screens — through the path
 * `moderno add` will have written them to in the consumer's project, not
 * through a relative path into the registry, so nothing can import either
 * without being told what `@/` means. Resolving that from the manifest rather
 * than from a naming rule is the point: the frameworks do not agree on one
 * (`LoginForm.vue` and `LoginForm.svelte` sit in `blocks/login-form/`, while
 * Solid's copy is `login-form.tsx`), and the manifest already knows where every
 * file actually is.
 *
 * Specifiers are matched with and without the extension, which is the only
 * other thing the frameworks disagree about: Vue and Svelte import
 * `…/LoginForm.vue`, Solid imports `…/alert-list`.
 */
export function registryAliases(manifestPath: string, framework: string): RegistryAlias[] {
  const aliases: RegistryAlias[] = [];
  for (const file of registryFiles(manifestPath)) {
    if (!file.path.includes(`/${framework}/`)) continue;
    const dir = COMPOSED_DIRS.find((candidate) => file.path.includes(`/${candidate}/`));
    if (dir === undefined) continue;
    const name = file.path.slice(file.path.lastIndexOf("/") + 1);
    const stem = name.slice(0, name.indexOf("."));
    aliases.push({ find: `@/components/${dir}/${name}`, replacement: file.path });
    aliases.push({ find: `@/components/${dir}/${stem}`, replacement: file.path });
  }
  return aliases;
}
