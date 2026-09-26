import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { byReadingOrder, groupSiblings, pagerLinks, sidebarSections, type NavPage } from "./nav.ts";
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

  it("lists two pages that share an order in one group in the same sequence in every locale", () => {
    // The Spanish titles sort the other way round; the slug keeps the locales in step.
    const en = sidebarSections([
      { slug: "pricing", title: "Pricing", group: "Blocks", order: 104 },
      { slug: "empty-state", title: "Empty state", group: "Blocks", order: 104 },
    ]);
    const es = sidebarSections([
      { slug: "pricing", title: "Precios", group: "Bloques", order: 104 },
      { slug: "empty-state", title: "Estado vacío", group: "Bloques", order: 104 },
    ]);
    expect(en[0]!.pages.map((p) => p.slug)).toEqual(["empty-state", "pricing"]);
    expect(es[0]!.pages.map((p) => p.slug)).toEqual(["empty-state", "pricing"]);
  });
});

describe("groupSiblings", () => {
  const page = (slug: string, group: string, order: number): NavPage => ({
    slug,
    title: slug,
    group,
    order,
  });
  const pages = [
    page("alert-list", "Blocks", 103),
    page("button", "Components", 10),
    page("blocks", "Blocks", 100),
    page("login-form", "Blocks", 101),
    page("form-layout", "Blocks", 101),
  ];

  it("lists the other pages of the page's own group, in reading order", () => {
    expect(groupSiblings(pages, "blocks").map((p) => p.slug)).toEqual([
      "form-layout",
      "login-form",
      "alert-list",
    ]);
  });

  it("returns nothing for a slug it does not know", () => {
    expect(groupSiblings(pages, "missing")).toEqual([]);
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

  for (const locale of locales) {
    it(`${locale}: every tier's index page has pages to list`, () => {
      // The Blocks, Screens and Flows pages render <TierIndex />, the other
      // pages of their own group; an index with nothing under it is a broken page.
      const pages = readNavPages(locale);
      for (const index of ["blocks", "screens", "flows"]) {
        expect(groupSiblings(pages, index).length, index).toBeGreaterThan(0);
      }
    });
  }

  it("gives both locales the same number of sidebar sections", () => {
    const counts = locales.map((l) => sidebarSections(readNavPages(l)).length);
    expect(new Set(counts).size).toBe(1);
  });
});

describe("docs reading order — a property of the content, not of the loader", () => {
  for (const locale of locales) {
    it(`${locale}: every page has its own place in the reading order`, () => {
      // Pages may share an \`order\` (two sibling tickets picking the same one
      // is not a failure); what must never happen is two pages the comparator
      // cannot tell apart, which would leave their sequence to the loader.
      const pages = [...readNavPages(locale)].sort(byReadingOrder);
      const ties = pages.slice(1).filter((p, i) => byReadingOrder(pages[i]!, p) === 0);
      expect(ties.map((p) => p.slug)).toEqual([]);
    });
  }

  it("orders both locales identically — the two llms.txt files list the same sequence", () => {
    const sequences = locales.map((l) =>
      [...readNavPages(l)].sort(byReadingOrder).map((p) => p.slug),
    );
    expect(sequences[1]).toEqual(sequences[0]);
  });
});

describe("pagerLinks", () => {
  const page = (slug: string, group: string, order: number): NavPage => ({
    slug,
    title: slug,
    group,
    order,
  });
  // "late" sorts before "blocks" by `order`, but its section ranks first, so the
  // sidebar (and the pager) list it before "blocks".
  const sections = sidebarSections([
    page("button", "Components", 10),
    page("blocks", "Blocks", 100),
    page("select", "Components", 40),
    page("late", "Components", 150),
  ]);

  it("follows the sidebar order, across section boundaries", () => {
    expect(pagerLinks(sections, "select")).toEqual({
      prev: expect.objectContaining({ slug: "button" }),
      next: expect.objectContaining({ slug: "late" }),
    });
    expect(pagerLinks(sections, "late").next?.slug).toBe("blocks");
  });

  it("has no prev on the first page and no next on the last", () => {
    expect(pagerLinks(sections, "button").prev).toBeUndefined();
    expect(pagerLinks(sections, "blocks").next).toBeUndefined();
  });

  it("returns nothing for a page the sidebar does not list", () => {
    expect(pagerLinks(sections, "index")).toEqual({});
  });
});
