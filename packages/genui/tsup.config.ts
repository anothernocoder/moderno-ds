import { defineConfig } from "tsup";

// `server` builds the library and its prompt with no React; `react` renders.
export default defineConfig({
  entry: ["src/server.ts", "src/react.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  treeshake: true,
});
