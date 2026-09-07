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
 * Tailwind's viewport breakpoint variants: the named scale (`md:`, `max-sm:`,
 * and the `md:max-lg:` range form built from them) and the **arbitrary** ones,
 * `min-[500px]:` / `max-[900px]:`. The arbitrary pair matters as much as the
 * named: it is the obvious next spelling for someone who wants a breakpoint the
 * preset does not name, and it is just as much a viewport query.
 *
 * The container variants a block *should* use carry a leading `@` — including
 * their own arbitrary forms, `@min-[400px]:` / `@max-[400px]:` — which the
 * preceding-character guard excludes here. Those are not viewport queries, and
 * the "three contract steps" check below is what rejects them.
 */
const VIEWPORT_VARIANT = /(?:^|[\s"'`:])(?:(?:max-)?(?:sm|md|lg|xl|2xl)|(?:min|max)-\[[^\]]*\]):/;

/**
 * Everything that can separate one class from the next inside an attribute —
 * brackets excluded, deliberately.
 */
const TOKEN_SEPARATOR = /[\s,`'"{}()]/;

/**
 * Splits a class attribute into tokens, keeping a bracketed segment whole.
 *
 * Splitting on `[` shreds exactly the shapes this gate exists to catch:
 * `min-[500px]:grid-cols-3` decomposes into `min-`, `500px`, `:grid-cols-3`,
 * none of which is a viewport variant, so a block could ship a breakpoint and
 * pass. A bracket opens an arbitrary value or an arbitrary variant and runs to
 * its matching `]` as one token; the one bracket that is not a token's is the
 * host dialect's own array (`class:list={['p-6']}`), recognised by the quote or
 * space that follows it. Same rule as the docs candidate extractor
 * (`apps/docs/scripts/tailwind.ts`), for the same reason.
 */
function classTokens(source: string): string[] {
  const out: string[] = [];
  for (const match of source.matchAll(CLASS_ATTRIBUTE)) {
    const value = match[1] ?? match[2] ?? match[3] ?? "";
    let token = "";
    let depth = 0;
    const flush = () => {
      if (token.length > 0) out.push(token);
      token = "";
    };
    for (let i = 0; i < value.length; i += 1) {
      const char = value[i]!;
      if (depth > 0) {
        token += char;
        if (char === "[") depth += 1;
        else if (char === "]") depth -= 1;
        continue;
      }
      if (char === "[") {
        const next = value[i + 1];
        if (token.length === 0 && (next === undefined || /[\s'"`]/.test(next))) continue;
        token += char;
        depth = 1;
        continue;
      }
      if (char === "]" || TOKEN_SEPARATOR.test(char)) {
        flush();
        continue;
      }
      token += char;
    }
    flush();
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

  it("matches the arbitrary breakpoint variants too", () => {
    // A breakpoint the preset does not name is still a breakpoint: these are
    // `@media (width >= 500px)` by another spelling.
    for (const token of [
      "min-[500px]:grid-cols-3",
      "max-[900px]:hidden",
      "hover:max-[40rem]:flex",
      "min-[calc(100%-2rem)]:block",
    ]) {
      expect(VIEWPORT_VARIANT.test(token), token).toBe(true);
    }
  });

  it("does not match the container variants or ordinary utilities", () => {
    for (const token of [
      "@md:grid-cols-3",
      "@container",
      "max-w-md",
      "grid",
      "text-sm",
      // Arbitrary *container* widths — not viewport queries. Out of vocabulary
      // (only @sm/@md/@lg exist here), which the three-steps check rejects.
      "@min-[400px]:flex",
      "@max-[400px]:hidden",
      // A dimension, not a breakpoint — `no-hardcoded-dimension`'s business.
      "max-w-[42rem]",
    ]) {
      expect(VIEWPORT_VARIANT.test(token), token).toBe(false);
    }
  });
});

describe("classTokens", () => {
  /**
   * The matcher above never sees a token the splitter has already taken apart.
   * `min-[500px]:grid-cols-3` split on `[` becomes three fragments, none of
   * which is a variant — a block could ship a viewport breakpoint and the gate
   * would report nothing.
   */
  it("keeps an arbitrary variant whole", () => {
    expect(classTokens('<div class="min-[500px]:grid-cols-3">')).toEqual([
      "min-[500px]:grid-cols-3",
    ]);
    expect(classTokens('<div class="max-[900px]:hidden p-6">')).toEqual([
      "max-[900px]:hidden",
      "p-6",
    ]);
  });

  it("keeps an arbitrary value whole and still unwraps the host array", () => {
    expect(classTokens('<div class="grid-cols-[repeat(auto-fit,minmax(0,1fr))]">')).toEqual([
      "grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
    ]);
    expect(classTokens("<div class:list={['p-6', '@container']}>")).toEqual(["p-6", "@container"]);
  });

  it("reads every dialect the registry authors in", () => {
    expect(classTokens('<div className="mt-6 @md:grid-cols-3">')).toEqual([
      "mt-6",
      "@md:grid-cols-3",
    ]);
  });
});

/**
 * The gate as a whole, on the shape that slipped past it: a source string is
 * what the checks above run over, so this is the same code path a real block
 * would take.
 */
describe("a viewport breakpoint in any spelling is caught", () => {
  const viewportBreakpoints = [
    '<div class="md:grid-cols-3">',
    '<div class="min-[500px]:grid-cols-3">',
    '<div class="max-[900px]:hidden">',
    '<div class="[@media(min-width:500px)]:flex">',
    "<style>@media (min-width: 500px) { .a { display: flex } }</style>",
  ];

  it.each(viewportBreakpoints)("%s", (source) => {
    const offenders = classTokens(source).filter((token) => VIEWPORT_VARIANT.test(token));
    expect(offenders.length > 0 || /@media\b/.test(source)).toBe(true);
  });

  it("leaves the container-query vocabulary alone", () => {
    const source = '<section class="@container"><ul class="@md:grid-cols-3 @lg:gap-6">';
    expect(classTokens(source).filter((token) => VIEWPORT_VARIANT.test(token))).toEqual([]);
    expect(source).not.toMatch(/@media\b/);
  });
});
