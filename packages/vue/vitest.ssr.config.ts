import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { registryAliases } from "../lint/src/registry.ts";

// SSR project: node environment + `@vitejs/plugin-vue`, so the registry's
// `<script setup>` SFCs are compiled exactly the way a consumer's build
// compiles them and are then actually run. The sibling `vue` project needs no
// plugin — the primitives are authored with `h()`, no SFC — so this project
// exists for the registry gate alone. Runs *.ssr.test.ts.
const manifest = fileURLToPath(new URL("../../registry/registry.json", import.meta.url));

// A registry source imports the primitives by name, and `registry/` has no
// `node_modules` to find them in. Node-mode tests get by (Vitest resolves bare
// imports from this package), but a jsdom-mode test compiles the SFC for the
// client and Vite resolves from the importer, so point the name at the source.
const primitives = fileURLToPath(new URL("./src/index.ts", import.meta.url));
// Same reason for core: a block that announces a change imports `announce()` by name.
const core = fileURLToPath(new URL("../core/src/index.ts", import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      ...registryAliases(manifest, "vue"),
      { find: /^@moderno-ui\/vue$/, replacement: primitives },
      { find: /^@moderno-ui\/core$/, replacement: core },
    ],
  },
  test: {
    name: "vue-ssr",
    environment: "node",
    include: ["test/**/*.ssr.test.ts"],
  },
});
