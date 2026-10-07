/**
 * Turns a manifest component's props into the ordered zod fields of its
 * OpenUI component. OpenUI Lang arguments are positional in key order, so the
 * order is part of the API: required props, then recipe variants, then the
 * rest, each group in manifest order.
 */
import { tagSchemaId } from "@openuidev/lang-core";
import { z } from "zod/v4";
import type { AgentComponent, AgentProp } from "@moderno-ui/lint-core";

/**
 * Code, refs, styles and DOM plumbing: nothing a model may set. Nor `size`:
 * every control of a widget renders at the recipe's default (`md`), so their
 * heights always match.
 */
const BLOCKED_NAMES = new Set([
  "size",
  "ref",
  "className",
  "style",
  "children",
  "id",
  "ids",
  "dir",
  "asChild",
]);
const BLOCKED_PATTERN = /^(on[A-Z]|aria-|data-)/;

/** `"sm" | "md" | "lg"` */
export const STRING_UNION = /^"[^"]*"(\s*\|\s*"[^"]*")*$/;

export const PLAIN_TYPES: Record<string, () => z.ZodType> = {
  string: () => z.string(),
  number: () => z.number(),
  boolean: () => z.boolean(),
  "string[]": () => z.array(z.string()),
  "number[]": () => z.array(z.number()),
};

const xyPoint = () => z.object({ x: z.number(), y: z.number() });

/**
 * The element types of the charts' data props, by the name props-doc gives
 * them (`readonly BarSeries[]`). Spelled out so the prompt shows the shape and
 * the parser rejects a wrong one. They mirror `@moderno-ui/charts-core`; a type
 * test in `test/library.test.ts` fails when the two drift.
 */
export const CHART_DATA_TYPES = {
  XYPoint: xyPoint,
  BarSeries: () => z.object({ name: z.string().optional(), values: z.array(z.number()) }),
  CartesianSeries: () => z.object({ name: z.string().optional(), points: z.array(xyPoint()) }),
  BarListItem: () => z.object({ name: z.string(), value: z.number() }),
  DonutDatum: () => z.object({ name: z.string().optional(), value: z.number() }),
} satisfies Record<string, () => z.ZodType>;

/** What a click does: `Action([@ToAssistant("Confirm my order")])`. */
export const action = z.any();
tagSchemaId(action, "ActionExpression");

/** `BarSeries[]` */
const ARRAY_OF = /^(\w+)\[\]$/;

export function isBlocked(prop: AgentProp): boolean {
  return (
    BLOCKED_NAMES.has(prop.name) || BLOCKED_PATTERN.test(prop.name) || prop.type.includes("=>")
  );
}

function asEnum(values: readonly string[]): z.ZodType {
  return z.enum(values as [string, ...string[]]);
}

function toZodType(prop: AgentProp, variants: Record<string, readonly string[]>): z.ZodType | null {
  const variantValues = variants[prop.name];
  if (variantValues) return asEnum(variantValues);

  const type = prop.type.replace(/^readonly /, "");
  const plain = PLAIN_TYPES[type];
  if (plain) return plain();
  if (STRING_UNION.test(type)) {
    return asEnum(type.split("|").map((member) => JSON.parse(member.trim()) as string));
  }
  const elementName = ARRAY_OF.exec(type)?.[1] ?? "";
  if (Object.hasOwn(CHART_DATA_TYPES, elementName)) {
    return z.array(CHART_DATA_TYPES[elementName as keyof typeof CHART_DATA_TYPES]());
  }
  // ponytail: props-doc only names any other structured type
  // (`Partial<ChartMargin>`), so a required one is untyped data and an
  // optional one is left out. Add it to CHART_DATA_TYPES when a model needs it.
  return prop.required ? z.any().describe(`TypeScript type: ${prop.type}`) : null;
}

function toField(prop: AgentProp, variants: Record<string, readonly string[]>): z.ZodType | null {
  let field = toZodType(prop, variants);
  if (!field) return null;
  const notes = [prop.description, prop.default && `Default: ${prop.default}`].filter(Boolean);
  if (notes.length)
    field = field.describe([field.description, ...notes].filter(Boolean).join(". "));
  return prop.required ? field : field.optional();
}

/** The component's settable props as ordered `[name, schema]` pairs. */
export function propFields(component: AgentComponent): [string, z.ZodType][] {
  const variants = component.variants ?? {};
  const props = component.props.filter((prop) => !isBlocked(prop));
  const isVariant = (prop: AgentProp) => prop.name in variants;

  const required = props.filter((prop) => prop.required);
  const variantProps = Object.keys(variants).flatMap((name) =>
    props.filter((prop) => prop.name === name && !prop.required),
  );
  const rest = props.filter((prop) => !prop.required && !isVariant(prop));

  return [...required, ...variantProps, ...rest].flatMap((prop) => {
    const field = toField(prop, variants);
    return field ? [[prop.name, field] as [string, z.ZodType]] : [];
  });
}
