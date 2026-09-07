import { defineConfig } from "vitest/config";

export default defineConfig({
  // Node by default; component/SSR suites opt into jsdom via a
  // `// @vitest-environment jsdom` docblock at the top of the file.
  esbuild: {
    jsx: "automatic",
  },
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
    // The ported framework packages own their compiler plugin + env; they run
    // as separate workspace projects (see vitest.workspace.ts).
    exclude: ["**/node_modules/**", "packages/vue/**", "packages/solid/**", "packages/svelte/**"],
  },
});
