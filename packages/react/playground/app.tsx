/**
 * SSR playground — the reusable harness that validates Moderno's second
 * guarantee: server-render + hydrate with zero React warnings.
 *
 * It mounts all four reference primitives in their default (closed) state. Each
 * one is deliberately exercised for an SSR hazard:
 *   - Button   — the trivial baseline (no ids, no portal).
 *   - Field    — `useId`-generated label/control ids must match across render.
 *   - Dialog   — a Portal + focus-trap machine that must emit a stable,
 *                hydration-safe trigger while its content stays unmounted-visible.
 *   - Select   — a collection + popover whose hidden native <select> and ids
 *                must serialise identically on server and client.
 *
 * `App` takes no props so the same tree can be `renderToString`-ed on the server
 * and `hydrateRoot`-ed on the client. The Phase-2 SSR test drives both halves;
 * Phases 3–4 reuse this shape for the other frameworks.
 */
import { Button } from "../src/button.js";
import { Field } from "../src/field.js";
import { Dialog, Portal } from "../src/dialog.js";
import { Select, createListCollection } from "../src/select.js";

const frameworks = createListCollection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Solid", value: "solid" },
  ],
});

export function App() {
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

      <Dialog.Root>
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

      <Select.Root collection={frameworks} size="md">
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
              {frameworks.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator>✓</Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </main>
  );
}
