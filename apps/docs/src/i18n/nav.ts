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
 * The reading order of docs pages, shared by every surface that lists them —
 * the sidebar, the index card grid, `llms.txt`. `order` decides it; the slug is
 * the tie-break, so two pages that share an `order` can never fall back to
 * whatever sequence the content loader happened to yield. `order` values are
 * unique per locale (a test holds that), so the tie-break should stay unused —
 * it is here so a future duplicate is merely redundant, not silently unstable.
 */
export function byReadingOrder(
  a: { slug: string; order: number },
  b: { slug: string; order: number },
): number {
  return a.order - b.order || a.slug.localeCompare(b.slug);
}

/**
 * Group one locale's pages into sidebar sections. Pages are ranked by `order`;
 * a section is ranked by its first page, so moving a page up can promote its
 * whole section — which is how "Blocks" lands after "Components" without a
 * second ordering knob.
 */
export function sidebarSections(pages: readonly NavPage[]): NavSection[] {
  const sorted = [...pages].sort(byReadingOrder);
  const sections = new Map<string, NavPage[]>();
  for (const page of sorted) {
    const existing = sections.get(page.group);
    if (existing) existing.push(page);
    else sections.set(page.group, [page]);
  }
  return [...sections].map(([group, groupPages]) => ({ group, pages: groupPages }));
}

export interface PagerLinks {
  prev?: NavPage;
  next?: NavPage;
}

/**
 * The previous and next page for the pager at the foot of a docs page — the
 * neighbours in the order the sidebar lists them (its sections flattened), so
 * reading "Next" walks the sidebar top to bottom. Crosses section boundaries;
 * the first page has no `prev`, the last no `next`, and a slug the sidebar
 * does not list gets neither.
 */
export function pagerLinks(sections: readonly NavSection[], slug: string): PagerLinks {
  const flat = sections.flatMap((s) => s.pages);
  const i = flat.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { prev: flat[i - 1], next: flat[i + 1] };
}
