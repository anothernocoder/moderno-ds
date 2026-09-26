/** @jsxImportSource solid-js */
import { Toggle } from "@moderno-ui/solid";

export function ToggleIndicatorDemo() {
  return (
    <Toggle.Root>
      <Toggle.Indicator fallback="☆">★</Toggle.Indicator>
      Favorite
    </Toggle.Root>
  );
}
