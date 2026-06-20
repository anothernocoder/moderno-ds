import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

// SSR project: node environment + the default (server) resolve conditions, so
// `solid-js/web`'s `renderToString` is available and vite-plugin-solid compiles
// components for the server. Runs only the *.ssr.test.tsx smoke files.
export default defineConfig({
  plugins: [solid({ ssr: true })],
  test: {
    name: "solid-ssr",
    environment: "node",
    include: ["test/**/*.ssr.test.tsx"],
    server: { deps: { inline: [/solid-js/, /@ark-ui\/solid/] } },
  },
});
