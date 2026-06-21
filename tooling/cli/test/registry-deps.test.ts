import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addItem } from "../src/operations.ts";
import { readManifest } from "../src/manifest.ts";
import { createRegistry } from "../src/registry.ts";

let project: string;
let regDir: string;
beforeEach(async () => {
  project = await mkdtemp(join(tmpdir(), "moderno-proj-"));
  regDir = await mkdtemp(join(tmpdir(), "moderno-reg-"));
  await mkdir(join(regDir, "files"), { recursive: true });
  await writeFile(join(regDir, "files/base.txt"), "base\n");
  await writeFile(join(regDir, "files/shell.txt"), "shell\n");
  await writeFile(
    join(regDir, "registry.json"),
    JSON.stringify({
      name: "fixture",
      items: [
        {
          name: "base",
          type: "registry:component",
          version: "1.0.0",
          registryDependencies: [],
          files: [{ path: "files/base.txt", type: "registry:file", target: "src/base.txt" }],
        },
        {
          name: "shell",
          type: "registry:block",
          version: "1.0.0",
          registryDependencies: ["base"],
          files: [{ path: "files/shell.txt", type: "registry:file", target: "src/shell.txt" }],
        },
      ],
    }),
  );
});
afterEach(async () => {
  await rm(project, { recursive: true, force: true });
  await rm(regDir, { recursive: true, force: true });
});

describe("addItem — registryDependencies", () => {
  it("installs dependencies before the requested item and records both", async () => {
    const manifest = await readManifest(project);
    const result = await addItem({
      registry: await createRegistry(regDir).load(),
      projectDir: project,
      name: "shell",
      manifest,
    });

    // dependency installed first
    expect(result.installed).toEqual(["base", "shell"]);
    expect(await readFile(join(project, "src/base.txt"), "utf8")).toBe("base\n");
    expect(await readFile(join(project, "src/shell.txt"), "utf8")).toBe("shell\n");

    const m = await readManifest(project);
    expect(Object.keys(m.items).sort()).toEqual(["base", "shell"]);
  });
});
