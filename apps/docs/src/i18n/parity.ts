import { isLocale, locales, splitId } from "./ui.ts";

export interface ParityResult {
  ok: boolean;
  /** Each locale+slug pair that is present in some locale but missing here. */
  missing: { locale: string; slug: string }[];
}

/**
 * Compare the slug sets of every locale. A docs page is only publishable when
 * its slug exists in *all* locales; the build fails otherwise so a half-finished
 * translation can never ship. Ids whose first segment is not a known locale
 * (drafts, fixtures) are ignored.
 */
export function checkParity(ids: string[]): ParityResult {
  const bySlug = new Map<string, Set<string>>();
  for (const id of ids) {
    const first = id.split("/")[0];
    if (!first || !isLocale(first)) continue;
    const { locale, slug } = splitId(id);
    if (!bySlug.has(slug)) bySlug.set(slug, new Set());
    bySlug.get(slug)!.add(locale);
  }

  const missing: { locale: string; slug: string }[] = [];
  for (const [slug, present] of bySlug) {
    for (const locale of locales) {
      if (!present.has(locale)) missing.push({ locale, slug });
    }
  }
  missing.sort((a, b) => a.slug.localeCompare(b.slug) || a.locale.localeCompare(b.locale));
  return { ok: missing.length === 0, missing };
}
