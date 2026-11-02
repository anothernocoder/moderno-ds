import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";
import vue from "eslint-plugin-vue";
import svelte from "eslint-plugin-svelte";
import astro from "eslint-plugin-astro";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.svelte-kit/**",
      "**/coverage/**",
      "node_modules/**",
      ".agents/**",
      "**/.astro/**",
      "**/.vercel/**",
      "apps/docs/public/r/**",
      "apps/docs/src/generated/**",
      // Stale worktrees from earlier workflow runs are whole copies of the repo.
      ".claude/worktrees/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // The preset's rules name no files, so they would also reach the defineComponent()
  // files in packages/vue, which hold several components by design.
  ...vue.configs["flat/recommended"].map((config) => ({ ...config, files: ["**/*.vue"] })),
  ...svelte.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ["**/*.vue", "**/*.svelte", "**/*.astro"],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
      globals: { ...globals.browser },
    },
  },
  {
    files: ["**/*.vue"],
    rules: {
      // Every docs example is named vue.vue and registry components have one-word
      // names like Cart. Both are imported by name, so they cannot clash with an
      // HTML element, which is what this rule guards against.
      "vue/multi-word-component-names": "off",
    },
  },
  {
    files: ["**/*.svelte"],
    rules: {
      // {#each items as _, index} must name the item, and {#each items, index}
      // needs a newer Svelte than the ^5.0.0 we support.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
      // {" "} is how a block keeps a leading space: Svelte trims a plain one, so
      // this rule's fix changes what renders.
      "svelte/no-useless-mustaches": "off",
    },
  },
  {
    // A section takes the props the generated App hands it without reading them:
    // `let {}: SectionProps = $props()` declares the type and nothing else.
    files: ["packages/svelte/playground/sections/*.svelte"],
    rules: {
      "no-empty-pattern": "off",
    },
  },
  {
    // Workflow scripts run inside Claude Code's Workflow runtime, which injects
    // these as free globals (see the workflow-authoring reference).
    files: [".claude/workflows/**/*.js"],
    languageOptions: {
      globals: {
        args: "readonly",
        agent: "readonly",
        phase: "readonly",
        log: "readonly",
        parallel: "readonly",
        pipeline: "readonly",
        workflow: "readonly",
        budget: "readonly",
      },
    },
  },
  prettier,
);
