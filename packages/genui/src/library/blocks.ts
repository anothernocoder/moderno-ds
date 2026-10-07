/**
 * A registry Block (ADR-0012) as the ordered fields of its OpenUI component,
 * and a short program that shows it. Like a primitive's (`props.ts`), but:
 *
 * - Content (text, lists, objects, children) is required: a Block left to
 *   its defaults shows its sample data.
 * - Host state (`loading`, `error`, `disabled`, every flag) and callbacks are
 *   the host's, never the model's.
 * - A label with its callback (`actionLabel` + `onAction`) is an optional
 *   label plus an optional action, like Button's (`actionClick`).
 */
import { z } from "zod/v4";
import type { AgentProp, ComponentsManifest } from "@moderno-ui/lint-core";
import { action, isBlocked, PLAIN_TYPES, STRING_UNION } from "./props.ts";

export type AgentBlock = NonNullable<ComponentsManifest["blocks"]>[number];

/** What the host knows and the model does not: the load state, form errors, a link's token, a typed query. */
// ponytail: a name list. Mark host state in the manifest if a Block adds another.
const HOST_STATE = new Set([
  "loading",
  "error",
  "errors",
  "disabled",
  "query",
  "token",
  "sentTo",
  "selectedId",
]);

/** `1 | 2` */
const NUMBER_UNION = /^\d+(\s*\|\s*\d+)+$/;

/** `actionLabel` → `actionClick`: what clicking that label's button does. */
export const actionField = (label: string) => `${label.replace(/Label$/, "")}Click`;

const isCallback = (prop: AgentProp) => prop.type.includes("=>");

/** `KpiCardMetric | null` → `KpiCardMetric`: `null` is an empty state, the host's. */
const bareType = (type: string) =>
  type.replace(/^readonly /, "").replace(/^null \| | \| null$/, "");

/** The callback a label's button fires: `actionLabel` or `action` → `onAction`, `primaryLabel` → `onPrimaryAction`. */
function callbackOf(label: AgentProp, props: AgentProp[]): string | undefined {
  if (label.type !== "string") return undefined;
  const base = label.name.replace(/Label$/, "");
  const pascal = base.charAt(0).toUpperCase() + base.slice(1);
  return [`on${pascal}`, `on${pascal}Action`].find((name) =>
    props.some((prop) => prop.name === name && isCallback(prop)),
  );
}

function toZod(type: string, shapes: AgentBlock["shapes"]): z.ZodType | null {
  const bare = bareType(type);
  const plain = PLAIN_TYPES[bare];
  if (plain) return plain();
  if (STRING_UNION.test(bare)) {
    return z.enum(bare.split("|").map((member) => JSON.parse(member.trim()) as string));
  }
  if (NUMBER_UNION.test(bare)) {
    const [first, second, ...rest] = bare.split("|").map((member) => z.literal(Number(member)));
    return z.union([first!, second!, ...rest]);
  }
  const element = /^(.+)\[\]$/.exec(bare)?.[1];
  if (element) {
    const inner = toZod(element, shapes);
    return inner && z.array(inner);
  }
  const shape = shapes[bare];
  if (!shape) return null;
  return z.object(
    Object.fromEntries(
      shape.flatMap((field) => {
        const schema = toZod(field.type, shapes);
        if (!schema) return [];
        const described = field.description ? schema.describe(field.description) : schema;
        return [[field.name, field.required ? described : described.optional()]];
      }),
    ),
  );
}

/** Text, a list or an object: what the block shows. A link (`*Href`) has a harmless default. */
function isContent(prop: AgentProp, shapes: AgentBlock["shapes"]): boolean {
  const bare = bareType(prop.type);
  if (bare === "string") return !prop.name.endsWith("Href");
  return bare.endsWith("[]") || bare in shapes;
}

/**
 * The block's settable props as ordered `[name, schema]` pairs: its content,
 * then the rest in manifest order. `children` takes the given components.
 */
export function blockFields(block: AgentBlock, children: z.ZodType): [string, z.ZodType][] {
  const { props, shapes } = block;
  const required: [string, z.ZodType][] = [];
  const optional: [string, z.ZodType][] = [];
  for (const prop of props) {
    if (prop.name === "children") {
      required.push(["children", children]);
      continue;
    }
    if (isBlocked(prop) || prop.type === "boolean" || HOST_STATE.has(prop.name)) continue;
    const schema = toZod(prop.type, shapes);
    if (!schema) continue;
    const field = prop.description ? schema.describe(prop.description) : schema;
    const callback = callbackOf(prop, props);
    if (callback) {
      optional.push(
        [prop.name, field.optional().describe("Its button's label. Default: no button")],
        [
          actionField(prop.name),
          action.optional().describe(`Default: sends "${prop.name}" to the assistant`),
        ],
      );
    } else if (isContent(prop, shapes)) required.push([prop.name, field]);
    else optional.push([prop.name, field.optional()]);
  }
  return [...required, ...optional];
}

/** A Block that submits a form of its own (`FormLayout`, `LoginForm`). */
export const submitsForm = (block: AgentBlock) =>
  block.props.some((prop) => prop.name === "onSubmit");

/** A placeholder value for a required field: its name for text, one entry for a list. */
function placeholder(schema: z.ZodType, name: string): string {
  if (schema instanceof z.ZodEnum) return JSON.stringify(schema.options[0]);
  if (schema instanceof z.ZodLiteral) return JSON.stringify(schema.value);
  if (schema instanceof z.ZodUnion) return placeholder(schema.options[0] as z.ZodType, name);
  if (schema instanceof z.ZodNumber) return "1";
  if (schema instanceof z.ZodBoolean) return "true";
  if (schema instanceof z.ZodArray) return `[${placeholder(schema.element as z.ZodType, name)}]`;
  if (schema instanceof z.ZodObject) {
    const fields = Object.entries(schema.shape as Record<string, z.ZodType>)
      .filter(([, field]) => !(field instanceof z.ZodOptional))
      .map(([key, field]) => `${JSON.stringify(key)}: ${placeholder(field, key)}`);
    return `{${fields.join(", ")}}`;
  }
  return JSON.stringify(name);
}

/** The smallest program that places the block: its required arguments, as placeholders. */
export function blockExample(component: { name: string; props: z.ZodObject }): string {
  const id = component.name.charAt(0).toLowerCase() + component.name.slice(1);
  const args = Object.entries(component.props.shape as Record<string, z.ZodType>)
    .filter(([, field]) => !(field instanceof z.ZodOptional))
    .map(([name, field]) => placeholder(field, name));
  return `root = Stack([${id}])\n${id} = ${component.name}(${args.join(", ")})`;
}
