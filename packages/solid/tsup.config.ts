import { defineConfig } from "tsup";
import { solidPlugin } from "esbuild-plugin-solid";

// The `import` artifact is the client (DOM) build for plain bundlers; SSR-aware
// consumers (solid-start, vite-plugin-solid) resolve the `solid` export
// condition to the raw source and compile it for their own target.
export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm"],
  dts: true,
  clean: true,
  treeshake: true,
  external: ["solid-js", "@ark-ui/solid", "@moderno/core"],
  esbuildPlugins: [solidPlugin()],
});
