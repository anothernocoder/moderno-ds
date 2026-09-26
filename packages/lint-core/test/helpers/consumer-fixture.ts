/**
 * Materializes a throwaway `node_modules/@moderno-ui/*` tree from the committed
 * JSON fixtures in `test/fixtures/manifests/` — outside the repo tree (a real
 * temp dir, not a `test/fixtures/**\/node_modules/**` path), because
 * `node_modules/` is gitignored repo-wide and a fixture tree literally named
 * that way would silently never be tracked by git.
 *
 * Each package is laid out where a real install puts it: at
 * `node_modules/<package name>`, the name taken from the manifest's own
 * `package` field, with a `package.json` beside it so Node can resolve it. The
 * fixture therefore can't disagree with the published scope.
 *
 * The one copy of this fixture (CONTEXT.md: a single maintainer "prioritizes
 * DRY and automation over ad-hoc flexibility") — `packages/mcp` and
 * `packages/lint` both import it by relative path rather than each keeping
 * their own, since all three exercise the same `discoverManifests` this
 * package owns.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const manifestFixturesDir = fileURLToPath(new URL("../fixtures/manifests", import.meta.url));

/** Packages with a real, installed `dist/moderno.agent.json` in the fixture. */
const INSTALLED_WITH_MANIFEST = ["react", "vue", "css"] as const;

/** An installed package that hasn't been built yet: no `dist` at all. */
const INSTALLED_WITHOUT_MANIFEST = "@moderno-ui/solid";

export interface ConsumerFixture {
  /** The consumer project root — pass this as `discoverManifests`' `cwd`. */
  dir: string;
  cleanup: () => void;
}

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, "utf8"));
}

/**
 * The fixture manifest for one package, as the text its `moderno.agent.json`
 * would hold. A package with many components keeps them one file each — a
 * folder with `_package.json` (every field but `components`) and
 * `components/<slug>.json` — so adding a component to the fixture is adding a
 * file; the rest are a single `<name>.json`.
 */
function readManifestFixture(fixture: string): string {
  const folder = join(manifestFixturesDir, fixture);
  if (!existsSync(folder)) return readFileSync(`${folder}.json`, "utf8");

  const componentsDir = join(folder, "components");
  const components = readdirSync(componentsDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => readJson(join(componentsDir, file)));
  const pkg = readJson(join(folder, "_package.json")) as object;
  return JSON.stringify({ ...pkg, components }, null, 2);
}

function installPackage(nodeModulesDir: string, name: string, version: string): string {
  const packageDir = join(nodeModulesDir, name);
  mkdirSync(packageDir, { recursive: true });
  writeFileSync(join(packageDir, "package.json"), JSON.stringify({ name, version }));
  return packageDir;
}

/**
 * Builds `<tmp>/node_modules/@moderno-ui/{react,vue,css}/dist/moderno.agent.json`
 * from the fixture JSON, plus a `solid` package directory with no `dist` yet
 * (an installed `@moderno-ui/*` package that hasn't been built) so discovery's
 * "skip what isn't there" path has something real to skip.
 */
export function createConsumerFixture(): ConsumerFixture {
  const dir = mkdtempSync(join(tmpdir(), "moderno-fixture-"));
  const nodeModulesDir = join(dir, "node_modules");

  for (const fixture of INSTALLED_WITH_MANIFEST) {
    const json = readManifestFixture(fixture);
    const { package: name, version } = JSON.parse(json) as { package: string; version: string };
    const distDir = join(installPackage(nodeModulesDir, name, version), "dist");
    mkdirSync(distDir);
    writeFileSync(join(distDir, "moderno.agent.json"), json);
  }

  installPackage(nodeModulesDir, INSTALLED_WITHOUT_MANIFEST, "0.5.0");

  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}
