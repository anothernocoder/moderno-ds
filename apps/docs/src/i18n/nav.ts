/**
 * Sidebar shape. A page declares its own section name (`group`) and rank
 * (`order`) in its frontmatter, in its own language; the sidebar is whatever
 * falls out of that. Keeping the grouping here rather than inline in the layout
 * is what lets a test assert the sections exist in both locales — the slug
 * parity gate compares slugs, and would happily pass a page filed under a
 * section that only exists in English.
 */
export interface NavPage {
  slug: string;
  title: string;
  group: string;
  order: number;
}

export interface NavSection {
  group: string;
  pages: NavPage[];
}

/**
 * Group one locale's pages into sidebar sections. Pages are ranked by `order`;
 * a section is ranked by its first page, so moving a page up can promote its
 * whole section — which is how "Blocks" lands after "Components" without a
 * second ordering knob.
 */
export function sidebarSections(pages: readonly NavPage[]): NavSection[] {
  const sorted = [...pages].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  const sections = new Map<string, NavPage[]>();
  for (const page of sorted) {
    const existing = sections.get(page.group);
    if (existing) existing.push(page);
    else sections.set(page.group, [page]);
  }
  return [...sections].map(([group, groupPages]) => ({ group, pages: groupPages }));
}
