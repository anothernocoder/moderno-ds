/**
 * SSR playground — the Solid twin of the React harness. Mounts all four
 * primitives in their default (closed) state; `open` mounts the Dialog + Select
 * popovers so the SSR smoke can exercise the portal/id path.
 */
import { For } from "solid-js";
import { Button } from "../src/button.jsx";
import { Field } from "../src/field.js";
import { Dialog, Portal } from "../src/dialog.js";
import { Select, createListCollection } from "../src/select.jsx";

const frameworks = createListCollection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Solid", value: "solid" },
  ],
});

export function App(props: { open?: boolean }) {
  return (
    <main>
      <section aria-label="buttons">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost" size="sm">
          Ghost
        </Button>
        <Button variant="destructive" size="lg">
          Destructive
        </Button>
      </section>

      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Input placeholder="you@example.com" />
        <Field.HelperText>We never share it.</Field.HelperText>
        <Field.ErrorText>Email is required.</Field.ErrorText>
      </Field.Root>

      <Dialog.Root defaultOpen={props.open}>
        <Dialog.Trigger>Open dialog</Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Title>Delete account</Dialog.Title>
              <Dialog.Description>This action cannot be undone.</Dialog.Description>
              <Dialog.CloseTrigger>Cancel</Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Select.Root collection={frameworks} size="md" defaultOpen={props.open}>
        <Select.Label>Framework</Select.Label>
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Pick one" />
            <Select.Indicator>▾</Select.Indicator>
          </Select.Trigger>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              <For each={frameworks.items}>
                {(item) => (
                  <Select.Item item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                  </Select.Item>
                )}
              </For>
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </main>
  );
}
