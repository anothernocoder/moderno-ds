import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addItem } from "../src/operations.ts";
import { hashContent } from "../src/hash.ts";
import { readManifest } from "../src/manifest.ts";
import { createRegistry } from "../src/registry.ts";

const registryDir = fileURLToPath(new URL("../../../registry", import.meta.url));

let project: string;
beforeEach(async () => {
  project = await mkdtemp(join(tmpdir(), "moderno-proj-"));
});
afterEach(async () => {
  await rm(project, { recursive: true, force: true });
});

describe("addItem — copies files and records the version", () => {
  it("writes the file to its target and records version + pristine hash", async () => {
    const reg = await createRegistry(registryDir).load();
    const manifest = await readManifest(project);
    await addItem({ registry: reg, projectDir: project, name: "button", manifest });

    const written = await readFile(join(project, "src/components/ui/button.tsx"), "utf8");
    expect(written).toContain("export function Button");

    const m = await readManifest(project);
    expect(m.items.button!.version).toBe("0.1.0");
    expect(m.items.button!.files[0]!.target).toBe("src/components/ui/button.tsx");
    expect(m.items.button!.files[0]!.hash).toBe(hashContent(written));
  });

  it("appends a theme @import to moderno.css when adding a theme", async () => {
    await mkdir(join(project, "src/styles"), { recursive: true });
    await writeFile(join(project, "src/styles/moderno.css"), '@import "@moderno/css";\n');

    const reg = await createRegistry(registryDir).load();
    const manifest = await readManifest(project);
    await addItem({ registry: reg, projectDir: project, name: "theme-moderno", manifest });

    const css = await readFile(join(project, "src/styles/moderno.css"), "utf8");
    expect(css).toContain('@import "./theme-moderno.css";');
    // idempotent — adding again does not duplicate the import
    await addItem({ registry: reg, projectDir: project, name: "theme-moderno", manifest });
    const css2 = await readFile(join(project, "src/styles/moderno.css"), "utf8");
    expect(css2.match(/theme-moderno\.css/g)?.length).toBe(1);
  });
});
