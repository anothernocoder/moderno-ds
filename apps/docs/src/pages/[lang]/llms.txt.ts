import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { llmsIndex } from "../../lib/markdown.ts";
import { locales, splitId } from "../../i18n/ui.ts";

const SITE = process.env.SITE_URL ?? "https://moderno.style";

export function getStaticPaths() {
  return locales.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang!;
  const pages = (await getCollection("docs"))
    .map((entry) => ({ entry, ...splitId(entry.id) }))
    .filter((p) => p.locale === lang && p.slug !== "index")
    .sort((a, b) => a.entry.data.order - b.entry.data.order)
    .map((p) => ({
      slug: p.slug,
      title: p.entry.data.title,
      description: p.entry.data.description,
    }));

  const body = llmsIndex({ siteName: "Moderno", baseUrl: SITE, locale: lang, pages });
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
};
