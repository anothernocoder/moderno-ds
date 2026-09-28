import { cva, type VariantProps } from "../cva.js";

/**
 * Toolbar: `size` on the root, which every item follows; the sizes are
 * Button's. Orientation, the Tab stop, pressed and disabled come from the
 * toolbar machine (`data-orientation`, `data-state`, `data-disabled`), not
 * from the recipe.
 */
export const toolbarRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Toolbar's density, shared by its items: Button's sizes. */
export type ToolbarSize = NonNullable<VariantProps<typeof toolbarRecipe.variants>["size"]>;

/**
 * The text a Toolbar item's tooltip shows: its name, then its shortcut when
 * it has one ("Undo (⌘Z)").
 */
export function toolbarTooltipText(label: string, shortcut?: string): string {
  return shortcut ? `${label} (${shortcut})` : label;
}

/** A Toolbar item: a button or a toggle of any toolbar. */
const TOOLBAR_ITEM = '[data-scope="toolbar"]:is([data-part="button"], [data-part="toggle"])';

/** A blur handler's name, lower-cased, in every framework's spelling. */
const BLUR_KEYS = new Set(["onblur", "onfocusout"]);

type BlurHandler = (event: { relatedTarget: EventTarget | null }) => void;

/**
 * A Toolbar item's tooltip trigger props, for arrow keys that move focus from
 * item to item. Zag closes a tooltip when its trigger loses focus, and that
 * close also shuts the tooltip the next item has just opened. So a blur
 * towards another item is left alone: the next tooltip opens and replaces
 * this one, as moving the pointer between them does. The blur handler is
 * found under any framework's spelling (`onBlur`, Svelte's `onblur`,
 * Solid's `onFocusOut`).
 */
export function toolbarTooltipTriggerProps<P extends object>(props: P): P {
  const handlers: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!BLUR_KEYS.has(key.toLowerCase()) || typeof value !== "function") continue;
    const onBlur = value as BlurHandler;
    handlers[key] = (event: { relatedTarget: EventTarget | null }) => {
      const next = event.relatedTarget;
      if (next instanceof Element && next.matches(TOOLBAR_ITEM)) return;
      onBlur(event);
    };
  }
  return { ...props, ...handlers };
}

/**
 * `props` without its event handlers (`onClick`, Svelte's `onclick`, …). A
 * disabled Toolbar item stays focusable and keeps its attributes, but the
 * handlers a consumer gave it — or a Menu.Trigger merged into it — never run,
 * so it does nothing.
 */
export function withoutEventHandlers<P extends object>(props: P): P {
  return Object.fromEntries(
    Object.entries(props).filter(
      ([key, value]) => !(/^on/.test(key) && typeof value === "function"),
    ),
  ) as P;
}
