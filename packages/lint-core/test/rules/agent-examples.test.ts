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
 * Deliberately built from source rather than read out of a package's built
 * `dist`: the manifest a consumer installs is exactly what
 * `buildComponentsManifest` produces, and building it here means the test
 * doesn't need a prior `pnpm -r build` to be meaningful.
 */
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildComponentsManifest } from "../../../../tooling/props-doc/src/agent-manifest.ts";
import { validProps } from "../../src/rules/valid-props.ts";
import type { AggregatedManifests, Framework } from "../../src/manifests.ts";

const reactTsConfig = fileURLToPath(
  new URL("../../../../packages/react/tsconfig.json", import.meta.url),
);

/** Every framework `AGENT_EXAMPLES` ships snippets for. */
const FRAMEWORKS: Framework[] = ["react", "vue", "svelte", "solid"];

function manifestsFor(framework: Framework): AggregatedManifests {
  return {
    components: [
      buildComponentsManifest({
        packageName: `@moderno-ui/${framework}`,
        version: "0.0.0",
        framework,
        reactTsConfigFilePath: reactTsConfig,
        guidance: {},
      }),
    ],
    contract: null,
    scopeDir: null,
  };
}

describe("moderno/valid-props over the shipped examples", () => {
  // Four ts-morph manifest builds in one test; the 5s default is not enough
  // under the full parallel run (see the root vitest.config.ts note).
  it("reports nothing on any component's example in any framework", { timeout: 60_000 }, () => {
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

describe("moderno/valid-props over the real Badge, Chip and Indicator manifest", () => {
  const manifests = manifestsFor("react");
  const check = (code: string) =>
    validProps.check({ code, framework: "react", manifests }).map((f) => f.message);

  it("accepts every prop the three bindings declare", { timeout: 30_000 }, () => {
    expect(check('<Badge variant="warning" size="sm" dot>Pending</Badge>')).toEqual([]);
    expect(
      check(
        '<Chip variant="muted" removable removeLabel="Remove React" onRemove={drop}>React</Chip>',
      ),
    ).toEqual([]);
    expect(check('<Indicator variant="success" size="sm" pulse>Online</Indicator>')).toEqual([]);
  });

  it("rejects an invented prop and a value outside the recipe", () => {
    expect(check('<Badge variant="danger">Failed</Badge>')).toEqual([
      expect.stringContaining('Invalid value "danger"'),
    ]);
    expect(check("<Indicator blink>Online</Indicator>")).toEqual([
      expect.stringContaining('Unknown prop "blink"'),
    ]);
  });
});

describe("moderno/valid-props over the real Skeleton and Spinner manifest", () => {
  const manifests = manifestsFor("react");
  const check = (code: string) =>
    validProps.check({ code, framework: "react", manifests }).map((f) => f.message);

  it("accepts every prop the two bindings declare", { timeout: 30_000 }, () => {
    expect(check('<Skeleton shape="circle" style={{ width: "3rem" }} />')).toEqual([]);
    expect(check('<Spinner size="lg" label="Loading invoices" />')).toEqual([]);
  });

  it("rejects an invented prop and a value outside the recipe", () => {
    expect(check('<Skeleton shape="square" />')).toEqual([
      expect.stringContaining('Invalid value "square"'),
    ]);
    expect(check('<Spinner size="xl" />')).toEqual([expect.stringContaining('Invalid value "xl"')]);
    expect(check("<Spinner speed={2} />")).toEqual([
      expect.stringContaining('Unknown prop "speed"'),
    ]);
  });
});

describe("moderno/valid-props over the real Avatar manifest", () => {
  const manifests = manifestsFor("react");
  const check = (code: string) =>
    validProps.check({ code, framework: "react", manifests }).map((f) => f.message);

  it("accepts the recipe props and Ark's own props on the root", { timeout: 30_000 }, () => {
    expect(
      check('<Avatar.Root size="sm" shape="square" onStatusChange={track}>AL</Avatar.Root>'),
    ).toEqual([]);
  });

  it("rejects a value outside the recipe", () => {
    expect(check('<Avatar.Root shape="rounded" />')).toEqual([
      expect.stringContaining('Invalid value "rounded"'),
    ]);
    expect(check('<Avatar.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});

describe("moderno/valid-props over the real Callout manifest", () => {
  const manifests = manifestsFor("react");
  const check = (code: string) =>
    validProps.check({ code, framework: "react", manifests }).map((f) => f.message);

  it("accepts the recipe prop and native attributes on the root", { timeout: 30_000 }, () => {
    expect(check('<Callout.Root variant="success" id="tip">Saved</Callout.Root>')).toEqual([]);
  });

  it("rejects a value outside the recipe and an invented prop", () => {
    expect(check('<Callout.Root variant="tip" />')).toEqual([
      expect.stringContaining('Invalid value "tip"'),
    ]);
    expect(check('<Callout.Root tone="soft" />')).toEqual([
      expect.stringContaining('Unknown prop "tone"'),
    ]);
  });
});

describe("moderno/valid-props over the real Switch manifest", () => {
  const manifests = manifestsFor("react");
  const check = (code: string) =>
    validProps.check({ code, framework: "react", manifests }).map((f) => f.message);

  it("accepts the recipe prop and Ark's own props on the root", { timeout: 30_000 }, () => {
    expect(
      check('<Switch.Root size="lg" checked={on} onCheckedChange={save} name="alerts" />'),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<Switch.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});

describe("moderno/valid-props over the real RadioGroup manifest", () => {
  const manifests = manifestsFor("react");
  const check = (code: string) =>
    validProps.check({ code, framework: "react", manifests }).map((f) => f.message);

  it("accepts the recipe prop and Ark's own props on the root", { timeout: 30_000 }, () => {
    expect(
      check(
        '<RadioGroup.Root size="lg" orientation="horizontal" value={plan} onValueChange={save} name="plan" />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<RadioGroup.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});

describe("moderno/valid-props over the real Toggle and ToggleGroup manifests", () => {
  const manifests = manifestsFor("react");
  const check = (code: string) =>
    validProps.check({ code, framework: "react", manifests }).map((f) => f.message);

  it("accepts the recipe props and Ark's own props on each root", { timeout: 30_000 }, () => {
    expect(
      check(
        '<Toggle.Root variant="outline" size="sm" pressed={bold} onPressedChange={setBold} aria-label="Bold" />',
      ),
    ).toEqual([]);
    expect(
      check(
        '<ToggleGroup.Root variant="outline" size="lg" multiple orientation="vertical" value={styles} onValueChange={save} />',
      ),
    ).toEqual([]);
  });

  it("rejects a variant or size outside the recipe", () => {
    expect(check('<Toggle.Root variant="solid" />')).toEqual([
      expect.stringContaining('Invalid value "solid"'),
    ]);
    expect(check('<ToggleGroup.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});

describe("moderno/valid-props over the real Tabs manifest", () => {
  const manifests = manifestsFor("react");
  const check = (code: string) =>
    validProps.check({ code, framework: "react", manifests }).map((f) => f.message);

  it("accepts the recipe props and Ark's own props on the root", { timeout: 30_000 }, () => {
    expect(
      check(
        '<Tabs.Root variant="enclosed" size="sm" orientation="vertical" activationMode="manual" value={tab} onValueChange={setTab} />',
      ),
    ).toEqual([]);
  });

  it("rejects a variant or size outside the recipe", () => {
    expect(check('<Tabs.Root variant="pill" />')).toEqual([
      expect.stringContaining('Invalid value "pill"'),
    ]);
    expect(check('<Tabs.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});

describe("moderno/valid-props over the real Accordion manifest", () => {
  const manifests = manifestsFor("react");
  const check = (code: string) =>
    validProps.check({ code, framework: "react", manifests }).map((f) => f.message);

  it("accepts the recipe props and Ark's own props on the root", { timeout: 30_000 }, () => {
    expect(
      check(
        '<Accordion.Root variant="enclosed" size="sm" multiple collapsible value={open} onValueChange={setOpen} />',
      ),
    ).toEqual([]);
  });

  it("rejects a variant or size outside the recipe", () => {
    expect(check('<Accordion.Root variant="card" />')).toEqual([
      expect.stringContaining('Invalid value "card"'),
    ]);
    expect(check('<Accordion.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});

describe("moderno/valid-props over the real Progress manifest", () => {
  const manifests = manifestsFor("react");
  const check = (code: string) =>
    validProps.check({ code, framework: "react", manifests }).map((f) => f.message);

  it("accepts the recipe prop and Ark's own props on the root", { timeout: 30_000 }, () => {
    expect(
      check('<Progress.Root size="sm" value={progress} min={0} max={10} orientation="vertical" />'),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<Progress.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});

describe("moderno/valid-props over the real Slider manifest", () => {
  const manifests = manifestsFor("react");
  const check = (code: string) =>
    validProps.check({ code, framework: "react", manifests }).map((f) => f.message);

  it("accepts the recipe prop and Ark's own props on the root", { timeout: 30_000 }, () => {
    expect(
      check(
        '<Slider.Root size="sm" defaultValue={[20, 80]} min={0} max={200} step={5} orientation="vertical" />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<Slider.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});

describe("moderno/valid-props over the real NumberInput manifest", () => {
  const manifests = manifestsFor("react");
  const check = (code: string) =>
    validProps.check({ code, framework: "react", manifests }).map((f) => f.message);

  it("accepts the recipe prop and Ark's own props on the root", { timeout: 30_000 }, () => {
    expect(
      check(
        '<NumberInput.Root size="sm" defaultValue="5" min={0} max={10} step={2} formatOptions={{ style: "percent" }} />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<NumberInput.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});

describe("moderno/valid-props over the real Pagination manifest", () => {
  const manifests = manifestsFor("react");
  const check = (code: string) =>
    validProps.check({ code, framework: "react", manifests }).map((f) => f.message);

  it("accepts the recipe prop and Ark's own props on the root", { timeout: 30_000 }, () => {
    expect(
      check(
        '<Pagination.Root size="sm" count={200} pageSize={20} defaultPage={3} siblingCount={2} />',
      ),
    ).toEqual([]);
  });

  it("rejects a size outside the recipe", () => {
    expect(check('<Pagination.Root size="xl" />')).toEqual([
      expect.stringContaining('Invalid value "xl"'),
    ]);
  });
});
