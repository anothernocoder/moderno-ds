/** A class value: a string, falsy placeholder, or a nested array of the same. */
export type ClassValue = string | number | null | undefined | false | ClassValue[];

/**
 * Join class values, dropping falsy ones and flattening arrays. A tiny clsx —
 * no dependency, no Tailwind-merge (components own their styles via tokens, so
 * consumers rarely need conflict resolution).
 */
export function cx(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (Array.isArray(value)) {
      const nested = cx(...value);
      if (nested) out.push(nested);
    } else {
      out.push(String(value));
    }
  }
  return out.join(" ");
}

/** Build the Ark-style `data-scope` / `data-part` attributes for a component part. */
export function partAttrs(
  scope: string,
  part: string,
): { "data-scope": string; "data-part": string } {
  return { "data-scope": scope, "data-part": part };
}
