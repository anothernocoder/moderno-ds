import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  useId,
  type Component,
  type ComputedRef,
  type DefineComponent,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InjectionKey,
  type PropType,
  type SetupContext,
  type VNode,
} from "vue";
import { Tooltip as ArkTooltip, useToggle, useTooltip } from "@ark-ui/vue";
import { mergeProps, normalizeProps, useMachine, type PropTypes } from "@zag-js/vue";
import {
  splitToolbarKeyDown,
  toolbar,
  toolbarRecipe,
  toolbarTooltipText,
  toolbarTooltipTriggerProps,
  withoutEventHandlers,
  type ToolbarSize,
} from "@moderno-ui/core";
import { Portal } from "./dialog.js";
import { Tooltip } from "./tooltip.js";

export type { ToolbarSize } from "@moderno-ui/core";

/** The axis a toolbar's items run along. */
export type ToolbarOrientation = toolbar.Orientation;

export interface ToolbarRootProps extends /* @vue-ignore */ HTMLAttributes {
  /** Lays the items out in a row (Left/Right arrows) or a column (Up/Down). Default `"horizontal"`. */
  orientation?: ToolbarOrientation;
  /** Height of every item: Button's sizes. Default `"md"`. */
  size?: ToolbarSize;
  /** Text direction. In `rtl` the Left and Right arrows swap. */
  dir?: "ltr" | "rtl";
}

interface ToolbarItemOwnProps {
  /** Names an icon-only item: its `aria-label`, and the text of its tooltip. */
  label?: string;
  /** A keyboard shortcut the tooltip shows in parentheses after the label. */
  shortcut?: string;
  /** Keeps the item in the arrow-key order, announced as disabled, but it does nothing. */
  disabled?: boolean;
}

export interface ToolbarButtonProps extends ToolbarItemOwnProps, /* @vue-ignore */ HTMLAttributes {}

export interface ToolbarToggleProps extends ToolbarItemOwnProps, /* @vue-ignore */ HTMLAttributes {
  /** Controlled pressed state. Use with `v-model:pressed` or `@pressed-change`. */
  pressed?: boolean;
  /** Initial pressed state when uncontrolled. Default `false`. */
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  "onUpdate:pressed"?: (pressed: boolean) => void;
}

export type ToolbarGroupProps = HTMLAttributes;

export type ToolbarSeparatorProps = HTMLAttributes;

type ToolbarApi = toolbar.Api<PropTypes>;

/** The connected toolbar machine, for the items inside the root. */
const TOOLBAR: InjectionKey<ComputedRef<ToolbarApi>> = Symbol("ModernoToolbar");

function useToolbar(part: string): ComputedRef<ToolbarApi> {
  const api = inject(TOOLBAR, undefined);
  if (!api) throw new Error(`Toolbar.${part} must be inside a Toolbar.Root.`);
  return api;
}

const ToolbarRootImpl = defineComponent({
  name: "ModernoToolbarRoot",
  inheritAttrs: false,
  props: {
    orientation: { type: String as PropType<ToolbarOrientation>, default: undefined },
    size: { type: String as PropType<ToolbarSize>, default: undefined },
    dir: { type: String as PropType<"ltr" | "rtl">, default: undefined },
    id: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    const machineId = useId();
    const service = useMachine(
      toolbar.machine,
      computed(() => ({
        id: machineId,
        ids: props.id ? { root: props.id } : undefined,
        orientation: props.orientation,
        dir: props.dir,
      })),
    );
    const api = computed(() => toolbar.connect(service, normalizeProps));
    provide(TOOLBAR, api);
    return () =>
      h(
        "div",
        { ...mergeProps(api.value.getRootProps(), attrs), ...toolbarRecipe({ size: props.size }) },
        slots.default?.(),
      );
  },
});

/** The props every item declares. */
const itemProps = {
  label: { type: String, default: undefined },
  shortcut: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
};

type Attrs = SetupContext["attrs"];

/**
 * One item's render function: the machine's props, the consumer's, and a
 * tooltip when it has a label. The toolbar's key handler runs first, so its
 * arrows move focus even on a Menu.Trigger merged in (`as-child`); the
 * consumer's other handlers run before the machine's, and a disabled item
 * drops them. The tooltip and a Menu.Trigger share the item's id, so both
 * find it.
 */
function useItem(
  part: "button" | "toggle",
  props: ToolbarItemOwnProps,
  attrs: Attrs,
  slots: SetupContext["slots"],
  machineProps: () => ButtonHTMLAttributes,
  ownHandlers: () => ButtonHTMLAttributes = () => ({}),
): () => VNode | VNode[] {
  const generatedId = useId();
  const id = () => (attrs.id as string | undefined) ?? generatedId;
  const tooltip = useTooltip(computed(() => ({ ids: { trigger: id() } })));
  return () => {
    const consumer = mergeProps(ownHandlers(), attrs);
    const { keyDown, rest } = splitToolbarKeyDown(machineProps());
    const merged = mergeProps(
      props.label ? toolbarTooltipTriggerProps(tooltip.value.getTriggerProps()) : {},
      { "aria-label": props.label },
      rest,
      props.disabled ? withoutEventHandlers(consumer) : consumer,
      keyDown,
    );
    const button = h(
      "button",
      { ...merged, id: id(), "data-scope": "toolbar", "data-part": part },
      slots.default?.(),
    );
    if (!props.label) return button;
    const text = toolbarTooltipText(props.label, props.shortcut);
    const Positioner = Tooltip.Positioner as unknown as Component;
    const Content = Tooltip.Content as unknown as Component;
    return [
      button,
      h(ArkTooltip.RootProvider as unknown as Component, { value: tooltip.value }, () =>
        h(Portal, null, () => h(Positioner, null, () => h(Content, null, () => text))),
      ),
    ];
  };
}

const ToolbarButtonImpl = defineComponent({
  name: "ModernoToolbarButton",
  inheritAttrs: false,
  props: itemProps,
  setup(props, { slots, attrs }) {
    const api = useToolbar("Button");
    const value = useId();
    return useItem("button", props, attrs, slots, () =>
      api.value.getButtonProps({ value, disabled: props.disabled }),
    );
  },
});

const ToolbarToggleImpl = defineComponent({
  name: "ModernoToolbarToggle",
  inheritAttrs: false,
  props: {
    ...itemProps,
    pressed: { type: Boolean, default: undefined },
    defaultPressed: { type: Boolean, default: undefined },
  },
  emits: ["pressedChange", "update:pressed"],
  setup(props, { slots, attrs, emit }) {
    const api = useToolbar("Toggle");
    const value = useId();
    const toggle = useToggle(
      computed(() => ({ pressed: props.pressed, defaultPressed: props.defaultPressed })),
      emit,
    );
    return useItem(
      "toggle",
      props,
      attrs,
      slots,
      () =>
        api.value.getToggleProps({
          value,
          disabled: props.disabled,
          pressed: toggle.value.pressed,
        }),
      () => ({ onClick: () => toggle.value.setPressed(!toggle.value.pressed) }),
    );
  },
});

const ToolbarGroupImpl = defineComponent({
  name: "ModernoToolbarGroup",
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const api = useToolbar("Group");
    return () => h("div", mergeProps(api.value.getGroupProps(), attrs), slots.default?.());
  },
});

const ToolbarSeparatorImpl = defineComponent({
  name: "ModernoToolbarSeparator",
  inheritAttrs: false,
  setup(_, { attrs }) {
    const api = useToolbar("Separator");
    return () => h("div", mergeProps(api.value.getSeparatorProps(), attrs));
  },
});

/**
 * Toolbar — a bar of buttons, toggles, groups and separators, like the top
 * bar of an editor (undo, redo, zoom, theme).
 *
 * The toolbar machine from `@moderno-ui/core` drives the keyboard: the whole
 * bar is one Tab stop, the arrow keys move between items (Left/Right in a
 * row, Up/Down in a column), Home and End go to the ends. A disabled item
 * stays in that order but does nothing. An item with a `label` is icon-only:
 * the label names it and shows in a tooltip, with its `shortcut`. A
 * `Menu.Trigger as-child` around a `Toolbar.Button` makes it a menu button.
 * Anatomy: `Root > Button + Toggle + Group > … + Separator`.
 *
 * Annotated so the emitted `.d.ts` names each part's props.
 */
export const Toolbar: {
  Root: DefineComponent<ToolbarRootProps>;
  Button: DefineComponent<ToolbarButtonProps>;
  Toggle: DefineComponent<ToolbarToggleProps>;
  Group: DefineComponent<ToolbarGroupProps>;
  Separator: DefineComponent<ToolbarSeparatorProps>;
} = {
  Root: ToolbarRootImpl as unknown as DefineComponent<ToolbarRootProps>,
  Button: ToolbarButtonImpl as unknown as DefineComponent<ToolbarButtonProps>,
  Toggle: ToolbarToggleImpl as unknown as DefineComponent<ToolbarToggleProps>,
  Group: ToolbarGroupImpl as unknown as DefineComponent<ToolbarGroupProps>,
  Separator: ToolbarSeparatorImpl as unknown as DefineComponent<ToolbarSeparatorProps>,
};
