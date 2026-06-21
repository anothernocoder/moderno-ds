import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { pageMarkdown } from "../../lib/markdown.ts";
import { splitId } from "../../i18n/ui.ts";

// One `.md` twin per docs page per locale — the copy-as-markdown source and the
// per-component `.md` the registry/LLMs consume. Built statically alongside HTML.
export async function getStaticPaths() {
  const docs = await getCollection("docs");
  return docs
    .map((entry) => ({ entry, ...splitId(entry.id) }))
    .filter((p) => p.slug !== "index")
    .map((p) => ({ params: { lang: p.locale, slug: p.slug }, props: { entry: p.entry } }));
}

export const GET: APIRoute = ({ props }) => {
  const entry = (
    props as { entry: { data: { title: string; description: string }; body?: string } }
  ).entry;
  const body = pageMarkdown({
    title: entry.data.title,
    description: entry.data.description,
    body: entry.body ?? "",
  });
  return new Response(body, { headers: { "content-type": "text/markdown; charset=utf-8" } });
};
