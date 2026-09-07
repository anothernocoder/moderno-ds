import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readManifest } from "../src/manifest.ts";
import { addItem, updateItem } from "../src/operations.ts";
import { createRegistry } from "../src/registry.ts";
import { checkTiers } from "../src/tiers.ts";
import type { Registry } from "../src/types.ts";

/**
 * A four-tier fixture registry: one ejected component, the block that composes
 * it, two screens that compose the block, and the flow that sequences the
 * screens. Every item carries a different version so the manifest has to record
 * them per item rather than stamping one registry-wide version.
 */
const FIXTURE: Registry = {
  name: "fixture",
  items: [
    {
      name: "button",
      type: "registry:component",
      version: "1.0.0",
      files: [{ path: "files/button.txt", type: "registry:file", target: "src/ui/button.txt" }],
    },
    {
      name: "login-form",
      type: "registry:block",
      version: "1.1.0",
      dependencies: ["lucide-react"],
      registryDependencies: ["button"],
      files: [
        { path: "files/login-form.txt", type: "registry:file", target: "src/blocks/login.txt" },
      ],
    },
    {
      name: "sign-in",
      type: "registry:screen",
      version: "1.2.0",
      registryDependencies: ["login-form"],
      files: [{ path: "files/sign-in.txt", type: "registry:file", target: "src/screens/in.txt" }],
    },
    {
      name: "reset-password",
      type: "registry:screen",
      version: "1.3.0",
      registryDependencies: ["login-form"],
      files: [{ path: "files/reset.txt", type: "registry:file", target: "src/screens/reset.txt" }],
    },
    {
      name: "auth",
      type: "registry:flow",
      version: "2.0.0",
      registryDependencies: ["sign-in", "reset-password"],
      files: [{ path: "files/auth.txt", type: "registry:file", target: "src/flows/auth.txt" }],
    },
  ],
};

let project: string;
let regDir: string;

beforeEach(async () => {
  project = await mkdtemp(join(tmpdir(), "moderno-proj-"));
  regDir = await mkdtemp(join(tmpdir(), "moderno-reg-"));
  await mkdir(join(regDir, "files"), { recursive: true });
  for (const item of FIXTURE.items) {
    for (const file of item.files) {
      await writeFile(join(regDir, file.path), `${item.name} v${item.version}\n`);
    }
  }
  await writeFile(join(regDir, "registry.json"), JSON.stringify(FIXTURE));
});

afterEach(async () => {
  await rm(project, { recursive: true, force: true });
  await rm(regDir, { recursive: true, force: true });
});

const load = () => createRegistry(regDir).load();

describe("installing a flow", () => {
  it("keeps the fixture itself within the tier rules", () => {
    expect(checkTiers(FIXTURE.items)).toEqual([]);
  });

  it("installs the flow's screens and their blocks transitively, deepest first", async () => {
    const manifest = await readManifest(project);
    const result = await addItem({
      registry: await load(),
      projectDir: project,
      name: "auth",
      manifest,
    });

    expect(result.installed).toEqual(["button", "login-form", "sign-in", "reset-password", "auth"]);
    expect(await readFile(join(project, "src/ui/button.txt"), "utf8")).toBe("button v1.0.0\n");
    expect(await readFile(join(project, "src/blocks/login.txt"), "utf8")).toBe(
      "login-form v1.1.0\n",
    );
    expect(await readFile(join(project, "src/screens/in.txt"), "utf8")).toBe("sign-in v1.2.0\n");
    expect(await readFile(join(project, "src/screens/reset.txt"), "utf8")).toBe(
      "reset-password v1.3.0\n",
    );
    expect(await readFile(join(project, "src/flows/auth.txt"), "utf8")).toBe("auth v2.0.0\n");
  });

  it("records each installed item under its own version and type", async () => {
    const manifest = await readManifest(project);
    await addItem({ registry: await load(), projectDir: project, name: "auth", manifest });

    const m = await readManifest(project);
    expect(
      Object.fromEntries(Object.entries(m.items).map(([name, e]) => [name, e.version])),
    ).toEqual({
      button: "1.0.0",
      "login-form": "1.1.0",
      "sign-in": "1.2.0",
      "reset-password": "1.3.0",
      auth: "2.0.0",
    });
    expect(m.items["sign-in"]!.type).toBe("registry:screen");
    expect(m.items.auth!.type).toBe("registry:flow");
  });

  it("reports the npm dependencies of everything it pulled in, not just the flow", async () => {
    const manifest = await readManifest(project);
    const result = await addItem({
      registry: await load(),
      projectDir: project,
      name: "auth",
      manifest,
    });
    // lucide-react is declared by the block, three tiers below the flow
    expect(result.dependencies).toEqual(["lucide-react"]);
  });
});

describe("update after a flow install", () => {
  it("leaves every pristine item untouched", async () => {
    const registry = await load();
    const manifest = await readManifest(project);
    await addItem({ registry, projectDir: project, name: "auth", manifest });

    const targets = FIXTURE.items.map((i) => i.files[0]!.target);
    const before = new Map<string, number>();
    for (const target of targets) before.set(target, (await stat(join(project, target))).mtimeMs);
    // fs mtimes are sub-millisecond here; wait long enough that a rewrite shows
    await new Promise((resolve) => setTimeout(resolve, 20));

    for (const item of FIXTURE.items) {
      const result = await updateItem({ registry, projectDir: project, name: item.name, manifest });
      expect(result.status, item.name).toBe("up-to-date");
      expect(result.version, item.name).toBe(item.version);
    }

    for (const target of targets) {
      expect((await stat(join(project, target))).mtimeMs, target).toBe(before.get(target));
    }
  });

  it("still preserves an item the consumer edited", async () => {
    const registry = await load();
    const manifest = await readManifest(project);
    await addItem({ registry, projectDir: project, name: "auth", manifest });
    await writeFile(join(project, "src/screens/in.txt"), "hand-edited\n");

    const edited = await updateItem({ registry, projectDir: project, name: "sign-in", manifest });
    expect(edited.status).toBe("skipped-edited");
    expect(await readFile(join(project, "src/screens/in.txt"), "utf8")).toBe("hand-edited\n");

    const sibling = await updateItem({ registry, projectDir: project, name: "auth", manifest });
    expect(sibling.status).toBe("up-to-date");
  });
});

describe("installing a screen on its own", () => {
  it("pulls its blocks but never the flow that composes it", async () => {
    const manifest = await readManifest(project);
    const result = await addItem({
      registry: await load(),
      projectDir: project,
      name: "sign-in",
      manifest,
    });

    expect(result.installed).toEqual(["button", "login-form", "sign-in"]);
    const m = await readManifest(project);
    expect(Object.keys(m.items).sort()).toEqual(["button", "login-form", "sign-in"]);
    expect(m.items.auth).toBeUndefined();
    expect(m.items["reset-password"]).toBeUndefined();
  });
});
