import { Linter, type ESLint } from "eslint";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import moderno from "../src/index.ts";
import {
  createConsumerFixture,
  type ConsumerFixture,
} from "../../lint-core/test/helpers/consumer-fixture.ts";

let fixture: ConsumerFixture;

beforeAll(() => {
  fixture = createConsumerFixture();
});

afterAll(() => {
  fixture.cleanup();
});

function lint(code: string, filename: string) {
  const linter = new Linter({ cwd: fixture.dir, configType: "flat" });
  return linter.verify(code, moderno.configs.recommended, filename);
}

describe("@moderno/lint recommended config", () => {
  it("catches a hardcoded color, an invalid prop, and a raw-Ark import in one snippet (issue #44 AC)", () => {
    const code = [
      'import { Dialog } from "@ark-ui/react";',
      '<Button variant="primaryy" style={{ color: "#ff0000" }}>Save</Button>',
    ].join("\n");
    const messages = lint(code, "Screen.tsx");
    expect(messages.map((m) => m.ruleId).sort()).toEqual([
      "moderno/no-hardcoded-color",
      "moderno/no-raw-ark",
      "moderno/valid-props",
    ]);
  });

  it("returns no messages for clean, valid usage", () => {
    const messages = lint('<Button variant="primary">Save</Button>', "Screen.tsx");
    expect(messages).toHaveLength(0);
  });

  it("reports the finding's 1-based line and 0-based column", () => {
    const code = 'const x = "#ff0000";';
    const messages = lint(code, "Screen.tsx");
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ line: 1, column: 12 });
  });

  it("flags a data-part override that doesn't exist on the target primitive", () => {
    // The rule scans raw source text, not the AST, so a CSS-in-JS template
    // literal — realistic content for a .tsx file — carries the selector.
    const code =
      'const css = `[data-scope="dialog"][data-part="header"] { color: var(--foreground); }`;';
    const messages = lint(code, "Screen.tsx");
    expect(messages).toHaveLength(1);
    expect(messages[0]?.ruleId).toBe("moderno/valid-data-part-override");
  });

  it("warns (not errors) on a hand-rolled reimplementation of an existing primitive", () => {
    const messages = lint('<dialog role="dialog">...</dialog>', "Screen.tsx");
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      ruleId: "moderno/no-reimplemented-primitive",
      severity: 1,
    });
  });

  it("infers the framework from a .vue filename", () => {
    const messages = lint('<Button variant="primaryy" />', "Screen.vue");
    expect(messages.map((m) => m.ruleId)).toEqual(["moderno/valid-props"]);
  });

  it("honors an explicit `framework` option over the .tsx -> react default", () => {
    const linter = new Linter({ cwd: fixture.dir, configType: "flat" });
    const config: Linter.Config[] = [
      {
        files: ["**/*.tsx"],
        languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
        plugins: { moderno: moderno as ESLint.Plugin },
        rules: { "moderno/valid-props": ["error", { framework: "vue" }] },
      },
    ];
    // Solid has no manifest in the fixture, but Vue does — a "solid" .tsx file
    // with `framework: "vue"` should validate against Vue's manifest, not react's.
    const messages = linter.verify('<Button variant="primaryy" />', config, "Screen.tsx");
    expect(messages).toHaveLength(1);
    expect(messages[0]?.ruleId).toBe("moderno/valid-props");
  });
});
