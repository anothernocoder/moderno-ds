import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

// Client/DOM project: vite-plugin-solid compiles components to DOM and the
// `browser` resolve condition pins solid-js to its client build, so jsdom mount
// tests behave like the browser. The SSR smoke runs in a separate node project
// (vitest.ssr.config.ts) where Solid compiles to its server renderer instead.
export default defineConfig({
  plugins: [solid()],
  resolve: { conditions: ["development", "browser"] },
  test: {
    name: "solid",
    environment: "jsdom",
    setupFiles: ["../../vitest.setup.ts"],
    include: ["test/**/*.test.tsx"],
    exclude: ["test/**/*.ssr.test.tsx"],
    server: { deps: { inline: [/solid-js/, /@ark-ui\/solid/] } },
  },
});
