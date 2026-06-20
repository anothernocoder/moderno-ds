/**
 * Vitest workspace — one project per toolchain.
 *
 * The root `vitest.config.ts` runs the React/core/css/tokens/charts suites
 * (Node + opt-in jsdom, React-flavoured esbuild JSX). The three ported
 * framework packages each need their own compiler plugin and environment, so
 * they bring their own `vitest.config.ts`. Listing them here lets a single
 * `vitest run` at the repo root execute all of them.
 */
export default [
  "./vitest.config.ts",
  "./packages/vue/vitest.config.ts",
  "./packages/solid/vitest.config.ts",
  "./packages/solid/vitest.ssr.config.ts",
  "./packages/svelte/vitest.config.ts",
  "./packages/svelte/vitest.ssr.config.ts",
];
