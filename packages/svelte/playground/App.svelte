<!--
  SSR playground — the Svelte twin of the React harness, and the proof of F3.5:
  this component renders server-only (no client: directive) to static HTML, i.e.
  it works as an Astro island with zero client runtime. `open` mounts the Dialog
  + Select popovers.
-->
<script lang="ts">
  import { Button } from "../src/index.js";
  import { Field } from "../src/index.js";
  import { Dialog, Portal } from "../src/index.js";
  import { Select, createListCollection } from "../src/index.js";

  let { open = false }: { open?: boolean } = $props();

  const frameworks = createListCollection({
    items: [
      { label: "React", value: "react" },
      { label: "Vue", value: "vue" },
      { label: "Svelte", value: "svelte" },
      { label: "Solid", value: "solid" },
    ],
  });
</script>

<main>
  <section aria-label="buttons">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost" size="sm">Ghost</Button>
    <Button variant="destructive" size="lg">Destructive</Button>
  </section>

  <Field.Root>
    <Field.Label>Email</Field.Label>
    <Field.Input placeholder="you@example.com" />
    <Field.HelperText>We never share it.</Field.HelperText>
    <Field.ErrorText>Email is required.</Field.ErrorText>
  </Field.Root>

  <Dialog.Root defaultOpen={open}>
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

  <Select.Root collection={frameworks} size="md" defaultOpen={open}>
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
          {#each frameworks.items as item (item.value)}
            <Select.Item {item}>
              <Select.ItemText>{item.label}</Select.ItemText>
              <Select.ItemIndicator>✓</Select.ItemIndicator>
            </Select.Item>
          {/each}
        </Select.Content>
      </Select.Positioner>
    </Portal>
  </Select.Root>
</main>
