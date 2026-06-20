import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// SSR project: node environment, default (server) resolve conditions, so
// plugin-svelte compiles components for `svelte/server`'s `render()`. This is
// the F3.5 guarantee — the component produces static HTML with no client
// runtime, i.e. it works as a server-only Astro island. Runs *.ssr.test.ts.
export default defineConfig({
  plugins: [svelte()],
  test: {
    name: "svelte-ssr",
    environment: "node",
    include: ["test/**/*.ssr.test.ts"],
  },
});
