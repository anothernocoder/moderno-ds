import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { registryAliases } from "../lint/src/registry.ts";

// SSR project: node environment, default (server) resolve conditions, so
// plugin-svelte compiles components for `svelte/server`'s `render()`. This is
// the F3.5 guarantee — the component produces static HTML with no client
// runtime, i.e. it works as a server-only Astro island. Runs *.ssr.test.ts.
// The registry gate mounts screens that import their blocks — and flows that
// import their screens — through the `@/` path `moderno add` writes, so this
// project resolves those aliases.
const manifest = fileURLToPath(new URL("../../registry/registry.json", import.meta.url));

// A block that announces a change imports `announce()` from core by name, and
// `registry/` has no `node_modules` to find it in: point the name at core's
// source, whose own imports then resolve from core.
const core = fileURLToPath(new URL("../core/src/index.ts", import.meta.url));

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: [
      ...registryAliases(manifest, "svelte"),
      { find: /^@moderno-ui\/core$/, replacement: core },
    ],
  },
  test: {
    name: "svelte-ssr",
    environment: "node",
    include: ["test/**/*.ssr.test.ts"],
  },
});
