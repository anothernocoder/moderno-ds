/**
 * Shared helper for the cross-framework SSR string assertions.
 *
 * A server-rendered playground is one flat HTML string, so a whole-document
 * `toContain('data-size="sm"')` is satisfied by *any* recipe on the page — the
 * Buttons above the fields included — and would keep passing if the component
 * under test stopped emitting the attribute altogether. These helpers pick the
 * open tags of one Ark part out of that string so a recipe assertion can be
 * aimed at the element that is supposed to carry it.
 *
 * The tag scan is deliberately dumb (attribute values with `>` in them would
 * confuse it); the playgrounds render fixed markup, and keeping this a regex
 * avoids dragging a DOM parser into the Node-only SSR suites.
 */
export function partTags(html: string, scope: string, part: string): string[] {
  return (html.match(/<[a-zA-Z][^>]*>/g) ?? []).filter(
    (tag) => tag.includes(`data-scope="${scope}"`) && tag.includes(`data-part="${part}"`),
  );
}

/** The value of one attribute on a single open tag, or `undefined` when absent. */
export function attrOf(tag: string, name: string): string | undefined {
  return new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
}

/** The value of `attr` on every `scope`/`part` tag, in document order. */
export function partAttrs(
  html: string,
  scope: string,
  part: string,
  attr: string,
): (string | undefined)[] {
  return partTags(html, scope, part).map((tag) => attrOf(tag, attr));
}
