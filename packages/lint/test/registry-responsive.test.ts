import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { registryFiles, type RegistryFile } from "../src/registry.ts";

/**
 * The block half of the responsive policy (ADR-0005, CONTRACT.md "Responsive
 * policy"). Its primitive half — the `@media` allow-list over the shared
 * stylesheet — lives in `packages/core/test/components-css.media.test.ts`.
 *
 * A block is copied into a project the design system will never see, and
 * mounted at a width it cannot predict. Styling it against the viewport makes
 * it correct exactly once, on the page it was written for, and wrong in the
 * next sidebar. So every block in the registry is checked here for the two
 * shapes that mistake takes: a literal `@media` rule, and Tailwind's *viewport*
 * breakpoint variants (`md:`), which are one character away from the container
 * variants (`@md:`) and read identically at a glance.
 */

const manifest = fileURLToPath(new URL("../../../registry/registry.json", import.meta.url));

const blocks: RegistryFile[] = registryFiles(manifest).filter(
  (file) => file.type === "registry:block",
);

/** Class attribute values, across the four dialects blocks are authored in. */
const CLASS_ATTRIBUTE =
  /\b(?:class|className|class:list)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g;

/**
 * Tailwind's viewport breakpoint variants, including the `max-*` and range
 * forms. The container variants a block *should* use carry a leading `@`, which
 * the preceding-character guard excludes.
 */
const VIEWPORT_VARIANT = /(?:^|[\s"'`:])(?:max-)?(?:sm|md|lg|xl|2xl):/;

function classTokens(source: string): string[] {
  const out: string[] = [];
  for (const match of source.matchAll(CLASS_ATTRIBUTE)) {
    const value = match[1] ?? match[2] ?? match[3] ?? "";
    for (const token of value.split(/[\s,`'"[\]{}()]+/)) {
      if (token.length > 0) out.push(token);
    }
  }
  return out;
}

function read(file: RegistryFile): string {
  return readFileSync(file.path, "utf8");
}

describe("registry blocks — responsive to their container, not the viewport (ADR-0005)", () => {
  it("ships blocks to check", () => {
    expect(blocks.length).toBeGreaterThan(0);
  });

  it.each(blocks.map((file) => [file.item, file] as const))(
    "%s declares no @media rule",
    (_name, file) => {
      expect(read(file)).not.toMatch(/@media\b/);
    },
  );

  it.each(blocks.map((file) => [file.item, file] as const))(
    "%s uses no viewport breakpoint variant (md:), only container variants (@md:)",
    (_name, file) => {
      const offenders = classTokens(read(file)).filter((token) => VIEWPORT_VARIANT.test(token));
      expect(offenders).toEqual([]);
    },
  );

  it.each(blocks.map((file) => [file.item, file] as const))(
    "%s declares @container wherever it uses a container-query variant",
    (_name, file) => {
      const tokens = classTokens(read(file));
      const usesVariant = tokens.some((token) => /^@(?:sm|md|lg):/.test(token));
      if (!usesVariant) return;
      expect(
        tokens.includes("@container"),
        "a @sm:/@md:/@lg: variant needs a container to query — declare @container on the block root",
      ).toBe(true);
    },
  );

  it("keeps at least one block on the container-query path, so the mechanism stays exercised", () => {
    const responsive = blocks.filter((file) =>
      classTokens(read(file)).some((token) => /^@(?:sm|md|lg):/.test(token)),
    );
    expect(responsive.map((file) => file.item)).not.toEqual([]);
  });

  it("only reaches for the three contract steps — @xl: and up do not exist in this preset", () => {
    const offenders: string[] = [];
    for (const file of blocks) {
      for (const token of classTokens(read(file))) {
        if (/^@(?!container\b|sm:|md:|lg:)[\w[]/.test(token))
          offenders.push(`${file.item}: ${token}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("the viewport-variant matcher", () => {
  // The gate above is only as good as this distinction, and `@md:` vs `md:` is
  // exactly the typo it exists to catch.
  it("matches Tailwind's viewport variants", () => {
    for (const token of ["md:grid-cols-3", "max-sm:hidden", "lg:flex", "hover:md:flex"]) {
      expect(VIEWPORT_VARIANT.test(token), token).toBe(true);
    }
  });

  it("does not match the container variants or ordinary utilities", () => {
    for (const token of ["@md:grid-cols-3", "@container", "max-w-md", "grid", "text-sm"]) {
      expect(VIEWPORT_VARIANT.test(token), token).toBe(false);
    }
  });
});
