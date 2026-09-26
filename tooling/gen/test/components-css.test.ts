import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import componentsCss from "../src/aggregators/components-css.ts";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "moderno-gen-css-"));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

/** Writes `packages/core/src/styles/components/<file>` under the temp root. */
function partial(file: string, css: string): void {
  const dir = join(root, "packages/core/src/styles/components");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, file), css);
}

describe("components-css aggregator", () => {
  it("writes the one published stylesheet from the partials beside it", () => {
    expect(componentsCss.output).toBe("packages/core/src/styles/components.css");
    expect(componentsCss.source).toBe("packages/core/src/styles/components/*.css");
  });

  it("wraps the scopes, sorted, in the components layer between _base and _hidden", () => {
    partial("_base.css", "@layer moderno.base, moderno.components;\n");
    partial("_hidden.css", "[hidden] {\n  display: none;\n}\n");
    partial("tabs.css", '[data-scope="tabs"] {\n  gap: 0;\n}\n');
    partial("button.css", '/* Button */\n[data-scope="button"] {\n\n  gap: 0;\n}\n');

    expect(componentsCss.generate({ root, outputs: [] })).toBe(
      "@layer moderno.base, moderno.components;\n" +
        "\n" +
        "@layer moderno.components {\n" +
        "  /* Button */\n" +
        '  [data-scope="button"] {\n' +
        "\n" +
        "    gap: 0;\n" +
        "  }\n" +
        "\n" +
        '  [data-scope="tabs"] {\n' +
        "    gap: 0;\n" +
        "  }\n" +
        "\n" +
        "  [hidden] {\n" +
        "    display: none;\n" +
        "  }\n" +
        "}\n",
    );
  });

  it("ignores files that are not stylesheets", () => {
    partial("_base.css", "/* base */\n");
    partial("_hidden.css", "/* hidden */\n");
    partial("README.md", "# not css\n");

    expect(componentsCss.generate({ root, outputs: [] })).toBe(
      "/* base */\n\n@layer moderno.components {\n  /* hidden */\n}\n",
    );
  });
});
