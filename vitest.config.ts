import { defineConfig } from "vitest/config";

export default defineConfig({
  // Node by default; component/SSR suites opt into jsdom via a
  // `// @vitest-environment jsdom` docblock at the top of the file.
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["packages/**/*.test.ts", "packages/**/*.test.tsx"],
  },
});
