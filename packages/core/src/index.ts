/**
 * @moderno-ui/core — framework-agnostic core.
 *
 * CVA (props → deterministic data-attributes), class utilities, and the shared
 * `styles/components.css` skeleton. No DOM, no framework imports.
 */

export { cva } from "./cva.js";
export type { Cva, CvaConfig, VariantProps, VariantsDef } from "./cva.js";

export { cx, partAttrs } from "./utils.js";
export type { ClassValue } from "./utils.js";

export {
  buttonRecipe,
  cardRecipe,
  checkboxRecipe,
  dividerRecipe,
  selectRecipe,
  fieldRecipe,
  alertRecipe,
  alertRole,
  calloutRecipe,
  pinInputRecipe,
  badgeRecipe,
  chipRecipe,
  indicatorRecipe,
  indicatorAttrs,
  indicatorRole,
  skeletonRecipe,
  spinnerRecipe,
  avatarRecipe,
} from "./recipes.js";
export type {
  ButtonVariant,
  ButtonSize,
  CardVariant,
  CardSize,
  CheckboxSize,
  DividerAlign,
  DividerOrientation,
  SelectSize,
  FieldSize,
  AlertVariant,
  AlertSize,
  CalloutVariant,
  PinInputSize,
  BadgeVariant,
  BadgeSize,
  ChipVariant,
  ChipSize,
  IndicatorVariant,
  IndicatorSize,
  IndicatorAttrsProps,
  IndicatorNameAttrs,
  SkeletonShape,
  SpinnerSize,
  AvatarSize,
  AvatarShape,
} from "./recipes.js";
