/**
 * Materializes a throwaway `node_modules/@moderno/*` tree from the committed
 * JSON fixtures in `test/fixtures/manifests/` — outside the repo tree (a real
 * temp dir, not a `test/fixtures/**\/node_modules/**` path), because
 * `node_modules/` is gitignored repo-wide and a fixture tree literally named
 * that way would silently never be tracked by git.
 *
 * The one copy of this fixture (CONTEXT.md: a single maintainer "prioritizes
 * DRY and automation over ad-hoc flexibility") — `packages/mcp` and
 * `packages/lint` both import it by relative path rather than each keeping
 * their own, since all three exercise the same `discoverManifests` this
 * package owns.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const manifestFixturesDir = fileURLToPath(new URL("../fixtures/manifests", import.meta.url));

/** Packages with a real, installed `dist/moderno.agent.json` in the fixture. */
const INSTALLED_WITH_MANIFEST = ["react", "vue", "tokens"] as const;

export interface ConsumerFixture {
  /** The consumer project root — pass this as `discoverManifests`' `cwd`. */
  dir: string;
  cleanup: () => void;
}

/**
 * Builds `<tmp>/node_modules/@moderno/{react,vue,tokens}/dist/moderno.agent.json`
 * from the fixture JSON, plus a `solid` package directory with no `dist` yet
 * (an installed `@moderno/*` package that hasn't been built) so discovery's
 * "skip what isn't there" path has something real to skip.
 */
export function createConsumerFixture(): ConsumerFixture {
  const dir = mkdtempSync(join(tmpdir(), "moderno-fixture-"));

  for (const pkg of INSTALLED_WITH_MANIFEST) {
    const distDir = join(dir, "node_modules", "@moderno", pkg, "dist");
    mkdirSync(distDir, { recursive: true });
    const manifest = readFileSync(join(manifestFixturesDir, `${pkg}.json`), "utf8");
    writeFileSync(join(distDir, "moderno.agent.json"), manifest);
  }

  mkdirSync(join(dir, "node_modules", "@moderno", "solid"), { recursive: true });

  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}
