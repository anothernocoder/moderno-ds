import { fileURLToPath } from "node:url";
import { defineProject } from "vitest/config";

/**
 * The agent-examples suites: `moderno/valid-props` over the real components
 * manifest, one file per component.
 *
 * A project of its own for its globalSetup, which builds that manifest once per
 * run (a few seconds of ts-morph). Vitest runs a project's globalSetup only
 * when one of the project's files runs, so the rest of the root project doesn't
 * pay for it.
 */
export default defineProject({
  resolve: {
    alias: [
      // The same source entry the root project uses, so no prior build is needed.
      {
        find: /^@moderno-ui\/core$/,
        replacement: fileURLToPath(new URL("../core/src/index.ts", import.meta.url)),
      },
    ],
  },
  test: {
    name: "agent-examples",
    environment: "node",
    include: ["test/rules/agent-examples.test.ts", "test/rules/agent-examples/*.test.ts"],
    globalSetup: ["test/helpers/build-agent-manifests.ts"],
  },
});
