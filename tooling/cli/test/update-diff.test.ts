import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addItem, diffItem, updateItem } from "../src/operations.ts";
import { readManifest } from "../src/manifest.ts";
import { createRegistry } from "../src/registry.ts";

/** Build a one-item registry on disk; rewrite it to publish a new version. */
async function writeFixtureRegistry(dir: string, version: string, content: string) {
  await mkdir(join(dir, "files"), { recursive: true });
  await writeFile(join(dir, "files/widget.txt"), content);
  await writeFile(
    join(dir, "registry.json"),
    JSON.stringify({
      name: "fixture",
      items: [
        {
          name: "widget",
          type: "registry:component",
          version,
          registryDependencies: [],
          files: [{ path: "files/widget.txt", type: "registry:file", target: "src/widget.txt" }],
        },
      ],
    }),
  );
}

let project: string;
let regDir: string;
beforeEach(async () => {
  project = await mkdtemp(join(tmpdir(), "moderno-proj-"));
  regDir = await mkdtemp(join(tmpdir(), "moderno-reg-"));
});
afterEach(async () => {
  await rm(project, { recursive: true, force: true });
  await rm(regDir, { recursive: true, force: true });
});

describe("updateItem", () => {
  it("overwrites an unedited item with the new version without conflict", async () => {
    await writeFixtureRegistry(regDir, "0.1.0", "line one\nline two\n");
    const manifest = await readManifest(project);
    await addItem({
      registry: await createRegistry(regDir).load(),
      projectDir: project,
      name: "widget",
      manifest,
    });

    await writeFixtureRegistry(regDir, "0.2.0", "line one\nline two changed\n");
    const result = await updateItem({
      registry: await createRegistry(regDir).load(),
      projectDir: project,
      name: "widget",
      manifest: await readManifest(project),
    });

    expect(result.status).toBe("updated");
    expect(await readFile(join(project, "src/widget.txt"), "utf8")).toBe(
      "line one\nline two changed\n",
    );
    expect((await readManifest(project)).items.widget!.version).toBe("0.2.0");
  });

  it("reports up-to-date when nothing changed", async () => {
    await writeFixtureRegistry(regDir, "0.1.0", "stable\n");
    const manifest = await readManifest(project);
    await addItem({
      registry: await createRegistry(regDir).load(),
      projectDir: project,
      name: "widget",
      manifest,
    });

    const result = await updateItem({
      registry: await createRegistry(regDir).load(),
      projectDir: project,
      name: "widget",
      manifest: await readManifest(project),
    });
    expect(result.status).toBe("up-to-date");
  });

  it("does NOT clobber a locally edited file; it reports a conflict", async () => {
    await writeFixtureRegistry(regDir, "0.1.0", "original\n");
    const manifest = await readManifest(project);
    await addItem({
      registry: await createRegistry(regDir).load(),
      projectDir: project,
      name: "widget",
      manifest,
    });

    await writeFile(join(project, "src/widget.txt"), "my local edit\n");
    await writeFixtureRegistry(regDir, "0.2.0", "upstream change\n");
    const result = await updateItem({
      registry: await createRegistry(regDir).load(),
      projectDir: project,
      name: "widget",
      manifest: await readManifest(project),
    });

    expect(result.status).toBe("skipped-edited");
    expect(await readFile(join(project, "src/widget.txt"), "utf8")).toBe("my local edit\n");
    expect((await readManifest(project)).items.widget!.version).toBe("0.1.0");
  });
});

describe("diffItem", () => {
  it("reports the changes between the installed file and the registry version", async () => {
    await writeFixtureRegistry(regDir, "0.1.0", "alpha\nbeta\n");
    const manifest = await readManifest(project);
    await addItem({
      registry: await createRegistry(regDir).load(),
      projectDir: project,
      name: "widget",
      manifest,
    });

    await writeFixtureRegistry(regDir, "0.2.0", "alpha\ngamma\n");
    const result = await diffItem({
      registry: await createRegistry(regDir).load(),
      projectDir: project,
      name: "widget",
      manifest: await readManifest(project),
    });

    expect(result.changed).toBe(true);
    const patch = result.files[0]!.diff;
    expect(patch).toContain("-beta");
    expect(patch).toContain("+gamma");
  });

  it("reports no changes when the installed file matches the registry", async () => {
    await writeFixtureRegistry(regDir, "0.1.0", "same\n");
    const manifest = await readManifest(project);
    await addItem({
      registry: await createRegistry(regDir).load(),
      projectDir: project,
      name: "widget",
      manifest,
    });

    const result = await diffItem({
      registry: await createRegistry(regDir).load(),
      projectDir: project,
      name: "widget",
      manifest: await readManifest(project),
    });
    expect(result.changed).toBe(false);
  });
});
