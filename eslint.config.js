import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";

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
