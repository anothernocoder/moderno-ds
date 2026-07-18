import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import { describe, expect, it } from "vitest";
import {
  buildComponentsManifest,
  buildContractManifest,
  type AgentGuidance,
} from "../src/agent-manifest.ts";

const schemaPath = fileURLToPath(
  new URL("../../../docs/prd/phase-7/moderno.agent.schema.json", import.meta.url),
);
const examplePath = fileURLToPath(
  new URL("../../../docs/prd/phase-7/example.react.moderno.agent.json", import.meta.url),
);
const reactTsConfig = fileURLToPath(
  new URL("../../../packages/react/tsconfig.json", import.meta.url),
);

const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
const ajv = new Ajv({ allowUnionTypes: true });
const validate = ajv.compile(schema);

const GUIDANCE: Record<string, AgentGuidance> = {
  Button: { intent: "A single click action." },
  Select: { intent: "Pick one option from a known, small-to-medium list." },
};

/**
 * The schema is the frozen contract (issue #41's first acceptance criterion):
 * both the hand-written PRD example and every manifest this package actually
 * builds must validate against it, or the freeze is broken.
 */
describe("moderno.agent.schema.json", () => {
  it("validates the PRD's filled example", () => {
    const example = JSON.parse(readFileSync(examplePath, "utf8"));
    const valid = validate(example);
    expect(validate.errors, JSON.stringify(validate.errors)).toBeNull();
    expect(valid).toBe(true);
  });

  it("validates a real components manifest built from the vertical slice", () => {
    const manifest = buildComponentsManifest({
      packageName: "@moderno/react",
      version: "0.1.0",
      framework: "react",
      reactTsConfigFilePath: reactTsConfig,
      guidance: GUIDANCE,
    });
    const valid = validate(manifest);
    expect(validate.errors, JSON.stringify(validate.errors)).toBeNull();
    expect(valid).toBe(true);
  });

  it("validates a real contract manifest built from @moderno/tokens", () => {
    const manifest = buildContractManifest("0.1.0");
    const valid = validate(manifest);
    expect(validate.errors, JSON.stringify(validate.errors)).toBeNull();
    expect(valid).toBe(true);
  });
});
