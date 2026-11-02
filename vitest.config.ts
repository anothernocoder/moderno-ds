import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { registryAliases } from "./packages/lint/src/registry.ts";

/**
 * One project per toolchain.
 *
 * The first project here runs the React/core/css/charts suites (Node + opt-in
 * jsdom, React-flavoured esbuild JSX). The three ported framework packages each
 * need their own compiler plugin and environment, so they bring their own
 * `vitest.config.ts`. The lint-core agent-examples suites share one manifest
 * build through a globalSetup, so they are a project of their own too. Listing
 * them here lets a single `vitest run` at the repo root execute all of them.
 */

// The registry gate mounts screens that import their blocks — and flows that
// import their screens — through the `@/` path `moderno add` writes, so this
// project resolves those aliases (the three ported frameworks do the same in
// their own SSR projects).
const manifest = fileURLToPath(new URL("./registry/registry.json", import.meta.url));

// `registry/` is not a package: it has no `node_modules` of its own, so a
// registry source's bare `react` import has nothing to resolve against when the
// gate mounts it from here. Point it at the same copy `@moderno-ui/react` uses,
// so the component under test and the renderer share one React.
const reactDir = fileURLToPath(new URL("./packages/react/node_modules/react", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      ...registryAliases(manifest, "react").map(({ find, replacement }) => ({
        find,
        replacement,
      })),
      { find: /^react$/, replacement: reactDir },
      { find: /^react\/(.*)$/, replacement: `${reactDir}/$1` },
      // Same reason, one level up: the blocks a screen composes import the
      // published primitives by name. The source entry rather than `dist/`, so
      // the gate needs no prior build.
      {
        find: /^@moderno-ui\/react$/,
        replacement: fileURLToPath(new URL("./packages/react/src/index.ts", import.meta.url)),
      },
      // The ejected primitive skips the package and composes the recipes
      // directly, which is the whole point of ejecting.
      {
        find: /^@moderno-ui\/core$/,
        replacement: fileURLToPath(new URL("./packages/core/src/index.ts", import.meta.url)),
      },
    ],
  },
  // Node by default; component/SSR suites opt into jsdom via a
  // `// @vitest-environment jsdom` docblock at the top of the file.
  esbuild: {
    jsx: "automatic",
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "react-core",
          environment: "node",
          setupFiles: ["./vitest.setup.ts"],
          // The props-doc suites build ts-morph projects over the framework
          // packages; under the full parallel run on a CI runner they exceed the
          // 5s default (observed 5-10s). A ceiling, not a target.
          testTimeout: 30_000,
          include: [
            "packages/**/*.test.ts",
            "packages/**/*.test.tsx",
            "tooling/**/*.test.ts",
            "apps/**/*.test.ts",
          ],
          // The ported framework packages own their compiler plugin + env, and the
          // agent-examples suites their globalSetup; they run as the separate
          // projects listed below.
          exclude: [
            "**/node_modules/**",
            "packages/vue/**",
            "packages/solid/**",
            "packages/svelte/**",
            "packages/lint-core/test/rules/agent-examples.test.ts",
            "packages/lint-core/test/rules/agent-examples/**",
          ],
        },
      },
      "./packages/lint-core/vitest.agent-examples.config.ts",
      "./packages/vue/vitest.config.ts",
      "./packages/vue/vitest.ssr.config.ts",
      "./packages/solid/vitest.config.ts",
      "./packages/solid/vitest.ssr.config.ts",
      "./packages/svelte/vitest.config.ts",
      "./packages/svelte/vitest.ssr.config.ts",
    ],
  },
});
