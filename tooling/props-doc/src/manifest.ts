/**
 * The documented-component manifest: which components get a PropsTable and
 * where each props interface lives, resolved from the canonical
 * `@moderno-ui/react` types (props are identical across bindings by contract —
 * they share the `@moderno-ui/core` recipes).
 *
 * `test/manifest.test.ts` resolves every entry against the real react
 * tsconfig, so a renamed export or moved file fails in tests, not at docs
 * build time. A new Primitive is documented by adding one entry here.
 */
import {
  alertRecipe,
  buttonRecipe,
  cardRecipe,
  checkboxRecipe,
  dividerRecipe,
  fieldRecipe,
  pinInputRecipe,
  selectRecipe,
} from "@moderno-ui/core";
import type { ComponentEntry } from "./index.ts";

/**
 * Components with consumer-authored props worth a table. `defaults` comes off
 * the same recipe the binding resolves at runtime, so the Default column can
 * never disagree with what the component actually does.
 */
export const ENTRIES: ComponentEntry[] = [
  {
    name: "Button",
    file: "src/button.tsx",
    type: "ButtonProps",
    defaults: buttonRecipe.defaultVariants,
  },
  {
    name: "Card",
    file: "src/card.tsx",
    type: "CardRootProps",
    defaults: cardRecipe.defaultVariants,
  },
  {
    name: "Checkbox",
    file: "src/checkbox.tsx",
    type: "ModernoCheckboxRootProps",
    defaults: checkboxRecipe.defaultVariants,
  },
  {
    name: "Field",
    file: "src/field.tsx",
    type: "ModernoFieldRootProps",
    defaults: fieldRecipe.defaultVariants,
  },
  {
    name: "Alert",
    file: "src/alert.tsx",
    type: "AlertRootProps",
    defaults: alertRecipe.defaultVariants,
  },
  {
    name: "Divider",
    file: "src/divider.tsx",
    type: "DividerProps",
    defaults: dividerRecipe.defaultVariants,
  },
  // Dialog declares no props of its own; the entry exists so its table can say
  // that, rather than fall back to the "native attributes only" empty state.
  { name: "Dialog", file: "src/dialog.tsx", type: "DialogRootProps" },
  {
    name: "Select",
    file: "src/select.tsx",
    type: "ModernoSelectRootProps",
    defaults: selectRecipe.defaultVariants,
  },
  {
    name: "PinInput",
    file: "src/pin-input.tsx",
    type: "ModernoPinInputRootProps",
    defaults: pinInputRecipe.defaultVariants,
  },
  { name: "LineChart", file: "src/charts.tsx", type: "LineChartProps" },
  { name: "AreaChart", file: "src/charts.tsx", type: "AreaChartProps" },
  { name: "BarChart", file: "src/charts.tsx", type: "BarChartProps" },
  { name: "ScatterChart", file: "src/charts.tsx", type: "ScatterChartProps" },
];
