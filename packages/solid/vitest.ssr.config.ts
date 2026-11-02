import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";
import { registryAliases } from "../lint/src/registry.ts";

// SSR project: node environment + the default (server) resolve conditions, so
// `solid-js/web`'s `renderToString` is available and vite-plugin-solid compiles
// components for the server. Runs only the *.ssr.test.tsx smoke files.
// The registry gate mounts screens that import their blocks — and flows that
// import their screens — through the `@/` path `moderno add` writes, so this
// project resolves those aliases.
const manifest = fileURLToPath(new URL("../../registry/registry.json", import.meta.url));

// A registry source imports the primitives by name, and `registry/` has no
// `node_modules` to find them in, so point the name at the source.
const primitives = fileURLToPath(new URL("./src/index.tsx", import.meta.url));
// Same reason for core: a block that announces a change imports `announce()` by name.
const core = fileURLToPath(new URL("../core/src/index.ts", import.meta.url));

export default defineConfig({
  plugins: [solid({ ssr: true })],
  resolve: {
    alias: [
      ...registryAliases(manifest, "solid"),
      { find: /^@moderno-ui\/solid$/, replacement: primitives },
      { find: /^@moderno-ui\/core$/, replacement: core },
    ],
  },
  test: {
    name: "solid-ssr",
    environment: "node",
    include: ["test/**/*.ssr.test.tsx"],
    server: { deps: { inline: [/solid-js/, /@ark-ui\/solid/] } },
  },
});
