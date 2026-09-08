import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { registryBlockAliases } from "../lint/src/registry.ts";

// SSR project: node environment + `@vitejs/plugin-vue`, so the registry's
// `<script setup>` SFCs are compiled exactly the way a consumer's build
// compiles them and are then actually run. The sibling `vue` project needs no
// plugin — the primitives are authored with `h()`, no SFC — so this project
// exists for the registry gate alone. Runs *.ssr.test.ts.
const manifest = fileURLToPath(new URL("../../registry/registry.json", import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: registryBlockAliases(manifest, "vue") },
  test: {
    name: "vue-ssr",
    environment: "node",
    include: ["test/**/*.ssr.test.ts"],
  },
});
