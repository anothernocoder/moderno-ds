import { defineConfig } from "tsup";

// `server` builds the library and its prompt with no React; `react` renders.
export default defineConfig({
  entry: ["src/server.ts", "src/react.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  // `react` imports the manifests `with { type: "json" }`, which Node requires.
  // esbuild drops the attribute unless told it is supported, and tsup's rollup
  // tree-shaking pass rewrites it to `assert`, which Node 22 rejects.
  treeshake: false,
  esbuildOptions(options) {
    options.supported = { ...options.supported, "import-attributes": true };
  },
});
