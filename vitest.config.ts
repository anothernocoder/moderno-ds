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
    include: ["packages/**/*.test.ts", "packages/**/*.test.tsx"],
    // The ported framework packages own their compiler plugin + env; they run
    // as separate workspace projects (see vitest.workspace.ts).
    exclude: ["**/node_modules/**", "packages/vue/**", "packages/solid/**", "packages/svelte/**"],
  },
});
