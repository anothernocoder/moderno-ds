/**
 * The DS's own documented usage must lint clean.
 *
 * `valid-props` compares markup against `moderno.agent.json`, and both sides
 * are generated: the manifest from the canonical React types, the snippets from
 * `AGENT_EXAMPLES`. Nothing tied the two together, so the rule could — and did
 * — report `<LineChart :x-ticks="3" />`, straight out of the Vue docs, as an
 * unknown prop. Running the real rule over every published example for every
 * shipped framework is the check that keeps a manifest change, a new snippet or
 * a rule tweak from making the DS fail its own linter.
 *
 * Each component's own cases live beside this file, in
 * `agent-examples/<slug>.test.ts`; the manifest they all read is built once per
 * run (see `../helpers/build-agent-manifests.ts`).
 */
import { describe, expect, it } from "vitest";
import { validProps } from "../../src/rules/valid-props.ts";
import { FRAMEWORKS, manifestsFor } from "../helpers/agent-manifests.ts";

describe("moderno/valid-props over the shipped examples", () => {
  it("reports nothing on any component's example in any framework", () => {
    const reported: string[] = [];

    for (const framework of FRAMEWORKS) {
      const manifests = manifestsFor(framework);
      const manifest = manifests.components[0]!;
      expect(manifest.components.length).toBeGreaterThan(0);

      for (const component of manifest.components) {
        for (const example of component.examples ?? []) {
          for (const finding of validProps.check({ code: example.code, framework, manifests })) {
            reported.push(`${framework}/${component.name} — ${example.title}: ${finding.message}`);
          }
        }
      }
    }

    expect(reported).toEqual([]);
  });
});
