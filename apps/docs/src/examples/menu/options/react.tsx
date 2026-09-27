import { useState } from "react";
import { Menu, Portal } from "@moderno-ui/react";

export function MenuOptionsDemo() {
  const [showToolbar, setShowToolbar] = useState(true);
  const [sort, setSort] = useState("name");
  return (
    <Menu.Root closeOnSelect={false}>
      <Menu.Trigger>
        View <Menu.Indicator>▾</Menu.Indicator>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.CheckboxItem
              value="toolbar"
              checked={showToolbar}
              onCheckedChange={setShowToolbar}
            >
              <Menu.ItemText>Show toolbar</Menu.ItemText>
              <Menu.ItemIndicator>✓</Menu.ItemIndicator>
            </Menu.CheckboxItem>
            <Menu.Separator />
            <Menu.RadioItemGroup value={sort} onValueChange={(details) => setSort(details.value)}>
              <Menu.ItemGroupLabel>Sort by</Menu.ItemGroupLabel>
              <Menu.RadioItem value="name">
                <Menu.ItemText>Name</Menu.ItemText>
                <Menu.ItemIndicator>✓</Menu.ItemIndicator>
              </Menu.RadioItem>
              <Menu.RadioItem value="date">
                <Menu.ItemText>Date</Menu.ItemText>
                <Menu.ItemIndicator>✓</Menu.ItemIndicator>
              </Menu.RadioItem>
            </Menu.RadioItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
