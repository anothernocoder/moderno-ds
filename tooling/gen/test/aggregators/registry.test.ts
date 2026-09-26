import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import registry from "../../src/aggregators/registry.ts";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "moderno-gen-registry-"));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function addUnit(tierAndName: string, unit: object): void {
  const dir = join(root, "registry", tierAndName);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "item.json"), JSON.stringify(unit));
}

function file(path: string, type: string) {
  return { path, type, target: `src/${path}` };
}

const shared = {
  title: "Pricing",
  description: "Pricing section composing the @moderno-ui/{framework} Button primitive.",
  version: "0.2.0",
  dependencies: ["@moderno-ui/{framework}"],
  registryDependencies: [],
};

function generate() {
  return JSON.parse(registry.generate({ root, outputs: [] }) as string);
}

describe("registry aggregator", () => {
  it("writes registry/registry.json from each unit's item.json", () => {
    expect(registry.output).toBe("registry/registry.json");
    expect(registry.source).toBe("registry/*/*/item.json");
  });

  it("keeps the manifest's header above the items", () => {
    const { items, ...header } = generate();
    expect(header).toEqual({
      $schema: "https://moderno.style/schema/registry.json",
      name: "moderno",
      homepage: "https://moderno.style",
    });
    expect(items).toEqual([]);
  });

  it("publishes a unit with a files list as one item named after its folder", () => {
    const files = [file("themes/theme-ocean/theme.css", "registry:theme")];
    addUnit("themes/theme-ocean", {
      ...shared,
      title: "Theme Ocean",
      description: "Ocean.",
      dependencies: [],
      files,
    });

    expect(generate().items).toEqual([
      {
        name: "theme-ocean",
        type: "registry:theme",
        version: "0.2.0",
        title: "Theme Ocean",
        description: "Ocean.",
        dependencies: [],
        registryDependencies: [],
        files,
      },
    ]);
  });

  it("publishes a unit with a files map as one item per framework, in framework order", () => {
    addUnit("blocks/pricing", {
      ...shared,
      files: {
        solid: [file("blocks/pricing/solid/pricing.tsx", "registry:block")],
        react: [file("blocks/pricing/react/pricing.tsx", "registry:block")],
        vue: [file("blocks/pricing/vue/Pricing.vue", "registry:block")],
      },
    });

    const items = generate().items;
    expect(items.map((item: { name: string }) => item.name)).toEqual([
      "pricing-react",
      "pricing-vue",
      "pricing-solid",
    ]);
    expect(items[1]).toEqual({
      name: "pricing-vue",
      type: "registry:block",
      version: "0.2.0",
      title: "Pricing (Vue)",
      description: "Pricing section composing the @moderno-ui/vue Button primitive.",
      dependencies: ["@moderno-ui/vue"],
      registryDependencies: [],
      files: [file("blocks/pricing/vue/Pricing.vue", "registry:block")],
    });
  });

  it("fills {framework} in registryDependencies, and takes a version per framework", () => {
    addUnit("screens/sign-in", {
      ...shared,
      title: "Sign in",
      version: { react: "0.1.1", vue: "0.1.2" },
      registryDependencies: ["login-form-{framework}"],
      files: {
        react: [file("screens/sign-in/react/sign-in.tsx", "registry:screen")],
        vue: [file("screens/sign-in/vue/SignIn.vue", "registry:screen")],
      },
    });

    const items = generate().items;
    expect(
      items.map(({ name, version, registryDependencies }: Record<string, unknown>) => ({
        name,
        version,
        registryDependencies,
      })),
    ).toEqual([
      { name: "sign-in-react", version: "0.1.1", registryDependencies: ["login-form-react"] },
      { name: "sign-in-vue", version: "0.1.2", registryDependencies: ["login-form-vue"] },
    ]);
  });

  it("sorts by tier rank, then unit name, whatever the folders' own order", () => {
    const one = (path: string, type: string) => ({ ...shared, files: [file(path, type)] });
    addUnit("flows/auth", one("flows/auth/auth.tsx", "registry:flow"));
    addUnit("screens/verify", one("screens/verify/verify.tsx", "registry:screen"));
    addUnit("blocks/pricing", one("blocks/pricing/pricing.tsx", "registry:block"));
    addUnit("blocks/alert-list", one("blocks/alert-list/alert-list.tsx", "registry:block"));
    addUnit("primitives/button", one("primitives/react/button.tsx", "registry:component"));
    addUnit("themes/theme-moderno", one("themes/theme-moderno/theme.css", "registry:theme"));
    addUnit("themes/theme-contrast", one("themes/theme-contrast/theme.css", "registry:theme"));

    expect(
      generate().items.map(({ name, type }: Record<string, string>) => `${type} ${name}`),
    ).toEqual([
      "registry:theme theme-contrast",
      "registry:theme theme-moderno",
      "registry:component button",
      "registry:block alert-list",
      "registry:block pricing",
      "registry:screen verify",
      "registry:flow auth",
    ]);
  });

  it("ignores a folder without an item.json", () => {
    mkdirSync(join(root, "registry/primitives/react"), { recursive: true });
    writeFileSync(join(root, "registry/primitives/react/button.tsx"), "export {};\n");

    expect(generate().items).toEqual([]);
  });

  it("refuses a framework it does not know", () => {
    addUnit("blocks/pricing", { ...shared, files: { angular: [] } });
    expect(generate).toThrow(/pricing: unknown framework angular/);
  });

  it("refuses a framework without a version", () => {
    addUnit("blocks/pricing", {
      ...shared,
      version: { react: "0.1.0" },
      files: { react: [], vue: [] },
    });
    expect(generate).toThrow(/pricing: no version for vue/);
  });

  it("refuses per-framework versions on a unit without frameworks", () => {
    addUnit("primitives/button", {
      ...shared,
      version: { react: "0.1.0" },
      files: [file("primitives/react/button.tsx", "registry:component")],
    });
    expect(generate).toThrow(/button: a unit without frameworks takes one version string/);
  });
});
