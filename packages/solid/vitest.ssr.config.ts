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

export default defineConfig({
  plugins: [solid({ ssr: true })],
  resolve: { alias: registryAliases(manifest, "solid") },
  test: {
    name: "solid-ssr",
    environment: "node",
    include: ["test/**/*.ssr.test.tsx"],
    server: { deps: { inline: [/solid-js/, /@ark-ui\/solid/] } },
  },
});
