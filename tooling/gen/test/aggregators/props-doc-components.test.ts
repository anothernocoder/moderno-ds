import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import propsDocComponents from "../../src/aggregators/props-doc-components.ts";

const COMPONENTS_DIR = "tooling/props-doc/src/components";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "moderno-gen-props-doc-components-"));
  mkdirSync(join(root, COMPONENTS_DIR), { recursive: true });
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function addComponent(slug: string): void {
  writeFileSync(join(root, COMPONENTS_DIR, `${slug}.ts`), "export default {};\n");
}

describe("props-doc-components aggregator", () => {
  it("writes props-doc's component lists from the component folder", () => {
    expect(propsDocComponents.output).toBe("tooling/props-doc/src/components.generated.ts");
    expect(propsDocComponents.source).toBe("tooling/props-doc/src/components/*.ts");
  });

  it("imports every component file statically, sorted by slug", () => {
    addComponent("toggle-group");
    addComponent("button");
    addComponent("toggle");

    const body = propsDocComponents.generate({ root, outputs: [] });
    const imports = body.split("\n").filter((line) => line.includes('from "./components/'));
    expect(imports).toEqual([
      'import buttonComponent from "./components/button.ts";',
      'import toggleComponent from "./components/toggle.ts";',
      'import toggleGroupComponent from "./components/toggle-group.ts";',
    ]);
  });

  it("hands the files to assembleComponents in the same order and exports the three lists", () => {
    addComponent("pin-input");
    addComponent("button");

    const body = propsDocComponents.generate({ root, outputs: [] });
    expect(body).toContain(
      "export const { ENTRIES, AGENT_COMPONENTS, AGENT_EXAMPLES } = assembleComponents([\n" +
        "  buttonComponent,\n" +
        "  pinInputComponent,\n" +
        "]);\n",
    );
  });

  it("names an import so a reserved-word slug stays a valid identifier", () => {
    addComponent("switch");

    const body = propsDocComponents.generate({ root, outputs: [] });
    expect(body).toContain('import switchComponent from "./components/switch.ts";');
  });

  it("ignores files that are not TypeScript modules", () => {
    addComponent("button");
    writeFileSync(join(root, COMPONENTS_DIR, "README.md"), "# notes\n");

    const body = propsDocComponents.generate({ root, outputs: [] });
    expect(body).not.toContain("README");
  });
});
