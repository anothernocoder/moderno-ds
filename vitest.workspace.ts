/**
 * Vitest workspace — one project per toolchain.
 *
 * The root `vitest.config.ts` runs the React/core/css/charts suites
 * (Node + opt-in jsdom, React-flavoured esbuild JSX). The three ported
 * framework packages each need their own compiler plugin and environment, so
 * they bring their own `vitest.config.ts`. The lint-core agent-examples suites
 * share one manifest build through a globalSetup, so they are a project of
 * their own too. Listing them here lets a single `vitest run` at the repo root
 * execute all of them.
 */
export default [
  "./vitest.config.ts",
  "./packages/lint-core/vitest.agent-examples.config.ts",
  "./packages/vue/vitest.config.ts",
  "./packages/vue/vitest.ssr.config.ts",
  "./packages/solid/vitest.config.ts",
  "./packages/solid/vitest.ssr.config.ts",
  "./packages/svelte/vitest.config.ts",
  "./packages/svelte/vitest.ssr.config.ts",
];
