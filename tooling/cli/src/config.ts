import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { DEFAULT_REGISTRY_URL } from "./registry.ts";

/** components.json — the consumer's CLI config (registry override, aliases). */
export type ComponentsConfig = {
  $schema?: string;
  registry?: string;
  stylesEntry?: string;
  aliases?: Record<string, string>;
};

export const COMPONENTS_CONFIG = "components.json";

export async function readComponentsConfig(
  projectDir: string,
): Promise<ComponentsConfig | undefined> {
  try {
    return JSON.parse(
      await readFile(join(projectDir, COMPONENTS_CONFIG), "utf8"),
    ) as ComponentsConfig;
  } catch {
    return undefined;
  }
}

/**
 * Resolve which registry to use. Precedence (highest first):
 *   1. explicit `--registry` override
 *   2. components.json `registry`
 *   3. MODERNO_REGISTRY_URL env var
 *   4. the default public registry
 */
export async function resolveRegistrySource(opts: {
  projectDir: string;
  env?: NodeJS.ProcessEnv;
  override?: string;
}): Promise<string> {
  if (opts.override) return opts.override;
  const config = await readComponentsConfig(opts.projectDir);
  if (config?.registry) return config.registry;
  const env = opts.env ?? process.env;
  if (env.MODERNO_REGISTRY_URL) return env.MODERNO_REGISTRY_URL;
  return DEFAULT_REGISTRY_URL;
}

export type Runner = "bun" | "pnpm" | "npm";

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

/** Detect the package runner from lockfiles, then the invoking user agent. */
export async function detectRunner(projectDir: string, env?: NodeJS.ProcessEnv): Promise<Runner> {
  if (await exists(join(projectDir, "bun.lockb"))) return "bun";
  if (await exists(join(projectDir, "pnpm-lock.yaml"))) return "pnpm";
  if (await exists(join(projectDir, "package-lock.json"))) return "npm";

  const ua = (env ?? process.env).npm_config_user_agent ?? "";
  if (ua.startsWith("bun")) return "bun";
  if (ua.startsWith("pnpm")) return "pnpm";
  return "npm";
}

/** The shell command to install npm dependencies with a given runner. */
export function installCommand(runner: Runner, deps: string[]): string {
  const verb = runner === "npm" ? "install" : "add";
  return `${runner} ${verb} ${deps.join(" ")}`;
}
