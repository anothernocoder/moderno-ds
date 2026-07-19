/**
 * Wraps one `@moderno/lint-core` `Rule` as an ESLint flat-config rule module.
 * The shared rule is a pure text-in/findings-out function — no AST needed —
 * so the adapter just needs the full source text (`Program:exit`, once per
 * file, regardless of what parser produced the tree) and a `framework` to
 * check it against. Manifests are discovered once per `cwd` and cached, the
 * same "read node_modules once" contract `@moderno/mcp` follows.
 */
import type { Rule as ESLintRule } from "eslint";
import {
  discoverManifests,
  type AggregatedManifests,
  type Framework,
  type Rule as SharedRule,
} from "@moderno/lint-core";
import { FRAMEWORKS, frameworkFromFilename } from "./framework.ts";

const manifestsByCwd = new Map<string, AggregatedManifests>();

function getManifests(cwd: string): AggregatedManifests {
  let manifests = manifestsByCwd.get(cwd);
  if (!manifests) {
    manifests = discoverManifests(cwd);
    manifestsByCwd.set(cwd, manifests);
  }
  return manifests;
}

interface RuleOptions {
  /** Override the extension-based framework guess (needed for Solid's `.tsx`). */
  framework?: Framework;
}

export function toESLintRule(rule: SharedRule): ESLintRule.RuleModule {
  return {
    meta: {
      type: rule.severity === "error" ? "problem" : "suggestion",
      docs: {
        description: rule.id,
      },
      // No `fixable` here even for rules with `rule.fixable === true`: that
      // flag names a category of violation as fix-eligible, but `Finding`
      // carries only a prose `suggestion`, never a fix range/replacement —
      // nothing in `@moderno/lint-core` produces one yet. Declaring
      // `meta.fixable` without ever calling `context.report({ fix })` would
      // advertise a `--fix` capability this rule can't deliver.
      schema: [
        {
          type: "object",
          properties: {
            framework: { enum: FRAMEWORKS },
          },
          additionalProperties: false,
        },
      ],
    },
    create(context) {
      return {
        "Program:exit"() {
          const options = (context.options[0] ?? {}) as RuleOptions;
          const framework = options.framework ?? frameworkFromFilename(context.filename);
          if (rule.frameworks !== "all" && !rule.frameworks.includes(framework)) return;

          const manifests = getManifests(context.cwd);
          const code = context.sourceCode.getText();
          for (const finding of rule.check({ code, framework, manifests })) {
            context.report({
              loc: { line: finding.loc.line, column: Math.max(finding.loc.col - 1, 0) },
              message: finding.suggestion
                ? `${finding.message} ${finding.suggestion}`
                : finding.message,
            });
          }
        },
      };
    },
  };
}
