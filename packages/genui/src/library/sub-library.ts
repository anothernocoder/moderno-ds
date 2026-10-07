/**
 * The library the LLM gets for one turn: only the components the router
 * picked, so the prompt is smaller, faster and cheaper (ADR-0011).
 */
import { createLibrary, defineComponent, type Library } from "@openuidev/lang-core";
import { z } from "zod/v4";
import type { GenUIComponent } from "./from-manifest.ts";

const LAYOUTS = ["Stack", "Grid"];

/** What a container's `children` accepts: text and component refs. Empty for a leaf. */
function childOptions(component: GenUIComponent): readonly z.core.$ZodType[] {
  const children = component.props.shape.children;
  if (!children) return [];
  const array = (children instanceof z.ZodOptional ? children.unwrap() : children) as z.ZodArray;
  return array.element instanceof z.ZodUnion ? array.element.options : [];
}

/** The component with `children` swapped for `options`, keeping its position and optionality. */
function withChildOptions(component: GenUIComponent, options: z.core.$ZodType[]): GenUIComponent {
  const children = z.array(z.union(options as [z.core.$ZodType, ...z.core.$ZodType[]]));
  return defineComponent({
    name: component.name,
    description: component.description,
    component: null,
    props: component.props.extend({
      children:
        component.props.shape.children instanceof z.ZodOptional ? children.optional() : children,
    }),
  });
}

/**
 * A library of the named components, the compound parts they hold, and the
 * `Stack` and `Grid` layouts (`Stack` is the root). Every container's children
 * are narrowed to what is kept, so the prompt lists nothing else.
 * `components` must be in `fromManifest` order: children before containers.
 */
export function createSubLibrary(components: GenUIComponent[], names: string[]): Library<null> {
  const byRef = new Map<z.core.$ZodType, GenUIComponent>(
    components.map((component) => [component.ref, component]),
  );
  const keep = new Set([...names, ...LAYOUTS]);
  for (const component of components) {
    if (!names.includes(component.name)) continue;
    for (const option of childOptions(component)) {
      const child = byRef.get(option);
      if (child && childOptions(child).length) keep.add(child.name);
    }
  }

  // Old ref → the kept component's ref, rebuilt children-first.
  const kept = new Map<z.core.$ZodType, GenUIComponent>();
  for (const component of components) {
    if (!keep.has(component.name)) continue;
    const options = childOptions(component);
    const next = options.length
      ? withChildOptions(
          component,
          options.flatMap((option) => {
            if (!byRef.has(option)) return [option];
            const child = kept.get(option);
            return child ? [child.ref] : [];
          }),
        )
      : component;
    kept.set(component.ref, next);
  }

  return createLibrary({ components: [...kept.values()], root: "Stack" });
}
