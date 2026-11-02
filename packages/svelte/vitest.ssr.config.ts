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

// A registry source imports the primitives by name, and `registry/` has no
// `node_modules` to find them in, so point the name at the source.
const primitives = fileURLToPath(new URL("./src/index.ts", import.meta.url));
// Same reason for core: a block that announces a change imports `announce()` by name.
const core = fileURLToPath(new URL("../core/src/index.ts", import.meta.url));

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: [
      ...registryAliases(manifest, "svelte"),
      { find: /^@moderno-ui\/svelte$/, replacement: primitives },
      { find: /^@moderno-ui\/core$/, replacement: core },
    ],
  },
  test: {
    name: "svelte-ssr",
    environment: "node",
    include: ["test/**/*.ssr.test.ts"],
  },
});
