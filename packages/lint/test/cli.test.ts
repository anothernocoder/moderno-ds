import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { runCli } from "../src/cli.ts";
import {
  createConsumerFixture,
  type ConsumerFixture,
} from "../../lint-core/test/helpers/consumer-fixture.ts";

let fixture: ConsumerFixture;

beforeAll(() => {
  fixture = createConsumerFixture();
});

afterAll(() => {
  fixture.cleanup();
});

function writeSourceFile(name: string, content: string): string {
  const path = join(fixture.dir, name);
  writeFileSync(path, content);
  return path;
}

function capture() {
  const out: string[] = [];
  const err: string[] = [];
  return {
    out,
    err,
    stdout: (line: string) => out.push(line),
    stderr: (line: string) => err.push(line),
  };
}

describe("runCli", () => {
  it("catches a hardcoded color, an invalid prop, and a raw-Ark import in one file (issue #44 AC), exiting 1", () => {
    const file = writeSourceFile(
      "Screen.tsx",
      [
        'import { Dialog } from "@ark-ui/react";',
        '<Button variant="primaryy" style={{ color: "#ff0000" }}>Save</Button>',
      ].join("\n"),
    );
    const { stdout, stderr, out } = capture();
    const code = runCli([file], { cwd: fixture.dir, stdout, stderr });

    expect(code).toBe(1);
    const ruleIds = out
      .filter((l) => l.includes("[moderno/"))
      .map((l) => /\[(moderno\/[\w-]+)\]/.exec(l)?.[1]);
    expect(ruleIds.sort()).toEqual([
      "moderno/no-hardcoded-color",
      "moderno/no-raw-ark",
      "moderno/valid-props",
    ]);
  });

  it("exits 0 with no output violations for clean, valid usage", () => {
    const file = writeSourceFile("Clean.tsx", '<Button variant="primary">Save</Button>');
    const { stdout, stderr, out } = capture();
    const code = runCli([file], { cwd: fixture.dir, stdout, stderr });

    expect(code).toBe(0);
    expect(out.some((l) => l.includes("no violations"))).toBe(true);
  });

  it("exits 0 when only warnings are found (a heuristic, not an error)", () => {
    const file = writeSourceFile("Reimpl.tsx", '<dialog role="dialog">...</dialog>');
    const { stdout, stderr, out } = capture();
    const code = runCli([file], { cwd: fixture.dir, stdout, stderr });

    expect(code).toBe(0);
    expect(out.some((l) => l.includes("moderno/no-reimplemented-primitive"))).toBe(true);
  });

  it("infers the framework from a .vue extension", () => {
    const file = writeSourceFile("Screen.vue", '<Button variant="primaryy" />');
    const { stdout, stderr, out } = capture();
    const code = runCli([file], { cwd: fixture.dir, stdout, stderr });

    expect(code).toBe(1);
    expect(out.some((l) => l.includes("moderno/valid-props"))).toBe(true);
  });

  it("honors --framework over the extension-based guess", () => {
    // Vue's fixture manifest has no `Dialog`; forcing framework=vue against a
    // .tsx file should validate against Vue's Button (still catches the typo).
    const file = writeSourceFile("SolidScreen.tsx", '<Button variant="primaryy" />');
    const { stdout, stderr, out } = capture();
    const code = runCli([file, "--framework", "vue"], { cwd: fixture.dir, stdout, stderr });

    expect(code).toBe(1);
    expect(out.some((l) => l.includes("moderno/valid-props"))).toBe(true);
  });

  it("rejects an unknown --framework value", () => {
    const file = writeSourceFile("X.tsx", "<Button />");
    const { stdout, stderr, err } = capture();
    const code = runCli([file, "--framework", "angular"], { cwd: fixture.dir, stdout, stderr });

    expect(code).toBe(2);
    expect(err.some((l) => l.includes("unknown --framework"))).toBe(true);
  });

  it("exits 2 and reports a missing file without throwing", () => {
    const { stdout, stderr, err } = capture();
    const code = runCli([join(fixture.dir, "Nope.tsx")], { cwd: fixture.dir, stdout, stderr });

    expect(code).toBe(2);
    expect(err.some((l) => l.includes("no such file"))).toBe(true);
  });

  it("prints help and exits 2 when no files are given", () => {
    const { stdout, stderr, err } = capture();
    const code = runCli([], { cwd: fixture.dir, stdout, stderr });

    expect(code).toBe(2);
    expect(err.some((l) => l.includes("Usage:"))).toBe(true);
  });

  it("prints help and exits 0 for --help", () => {
    const { stdout, stderr, out } = capture();
    const code = runCli(["--help"], { cwd: fixture.dir, stdout, stderr });

    expect(code).toBe(0);
    expect(out.some((l) => l.includes("Usage:"))).toBe(true);
  });

  describe("with more than one file", () => {
    it("aggregates findings across files and exits 1 if any file has an error", () => {
      const clean = writeSourceFile("Clean2.tsx", '<Button variant="primary">Save</Button>');
      const dirty = writeSourceFile("Dirty2.tsx", '<Button variant="primaryy" />');
      const { stdout, stderr, out } = capture();
      const code = runCli([clean, dirty], { cwd: fixture.dir, stdout, stderr });

      expect(code).toBe(1);
      expect(out.some((l) => l.startsWith(dirty))).toBe(true);
      expect(out.some((l) => l.startsWith(clean))).toBe(false);
    });
  });
});

/**
 * `--registry` is the CI gate over the catalog (#77): every source file a
 * registry item ships is linted, with the framework read from the item's
 * directory layout.
 */
describe("runCli --registry", () => {
  let dir: string;

  function writeRegistry(items: unknown[]): string {
    const manifestPath = join(dir, "registry.json");
    writeFileSync(manifestPath, JSON.stringify({ name: "test", items }));
    return manifestPath;
  }

  function writeItemFile(relative: string, content: string): string {
    const path = join(dir, relative);
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, content);
    return relative;
  }

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "moderno-lint-registry-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("fails on a block that hardcodes a colour", () => {
    const path = writeItemFile(
      "blocks/hero/react/hero.tsx",
      '<section style={{ background: "#ff0000" }} />',
    );
    const manifest = writeRegistry([
      { name: "hero-react", type: "registry:block", files: [{ path, type: "registry:block" }] },
    ]);
    const { stdout, stderr, out } = capture();

    expect(runCli(["--registry", manifest], { cwd: dir, stdout, stderr })).toBe(1);
    expect(out.some((l) => l.includes("moderno/no-hardcoded-color"))).toBe(true);
  });

  it("fails on a block that hardcodes a dimension in a Tailwind arbitrary value", () => {
    const path = writeItemFile(
      "blocks/hero/svelte/Hero.svelte",
      '<section class="max-w-[42rem]" />',
    );
    const manifest = writeRegistry([
      { name: "hero-svelte", type: "registry:block", files: [{ path, type: "registry:block" }] },
    ]);
    const { stdout, stderr, out } = capture();

    expect(runCli(["--registry", manifest], { cwd: dir, stdout, stderr })).toBe(1);
    expect(out.some((l) => l.includes("moderno/no-hardcoded-dimension"))).toBe(true);
  });

  it("passes a block that styles with contract-backed preset utilities", () => {
    const path = writeItemFile(
      "blocks/hero/react/hero.tsx",
      '<section className="@container max-w-md rounded-lg p-6 @md:grid-cols-3" />',
    );
    const manifest = writeRegistry([
      { name: "hero-react", type: "registry:block", files: [{ path, type: "registry:block" }] },
    ]);
    const { stdout, stderr, out } = capture();

    expect(runCli(["--registry", manifest], { cwd: dir, stdout, stderr })).toBe(0);
    expect(out.some((l) => l.includes("no violations"))).toBe(true);
  });

  it("reads the framework from the item's directory, so a Solid .tsx is not linted as React", () => {
    // Vue's fixture manifest has no `Dialog`; Solid's has no `Button` at all,
    // so a Solid file is validated against Solid's surface, not React's.
    const path = writeItemFile("blocks/hero/solid/hero.tsx", '<Button variant="primaryy" />');
    const manifest = writeRegistry([
      { name: "hero-solid", type: "registry:block", files: [{ path, type: "registry:block" }] },
    ]);
    const { stdout, stderr, out } = capture();

    runCli(["--registry", manifest], { cwd: dir, stdout, stderr });
    // React's fixture manifest would have produced a valid-props finding here.
    expect(out.some((l) => l.includes("moderno/valid-props"))).toBe(false);
  });

  it("skips theme items — a theme's whole job is to carry literal brand values", () => {
    const path = writeItemFile("themes/brand/theme.css", ":root { --primary: oklch(0.2 0 0); }");
    const manifest = writeRegistry([
      { name: "theme-brand", type: "registry:theme", files: [{ path, type: "registry:theme" }] },
    ]);
    const { stdout, stderr, err } = capture();

    // Nothing left to lint once themes are excluded — an empty set is an error,
    // not a silent pass, so a manifest that ships nothing lintable is visible.
    expect(runCli(["--registry", manifest], { cwd: dir, stdout, stderr })).toBe(2);
    expect(err.some((l) => l.includes("ships no files"))).toBe(true);
  });

  it("resolves file paths against the manifest's own directory, not the cwd", () => {
    const path = writeItemFile("blocks/hero/react/hero.tsx", "<section />");
    const manifest = writeRegistry([
      { name: "hero-react", type: "registry:block", files: [{ path, type: "registry:block" }] },
    ]);
    const { stdout, stderr, out } = capture();

    expect(runCli(["--registry", manifest], { cwd: tmpdir(), stdout, stderr })).toBe(0);
    expect(out.some((l) => l.includes("1 file checked"))).toBe(true);
  });

  it("exits 2 on a missing manifest", () => {
    const { stdout, stderr, err } = capture();

    expect(runCli(["--registry", join(dir, "nope.json")], { cwd: dir, stdout, stderr })).toBe(2);
    expect(err.some((l) => l.includes("no such registry manifest"))).toBe(true);
  });

  it("exits 2 on a malformed manifest instead of throwing", () => {
    const manifestPath = join(dir, "registry.json");
    writeFileSync(manifestPath, "{ not json");
    const { stdout, stderr, err } = capture();

    expect(runCli(["--registry", manifestPath], { cwd: dir, stdout, stderr })).toBe(2);
    expect(err.some((l) => l.includes("could not read registry manifest"))).toBe(true);
  });
});

describe("runCli with no @moderno manifests installed", () => {
  let emptyDir: string;

  afterEach(() => {
    rmSync(emptyDir, { recursive: true, force: true });
  });

  it("still runs framework-agnostic rules like no-hardcoded-color", () => {
    emptyDir = mkdtempSync(join(tmpdir(), "moderno-lint-cli-empty-"));
    const file = join(emptyDir, "styles.tsx");
    writeFileSync(file, 'const c = "#ff0000";');
    const out: string[] = [];
    const code = runCli([file], {
      cwd: emptyDir,
      stdout: (l) => out.push(l),
      stderr: () => {},
    });

    expect(code).toBe(1);
    expect(out.some((l) => l.includes("moderno/no-hardcoded-color"))).toBe(true);
  });
});
