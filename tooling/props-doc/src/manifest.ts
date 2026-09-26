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
import type { ComponentEntry } from "./index.ts";

/** Components with consumer-authored props worth a table. */
export const ENTRIES: ComponentEntry[] = [
  { name: "Button", file: "src/button.tsx", type: "ButtonProps" },
  { name: "Card", file: "src/card.tsx", type: "CardRootProps" },
  { name: "Checkbox", file: "src/checkbox.tsx", type: "ModernoCheckboxRootProps" },
  { name: "Field", file: "src/field.tsx", type: "ModernoFieldRootProps" },
  { name: "Alert", file: "src/alert.tsx", type: "AlertRootProps" },
  { name: "Divider", file: "src/divider.tsx", type: "DividerProps" },
  { name: "Badge", file: "src/badge.tsx", type: "BadgeProps" },
  { name: "Chip", file: "src/chip.tsx", type: "ChipProps" },
  { name: "Indicator", file: "src/indicator.tsx", type: "IndicatorProps" },
  { name: "Skeleton", file: "src/skeleton.tsx", type: "SkeletonProps" },
  { name: "Spinner", file: "src/spinner.tsx", type: "SpinnerProps" },
  { name: "Callout", file: "src/callout.tsx", type: "CalloutRootProps" },
  { name: "Select", file: "src/select.tsx", type: "ModernoSelectRootProps" },
  { name: "PinInput", file: "src/pin-input.tsx", type: "ModernoPinInputRootProps" },
  { name: "Avatar", file: "src/avatar.tsx", type: "ModernoAvatarRootProps" },
  { name: "Switch", file: "src/switch.tsx", type: "ModernoSwitchRootProps" },
  { name: "RadioGroup", file: "src/radio-group.tsx", type: "ModernoRadioGroupRootProps" },
  { name: "Toggle", file: "src/toggle.tsx", type: "ModernoToggleRootProps" },
  { name: "ToggleGroup", file: "src/toggle-group.tsx", type: "ModernoToggleGroupRootProps" },
  { name: "Tabs", file: "src/tabs.tsx", type: "ModernoTabsRootProps" },
  { name: "Accordion", file: "src/accordion.tsx", type: "ModernoAccordionRootProps" },
  { name: "Progress", file: "src/progress.tsx", type: "ModernoProgressRootProps" },
  { name: "Slider", file: "src/slider.tsx", type: "ModernoSliderRootProps" },
  { name: "NumberInput", file: "src/number-input.tsx", type: "ModernoNumberInputRootProps" },
  { name: "Pagination", file: "src/pagination.tsx", type: "ModernoPaginationRootProps" },
  { name: "LineChart", file: "src/charts.tsx", type: "LineChartProps" },
  { name: "AreaChart", file: "src/charts.tsx", type: "AreaChartProps" },
  { name: "BarChart", file: "src/charts.tsx", type: "BarChartProps" },
  { name: "ScatterChart", file: "src/charts.tsx", type: "ScatterChartProps" },
];
