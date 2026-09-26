import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { contractTableMarkdown, isContractTableName } from "../../lib/contractTable.ts";
import { pageMarkdown, tierIndexMarkdown, type PropRow } from "../../lib/markdown.ts";
import { groupSiblings } from "../../i18n/nav.ts";
import { splitId, useTranslations } from "../../i18n/ui.ts";

// One `.md` twin per docs page per locale — the copy-as-markdown source and the
// per-component `.md` the registry/LLMs consume. Built statically alongside HTML.
export async function getStaticPaths() {
  const docs = (await getCollection("docs")).map((entry) => ({ entry, ...splitId(entry.id) }));
  return docs
    .filter((p) => p.slug !== "index")
    .map((p) => ({
      params: { lang: p.locale, slug: p.slug },
      props: { entry: p.entry, tier: tierPages(docs, p.locale, p.slug) },
    }));
}

interface TierPage {
  slug: string;
  title: string;
  description: string;
}

/** What a `<TierIndex />` on this page lists: the other pages of its sidebar group. */
function tierPages(
  docs: readonly { entry: CollectionEntry<"docs">; locale: string; slug: string }[],
  locale: string,
  slug: string,
): TierPage[] {
  const pages = docs
    .filter((p) => p.locale === locale)
    .map((p) => ({ ...p.entry.data, slug: p.slug }));
  return groupSiblings(pages, slug).map(({ slug, title, description }) => ({
    slug,
    title,
    description,
  }));
}

// The same generated JSON <PropsTable> renders, so the `.md` table can't drift
// from the HTML one.
const propModules = import.meta.glob<{ props: PropRow[] }>("../../generated/props/*.json", {
  eager: true,
});
function propsFor(component: string): PropRow[] | undefined {
  return Object.entries(propModules).find(([path]) => path.endsWith(`/${component}.json`))?.[1]
    .props;
}

interface Entry {
  id: string;
  data: { title: string; description: string };
  body?: string;
  /** Relative to the Astro root (apps/docs), from the glob loader. */
  filePath?: string;
}

export const GET: APIRoute = ({ props }) => {
  const { entry, tier } = props as { entry: Entry; tier: TierPage[] };
  const locale = splitId(entry.id).locale;
  const dir = entry.filePath ? dirname(resolve(process.cwd(), entry.filePath)) : undefined;
  const t = useTranslations(locale);
  const body = pageMarkdown({
    title: entry.data.title,
    description: entry.data.description,
    body: entry.body ?? "",
    resolve: {
      // A Preview's example is a `?raw` import of a real file (CONTEXT.md
      // "Example"): read that file, so the `.md` shows the source the page shows.
      raw: (specifier) => {
        if (!dir || !specifier.endsWith("?raw")) return undefined;
        try {
          return readFileSync(resolve(dir, specifier.slice(0, -"?raw".length)), "utf8");
        } catch {
          return undefined;
        }
      },
      props: propsFor,
      // The same rows <ContractTable> renders, from the contract and the
      // neutral defaults.
      contractTable: (table) =>
        isContractTableName(table) ? contractTableMarkdown(table, t) : undefined,
      tierIndex: () => tierIndexMarkdown(locale, tier),
    },
  });
  return new Response(body, { headers: { "content-type": "text/markdown; charset=utf-8" } });
};
