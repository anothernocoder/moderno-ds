import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/bin.ts",
    "src/agent-manifest.ts",
    "src/contract-manifest.ts",
    "src/bin-agent-manifest.ts",
    "src/bin-check-agent-drift.ts",
  ],
  format: ["esm"],
  dts: {
    entry: {
      index: "src/index.ts",
      "agent-manifest": "src/agent-manifest.ts",
      "contract-manifest": "src/contract-manifest.ts",
    },
  },
  clean: true,
  target: "node22",
});
