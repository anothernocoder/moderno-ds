import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// Client/DOM project: plugin-svelte compiles components for the browser and the
// `browser` resolve condition pins Svelte to its client runtime for jsdom mount
// tests. The server-only island render is asserted in vitest.ssr.config.ts.
export default defineConfig({
  plugins: [svelte()],
  resolve: { conditions: ["browser"] },
  test: {
    name: "svelte",
    environment: "jsdom",
    setupFiles: ["../../vitest.setup.ts"],
    include: ["test/**/*.test.ts"],
    exclude: ["test/**/*.ssr.test.ts"],
  },
});
