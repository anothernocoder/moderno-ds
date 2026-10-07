/**
 * Derives moderno's OpenUI component library from `moderno.agent.json`
 * (ADR-0011), so it never drifts from the real components. The components are
 * framework-agnostic (`component: null`); a framework adapter gives each one
 * its renderer.
 *
 * A ref must exist before the container that uses it, so components come out
 * in tiers: leaves and Simple forms, then the Simple forms that hold panels
 * of leaves (`Tabs`), then compound parts (`CardHeader`), then compound roots
 * (`Card`), then the `Stack` and `Grid` layouts, which also hold each other.
 */
import { defineComponent, tagSchemaId, type DefinedComponent } from "@openuidev/lang-core";
import { z } from "zod/v4";
import type { AgentComponent, ComponentsManifest, ContractManifest } from "@moderno-ui/lint-core";
import { propFields } from "./props.ts";
import { NOT_GENERATIVE, simpleFormOf, type SimpleForm } from "./simple-forms.ts";

export type GenUIComponent = DefinedComponent<z.ZodObject, null>;

/** A compound is used through its parts (`<Card.Root>`), as its examples show. */
function isCompound(component: AgentComponent): boolean {
  return (component.examples ?? []).some((example) => example.code.includes(`<${component.name}.`));
}

/** A leaf renders children when an example closes its tag (`<Button>Save</Button>`). */
function rendersChildren(component: AgentComponent): boolean {
  return (component.examples ?? []).some((example) =>
    example.code.includes(`</${component.name}>`),
  );
}

/**
 * A part renders a void element (`<input>`, `<img>`) when the examples only
 * ever self-close it: `<Avatar.Image />`, never `</Avatar.Image>`.
 */
function isVoidPart(component: AgentComponent, tag: string): boolean {
  const code = (component.examples ?? []).map((example) => example.code).join("\n");
  return new RegExp(`<${tag}[\\s/>]`).test(code) && !code.includes(`</${tag}>`);
}

function describe(component: AgentComponent): string {
  const { intent, whenToUse } = component.guidance ?? {};
  return [intent, whenToUse].filter(Boolean).join(" ") || component.name;
}

/** `item-trigger` → `ItemTrigger` */
function pascalCase(kebab: string): string {
  return kebab.replace(/(^|-)([a-z])/g, (_, __, letter: string) => letter.toUpperCase());
}

/** Text and the given components, in that order. */
function childrenOf(components: GenUIComponent[]): z.ZodArray {
  return z.array(z.union([z.string(), ...components.map((component) => component.ref)]));
}

function define(name: string, description: string, fields: [string, z.ZodType][]): GenUIComponent {
  return defineComponent({
    name,
    description,
    props: z.object(Object.fromEntries(fields)),
    component: null,
  });
}

/** What a click does: `Action([@ToAssistant("Confirm my order")])`. */
const action = z.any();
tagSchemaId(action, "ActionExpression");

function defineLeaf(component: AgentComponent): GenUIComponent {
  const fields = propFields(component);
  if (rendersChildren(component)) fields.push(["children", z.array(z.string()).optional()]);
  // ponytail: Button is the one component that fires an action. Read it from
  // the manifest when another component needs one.
  if (component.name === "Button") {
    fields.push([
      "action",
      action.optional().describe("Default: sends the label to the assistant"),
    ]);
  }
  return define(component.name, describe(component), fields);
}

/** Its plain arguments, its panels when it holds them, then its recipe variants. */
function defineSimpleForm(
  component: AgentComponent,
  form: SimpleForm,
  leaves: GenUIComponent[],
): GenUIComponent {
  const panels: [string, z.ZodType][] = form.panels
    ? [["children", childrenOf(leaves).describe("One panel per entry, in the same order.")]]
    : [];
  return define(component.name, describe(component), [
    ...form.fields,
    ...panels,
    ...propFields(component),
  ]);
}

// ponytail: every part accepts any leaf and every root any leaf plus its own
// parts, so an Accordion item cannot hold its trigger. Per-part child rules
// when the manifest describes them.
function defineCompound(component: AgentComponent, leaves: GenUIComponent[]) {
  const parts = component.parts
    .filter((part) => part.name !== "root")
    .map((part) =>
      define(
        component.name + pascalCase(part.name),
        [`The ${part.name} part of ${component.name}.`, part.description].filter(Boolean).join(" "),
        isVoidPart(component, `${component.name}.${pascalCase(part.name)}`)
          ? []
          : [["children", childrenOf(leaves).optional()]],
      ),
    );
  const root = define(component.name, describe(component), [
    ...propFields(component),
    ["children", childrenOf([...leaves, ...parts]).optional()],
  ]);
  return { root, parts };
}

/**
 * `Stack` and `Grid` hold any component and each other, so layouts nest
 * (`Stack([Grid([...])])`). The getter defers the children until both exist.
 */
function defineLayouts(components: GenUIComponent[], contract: ContractManifest): GenUIComponent[] {
  const gap = z
    .enum(
      contract.slots.spacing.map((token) => token.replace(/^--spacing-/, "")) as [
        string,
        ...string[],
      ],
    )
    .optional()
    .describe("A spacing token step.");
  let children: z.ZodArray | undefined;
  const layout = (name: string, description: string, fields: Record<string, z.ZodType>) =>
    defineComponent({
      name,
      description,
      component: null,
      props: z.object({
        get children() {
          return (children ??= childrenOf([...components, ...layouts]));
        },
        ...fields,
      }),
    });
  const layouts: GenUIComponent[] = [
    layout(
      "Stack",
      'Lays out its children in a column or a row. justify "between" spreads a row apart, like a label and its price.',
      {
        direction: z.enum(["column", "row"]).optional().describe("Default: column"),
        gap,
        justify: z
          .enum(["start", "center", "end", "between"])
          .optional()
          .describe("Default: start"),
      },
    ),
    layout("Grid", "Lays out its children in equal columns.", {
      columns: z.number().optional(),
      gap,
    }),
  ];
  return layouts;
}

/**
 * One OpenUI component per primitive (a Simple form for a form compound) and
 * per compound part, plus `Stack` and `Grid`, whose gap steps come from the
 * contract's spacing tokens. The primitives in `NOT_GENERATIVE` are left out.
 */
export function fromManifest(
  manifest: ComponentsManifest,
  contract: ContractManifest,
): GenUIComponent[] {
  const generative = manifest.components.filter((component) => !NOT_GENERATIVE.has(component.name));
  const formOf = (component: AgentComponent) =>
    isCompound(component) ? simpleFormOf(component.name) : undefined;
  const leaves = generative.flatMap((component) => {
    const form = formOf(component);
    if (!form) return isCompound(component) ? [] : [defineLeaf(component)];
    return form.panels ? [] : [defineSimpleForm(component, form, [])];
  });
  // ponytail: panels and parts hold leaves only, so a Card cannot hold Tabs
  // (a Stack holds both). Widen when a model needs the nesting.
  const withPanels = generative.flatMap((component) => {
    const form = formOf(component);
    return form?.panels ? [defineSimpleForm(component, form, leaves)] : [];
  });
  const compounds = generative
    .filter((component) => isCompound(component) && !formOf(component))
    .map((component) => defineCompound(component, leaves));

  const components = [
    ...leaves,
    ...withPanels,
    ...compounds.flatMap(({ parts }) => parts),
    ...compounds.map(({ root }) => root),
  ];
  return [...components, ...defineLayouts(components, contract)];
}
