import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Aggregator } from "../aggregator.ts";

/** Where the registry lives; every `path` in it is relative to this folder. */
const REGISTRY_DIR = "registry";

/** The file every unit keeps in its own folder, `registry/<tier>/<name>/item.json`. */
const UNIT_FILE = "item.json";

/**
 * Each tier's folder and the item type it publishes, in tier rank: the order
 * the items appear in `registry.json`.
 */
const TIERS = [
  { folder: "themes", type: "registry:theme" },
  { folder: "primitives", type: "registry:component" },
  { folder: "blocks", type: "registry:block" },
  { folder: "screens", type: "registry:screen" },
  { folder: "flows", type: "registry:flow" },
] as const;

/** Framework order within a unit, and the label its item title ends with. */
const FRAMEWORK_LABELS = {
  react: "React",
  vue: "Vue",
  svelte: "Svelte",
  solid: "Solid",
} as const;

type Framework = keyof typeof FRAMEWORK_LABELS;
const FRAMEWORKS = Object.keys(FRAMEWORK_LABELS) as Framework[];

/** In a framework unit's shared text, stands for the item's framework. */
const FRAMEWORK_PLACEHOLDER = "{framework}";

/** The fields `registry.json` carries above its items. */
const REGISTRY_HEADER = {
  $schema: "https://moderno.style/schema/registry.json",
  name: "moderno",
  homepage: "https://moderno.style",
};

interface RegistryFile {
  path: string;
  type: string;
  target: string;
}

interface RegistryItem {
  name: string;
  type: string;
  version: string;
  title: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
}

/**
 * One `item.json`. A unit with a `files` list is one item, named after its
 * folder (a theme, the ejected primitive). A unit with a `files` map is one item
 * per framework it lists, named `<folder>-<framework>`: `{framework}` in its
 * description and dependencies stands for that framework, and `version` is
 * either shared or given per framework.
 */
interface Unit {
  title: string;
  description: string;
  version: string | Partial<Record<Framework, string>>;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[] | Partial<Record<Framework, RegistryFile[]>>;
}

/** The items one unit publishes, in framework order. */
function expandUnit(name: string, type: string, unit: Unit): RegistryItem[] {
  const { title, description, version, dependencies, registryDependencies, files } = unit;
  if (Array.isArray(files)) {
    if (typeof version !== "string") {
      throw new Error(`${name}: a unit without frameworks takes one version string`);
    }
    return [{ name, type, version, title, description, dependencies, registryDependencies, files }];
  }

  const unknown = Object.keys(files).filter((key) => !FRAMEWORKS.includes(key as Framework));
  if (unknown.length > 0) {
    throw new Error(`${name}: unknown framework ${unknown.join(", ")} in files`);
  }
  return FRAMEWORKS.filter((framework) => files[framework]).map((framework) => {
    const forFramework = (text: string) => text.replaceAll(FRAMEWORK_PLACEHOLDER, framework);
    const frameworkVersion = typeof version === "string" ? version : version[framework];
    if (!frameworkVersion) throw new Error(`${name}: no version for ${framework}`);
    return {
      name: `${name}-${framework}`,
      type,
      version: frameworkVersion,
      title: `${title} (${FRAMEWORK_LABELS[framework]})`,
      description: forFramework(description),
      dependencies: dependencies.map(forFramework),
      registryDependencies: registryDependencies.map(forFramework),
      files: files[framework] ?? [],
    };
  });
}

/** Every item of one tier: its units sorted by name, each expanded in framework order. */
function tierItems(root: string, { folder, type }: (typeof TIERS)[number]): RegistryItem[] {
  const tierDir = join(root, REGISTRY_DIR, folder);
  if (!existsSync(tierDir)) return [];
  return readdirSync(tierDir)
    .filter((name) => existsSync(join(tierDir, name, UNIT_FILE)))
    .sort()
    .flatMap((name) => {
      const unit = JSON.parse(readFileSync(join(tierDir, name, UNIT_FILE), "utf8")) as Unit;
      return expandUnit(name, type, unit);
    });
}

/**
 * `registry/registry.json`, the manifest the CLI and the docs deploy read: one
 * item per theme and ejected primitive, and one per framework for every block,
 * screen and flow, sorted by tier rank, then unit name, then framework order.
 */
export default {
  output: `${REGISTRY_DIR}/registry.json`,
  source: `${REGISTRY_DIR}/*/*/${UNIT_FILE}`,
  generate: ({ root }) => {
    const items = TIERS.flatMap((tier) => tierItems(root, tier));
    return `${JSON.stringify({ ...REGISTRY_HEADER, items }, null, 2)}\n`;
  },
} satisfies Aggregator;
