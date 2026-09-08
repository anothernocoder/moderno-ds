import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { byReadingOrder, sidebarSections, type NavPage } from "./nav.ts";
import { locales, type Locale } from "./ui.ts";

describe("sidebarSections", () => {
  const page = (slug: string, group: string, order: number): NavPage => ({
    slug,
    title: slug,
    group,
    order,
  });

  it("ranks a section by its first page", () => {
    const sections = sidebarSections([
      page("flows", "Flows", 120),
      page("button", "Components", 10),
      page("blocks", "Blocks", 100),
      page("select", "Components", 40),
    ]);
    expect(sections.map((s) => s.group)).toEqual(["Components", "Blocks", "Flows"]);
    expect(sections[0]!.pages.map((p) => p.slug)).toEqual(["button", "select"]);
  });

  it("breaks an order tie by slug so the sidebar is stable", () => {
    const sections = sidebarSections([page("b", "Guides", 5), page("a", "Guides", 5)]);
    expect(sections[0]!.pages.map((p) => p.slug)).toEqual(["a", "b"]);
  });
});

/** Frontmatter the sidebar reads, parsed without pulling in a YAML dependency. */
function readNavPages(locale: Locale): NavPage[] {
  const dir = fileURLToPath(new URL(`../content/docs/${locale}`, import.meta.url));
  return readdirSync(dir)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const source = readFileSync(join(dir, file), "utf8");
      const frontmatter = /^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? "";
      const field = (name: string) => new RegExp(`^${name}:\\s*(.+)$`, "m").exec(frontmatter)?.[1];
      return {
        slug,
        title: field("title") ?? slug,
        group: field("group") ?? "Components",
        order: Number(field("order") ?? 100),
      };
    })
    .filter((p) => p.slug !== "index");
}

describe("docs navigation — the registry tiers have their own sections", () => {
  const expected: Record<Locale, string[]> = {
    en: ["Blocks", "Screens", "Flows"],
    es: ["Bloques", "Pantallas", "Flujos"],
  };

  for (const locale of locales) {
    it(`${locale}: shows the three copy tiers, in tier order, after the primitives`, () => {
      const groups = sidebarSections(readNavPages(locale)).map((s) => s.group);
      const tiers = expected[locale];
      expect(groups).toEqual(expect.arrayContaining(tiers));
      const positions = tiers.map((g) => groups.indexOf(g));
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
      expect(Math.min(...positions)).toBeGreaterThan(
        groups.indexOf(locale === "en" ? "Components" : "Componentes"),
      );
    });
  }

  it("gives both locales the same number of sidebar sections", () => {
    const counts = locales.map((l) => sidebarSections(readNavPages(l)).length);
    expect(new Set(counts).size).toBe(1);
  });
});

describe("docs reading order — a property of the content, not of the loader", () => {
  for (const locale of locales) {
    it(`${locale}: every page claims its own \`order\``, () => {
      const orders = readNavPages(locale).map((p) => p.order);
      const duplicated = orders.filter((o, i) => orders.indexOf(o) !== i);
      expect(
        duplicated,
        `pages sharing an \`order\` leave their sequence to the content loader`,
      ).toEqual([]);
    });
  }

  it("orders both locales identically — the two llms.txt files list the same sequence", () => {
    const sequences = locales.map((l) =>
      [...readNavPages(l)].sort(byReadingOrder).map((p) => p.slug),
    );
    expect(sequences[1]).toEqual(sequences[0]);
  });
});
