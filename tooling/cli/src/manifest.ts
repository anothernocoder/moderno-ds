import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Manifest } from "./types.ts";

/** Location of the manifest within a consumer project. */
export const MANIFEST_PATH = ".moderno/manifest.json";

const SCHEMA = "https://moderno.style/schema/manifest.json";

export async function readManifest(projectDir: string): Promise<Manifest> {
  try {
    const raw = await readFile(join(projectDir, MANIFEST_PATH), "utf8");
    const parsed = JSON.parse(raw) as Manifest;
    return { ...parsed, $schema: parsed.$schema ?? SCHEMA, items: parsed.items ?? {} };
  } catch {
    return { $schema: SCHEMA, items: {} };
  }
}

export async function writeManifest(projectDir: string, manifest: Manifest): Promise<void> {
  const file = join(projectDir, MANIFEST_PATH);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify({ $schema: SCHEMA, ...manifest }, null, 2) + "\n");
}
