/**
 * CVA — resolve component props to deterministic `data-*` attributes.
 *
 * Unlike class-variance-authority (which emits class strings), Moderno resolves
 * variants to data-attributes on `[data-part=root]`, so one shared stylesheet
 * styles every framework. The resolver is pure and SSR-safe: same input → same
 * output, no DOM, no globals.
 */

/** A variant definition: prop name → the set of allowed string values. */
export type VariantsDef = Record<string, readonly string[]>;

/** The props a `cva` resolver accepts, derived from its variant table. */
export type VariantProps<V extends VariantsDef> = {
  [K in keyof V]?: V[K][number];
};

export interface CvaConfig<V extends VariantsDef> {
  variants: V;
  defaultVariants?: Partial<VariantProps<V>>;
}

export interface Cva<V extends VariantsDef> {
  (props?: VariantProps<V>): Record<string, string>;
  /** The variant schema, exposed for docs/introspection (e.g. PropsTable). */
  readonly variants: V;
}

/** camelCase → kebab-case for the data-attribute name (`fullWidth` → `full-width`). */
function kebab(name: string): string {
  return name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

export function cva<const V extends VariantsDef>(config: CvaConfig<V>): Cva<V> {
  // Stable key order: sort once so the output object is deterministic.
  const keys = Object.keys(config.variants).sort();
  const defaults = (config.defaultVariants ?? {}) as Record<string, string | undefined>;

  const resolve = (props: VariantProps<V> = {}): Record<string, string> => {
    const given = props as Record<string, string | undefined>;
    const attrs: Record<string, string> = {};
    for (const key of keys) {
      const value = given[key] ?? defaults[key];
      if (value === undefined) continue;
      const allowed = config.variants[key]!;
      if (!allowed.includes(value)) {
        throw new Error(
          `[cva] invalid value "${value}" for "${key}"; expected one of: ${allowed.join(", ")}`,
        );
      }
      attrs[`data-${kebab(key)}`] = value;
    }
    return attrs;
  };

  return Object.assign(resolve, { variants: config.variants });
}
