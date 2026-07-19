/**
 * `@moderno/lint` — the ESLint face of `@moderno/lint-core`'s rule engine
 * (ADR-0003). Register under the `moderno` namespace so rule ids match the
 * shared `Rule.id` convention (`moderno/<name>`):
 *
 * ```js
 * import moderno from "@moderno/lint";
 * export default [...moderno.configs.recommended];
 * ```
 */
import { ALL_RULES } from "@moderno/lint-core";
import type { ESLint, Linter } from "eslint";
import { toESLintRule } from "./eslint-rule.ts";

/** `moderno/<name>` -> `<name>`, the key ESLint's `moderno/` namespace prefixes back on. */
function shortId(ruleId: string): string {
  return ruleId.slice(ruleId.indexOf("/") + 1);
}

const rules: Record<string, ReturnType<typeof toESLintRule>> = {};
const recommendedRules: Record<string, Linter.RuleSeverity> = {};
for (const rule of ALL_RULES) {
  const id = shortId(rule.id);
  rules[id] = toESLintRule(rule);
  recommendedRules[`moderno/${id}`] = rule.severity;
}

const plugin: ESLint.Plugin = {
  meta: { name: "@moderno/lint" },
  rules,
};

const recommended: Linter.Config[] = [
  {
    // No `.css`: validate-rules.md scopes no-hardcoded-color/dimension to CSS
    // too, but ESLint has no JS-parseable AST for a plain stylesheet — adding
    // it here without a CSS-aware language (`@eslint/css`) would just replace
    // "not linted" with spurious parse errors on every real .css file. The
    // CLI (`moderno-lint`) has no such gate and lints any file, .css included.
    files: ["**/*.{jsx,tsx,vue,svelte,astro}"],
    // A plain-JS/JSX default so the plugin works out of the box; a consumer's
    // own parser config for TSX/Vue/Svelte/Astro (typescript-eslint,
    // vue-eslint-parser, ...) composes with this rather than being replaced by
    // it — ESLint deep-merges `languageOptions` across matching configs, and
    // we never set `parser` ourselves.
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { moderno: plugin },
    rules: recommendedRules,
  },
];

export interface ModernoLintPlugin extends ESLint.Plugin {
  configs: { recommended: Linter.Config[] };
}

const modernoLint: ModernoLintPlugin = { ...plugin, configs: { recommended } };

export default modernoLint;
export { recommended };
