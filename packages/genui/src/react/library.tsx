/**
 * Gives each neutral component (`component: null`) its `@moderno-ui/react`
 * renderer. Same name, same schema object, so the refs a container's children
 * point at still resolve and the prompt does not change.
 */
import type { ComponentType, ReactNode } from "react";
import { createLibrary } from "@openuidev/lang-core";
import {
  defineComponent,
  useTriggerAction,
  type ActionPlan,
  type ComponentRenderer,
  type Library,
} from "@openuidev/react-lang";
import * as Moderno from "@moderno-ui/react";
import type { GenUIComponent } from "../library/from-manifest.ts";

type AnyComponent = ComponentType<Record<string, unknown> & { children?: ReactNode }>;
type Exports = Record<string, unknown>;

const reactExports = Moderno as unknown as Exports;

/** Parts React exports under another name. Ark renders Toast's group part as `Toaster`. */
const RENAMED_PARTS: Exports = { ToastGroup: Moderno.Toaster };

function isCompound(value: unknown): value is Exports {
  return typeof value === "object" && value !== null && "Root" in value;
}

/** `Button` → Button, `Card` → Card.Root, `CardHeader` → Card.Header. */
function reactComponent(name: string): AnyComponent | undefined {
  const exported = RENAMED_PARTS[name] ?? reactExports[name];
  if (exported) return (isCompound(exported) ? exported.Root : exported) as AnyComponent;
  for (let end = name.length - 1; end > 0; end--) {
    const root = reactExports[name.slice(0, end)];
    if (isCompound(root)) return root[name.slice(end)] as AnyComponent | undefined;
  }
  return undefined;
}

function textOf(children: unknown): string {
  return Array.isArray(children)
    ? children.filter((child) => typeof child === "string").join("")
    : "";
}

/** Props pass through; `children` (text and components) goes through `renderNode`. */
function render(Component: AnyComponent): ComponentRenderer {
  return function ModernoNode({ props: { children, ...props }, renderNode }) {
    return (
      <Component {...props}>{children === undefined ? undefined : renderNode(children)}</Component>
    );
  };
}

/** A click runs the button's `action`, or sends its label to the assistant. */
const ActionButton: ComponentRenderer = ({ props: { children, action, ...props }, renderNode }) => {
  const triggerAction = useTriggerAction();
  return (
    <Moderno.Button
      {...props}
      onClick={() =>
        void triggerAction(textOf(children), undefined, action as ActionPlan | undefined)
      }
    >
      {children === undefined ? undefined : renderNode(children)}
    </Moderno.Button>
  );
};

const spacing = (gap: unknown) => (gap === undefined ? undefined : `var(--spacing-${String(gap)})`);

// The layouts have no moderno component: a flex column or row, and a grid.
const Stack: ComponentRenderer = ({ props: { children, direction, gap, justify }, renderNode }) => (
  <div
    style={{
      display: "flex",
      flexDirection: direction === "row" ? "row" : "column",
      justifyContent: justify === "between" ? "space-between" : (justify as string | undefined),
      gap: spacing(gap),
    }}
  >
    {renderNode(children)}
  </div>
);

const Grid: ComponentRenderer = ({ props: { children, columns, gap }, renderNode }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${Number(columns) || 2}, minmax(0, 1fr))`,
      gap: spacing(gap),
    }}
  >
    {renderNode(children)}
  </div>
);

const RENDERERS: Record<string, ComponentRenderer> = { Button: ActionButton, Stack, Grid };

function rendererFor(name: string): ComponentRenderer {
  const renderer = RENDERERS[name];
  if (renderer) return renderer;
  const component = reactComponent(name);
  if (!component) throw new Error(`[genui] No @moderno-ui/react component renders "${name}".`);
  return render(component);
}

/**
 * The OpenUI library that renders the given neutral components (the full
 * library or a sub-library's) with `@moderno-ui/react`. `Stack` is the root.
 * Throws when a component has no React renderer.
 */
export function createReactLibrary(components: GenUIComponent[]): Library {
  return createLibrary({
    root: "Stack",
    components: components.map((component) =>
      defineComponent({
        name: component.name,
        description: component.description,
        props: component.props,
        component: rendererFor(component.name),
      }),
    ),
  });
}
