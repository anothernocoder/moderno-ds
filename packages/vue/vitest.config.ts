import { defineConfig } from "vitest/config";

// Vue components are authored with `h()` (no SFC), so no `@vitejs/plugin-vue`
// is needed — the runtime renders them directly. jsdom for mount tests; the
// SSR smoke uses `@vue/server-renderer` and runs fine under jsdom too.
export default defineConfig({
  test: {
    name: "vue",
    environment: "jsdom",
    setupFiles: ["../../vitest.setup.ts"],
    include: ["test/**/*.test.ts"],
  },
});
