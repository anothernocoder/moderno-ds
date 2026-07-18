import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/bin.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  treeshake: true,
  // @moderno/tokens ships the contract as TS source; bundle it so dist stays
  // runnable by plain Node (the CLI) without a transpile step for deps.
  noExternal: ["@moderno/tokens"],
});
