import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
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
