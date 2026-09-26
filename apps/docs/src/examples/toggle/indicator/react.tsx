import { Toggle } from "@moderno-ui/react";

export function ToggleIndicatorDemo() {
  return (
    <Toggle.Root>
      <Toggle.Indicator fallback="☆">★</Toggle.Indicator>
      Favorite
    </Toggle.Root>
  );
}
