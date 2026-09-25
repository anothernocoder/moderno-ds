import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addItem, updateItem } from "../src/operations.ts";
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
    await writeFile(join(project, "src/styles/moderno.css"), '@import "@moderno-ui/css";\n');

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

describe("addItem — a theme's DESIGN.md", () => {
  const registryFile = (path: string) => readFile(join(registryDir, path), "utf8");

  it("writes a brand-less theme's DESIGN.md to the project root", async () => {
    const reg = await createRegistry(registryDir).load();
    const manifest = await readManifest(project);
    await addItem({ registry: reg, projectDir: project, name: "theme-moderno", manifest });

    expect(await readFile(join(project, "DESIGN.md"), "utf8")).toBe(
      await registryFile("themes/theme-moderno/DESIGN.md"),
    );
    const m = await readManifest(project);
    expect(m.items["theme-moderno"]!.files.map((f) => f.target)).toContain("DESIGN.md");
  });

  it("writes a branded theme's DESIGN.md under design/<theme>/, beside the default's", async () => {
    const reg = await createRegistry(registryDir).load();
    const manifest = await readManifest(project);
    await addItem({ registry: reg, projectDir: project, name: "theme-moderno", manifest });
    await addItem({ registry: reg, projectDir: project, name: "theme-contrast", manifest });

    expect(await readFile(join(project, "design/theme-contrast/DESIGN.md"), "utf8")).toBe(
      await registryFile("themes/theme-contrast/DESIGN.md"),
    );
    expect(await readFile(join(project, "DESIGN.md"), "utf8")).toBe(
      await registryFile("themes/theme-moderno/DESIGN.md"),
    );
  });

  it("imports only the theme's stylesheet, never its DESIGN.md", async () => {
    const reg = await createRegistry(registryDir).load();
    const manifest = await readManifest(project);
    await addItem({ registry: reg, projectDir: project, name: "theme-contrast", manifest });

    const css = await readFile(join(project, "src/styles/moderno.css"), "utf8");
    expect(css).toContain('@import "./theme-contrast.css";');
    expect(css).not.toContain("DESIGN.md");
  });

  it("keeps a DESIGN.md the project already had, and update keeps it too", async () => {
    await writeFile(join(project, "DESIGN.md"), "# Our own design system\n");
    const reg = await createRegistry(registryDir).load();
    const manifest = await readManifest(project);
    const result = await addItem({
      registry: reg,
      projectDir: project,
      name: "theme-moderno",
      manifest,
    });

    expect(result.kept).toEqual(["DESIGN.md"]);
    expect(await readFile(join(project, "DESIGN.md"), "utf8")).toBe("# Our own design system\n");
    // the stylesheet still installs, and the kept file is not claimed in the manifest
    expect(await readFile(join(project, "src/styles/theme-moderno.css"), "utf8")).toContain(
      "--primary",
    );
    const m = await readManifest(project);
    expect(m.items["theme-moderno"]!.files.map((f) => f.target)).not.toContain("DESIGN.md");

    const updated = await updateItem({
      registry: reg,
      projectDir: project,
      name: "theme-moderno",
      manifest: m,
    });
    expect(updated.files.find((f) => f.target === "DESIGN.md")!.status).toBe("skipped-edited");
    expect(await readFile(join(project, "DESIGN.md"), "utf8")).toBe("# Our own design system\n");
  });

  it("reinstalls over the DESIGN.md it wrote itself", async () => {
    const reg = await createRegistry(registryDir).load();
    const manifest = await readManifest(project);
    await addItem({ registry: reg, projectDir: project, name: "theme-moderno", manifest });
    await writeFile(join(project, "DESIGN.md"), "stale\n");

    const result = await addItem({
      registry: reg,
      projectDir: project,
      name: "theme-moderno",
      manifest,
    });
    expect(result.kept).toEqual([]);
    expect(await readFile(join(project, "DESIGN.md"), "utf8")).toBe(
      await registryFile("themes/theme-moderno/DESIGN.md"),
    );
  });
});
