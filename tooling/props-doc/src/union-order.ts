/**
 * A fixed order for the members of a printed union type.
 *
 * TypeScript prints a union's members in the order its checker first created
 * each one. When one ts-morph program resolves many components, that order
 * depends on which components came first: resolving Badge (`"outline"`) before
 * Button turns Button's `"primary" | "secondary" | "outline" | …` into
 * `"outline" | "primary" | …`. The prop `type` text, and the `propsHash` built
 * from it, would then change whenever a component is added, removed or
 * renamed. Reordering the printed members makes each component's text depend
 * on that component alone.
 */

/** Splits type text on the `|` that separate its top-level union members. */
function splitTopLevelUnion(text: string): string[] {
  const members: string[] = [];
  let depth = 0;
  let quote: string | undefined;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (quote) {
      if (char === "\\") i++;
      else if (char === quote) quote = undefined;
    } else if (char === '"' || char === "'" || char === "`") {
      quote = char;
    } else if (char === "=" && text[i + 1] === ">") {
      // A top-level arrow means the whole type is a function returning
      // whatever follows it: not a union of its own.
      if (depth === 0) return [text];
      i++;
    } else if ("([{<".includes(char)) {
      depth++;
    } else if (")]}>".includes(char)) {
      depth--;
    } else if (char === "|" && depth === 0) {
      members.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  members.push(text.slice(start).trim());
  return members;
}

/** Code-point order: unlike `localeCompare`, the same on every machine. */
function compareCodePoints(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Reorders the top-level members of a printed union: members named in
 * `declarationOrder` (a recipe's variant values, as declared) come first, in
 * that order; every other member follows, sorted. Text that is not a union is
 * returned as it is.
 */
export function orderUnionMembers(
  typeText: string,
  declarationOrder: readonly string[] = [],
): string {
  const members = splitTopLevelUnion(typeText);
  if (members.length < 2) return typeText;

  const declared = new Map(declarationOrder.map((value, index) => [JSON.stringify(value), index]));
  const rank = (member: string) => declared.get(member) ?? declarationOrder.length;
  return members.sort((a, b) => rank(a) - rank(b) || compareCodePoints(a, b)).join(" | ");
}
