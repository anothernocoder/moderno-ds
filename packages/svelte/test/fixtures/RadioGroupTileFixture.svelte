<script lang="ts">
  import { RadioGroup } from "../../src/index.js";
  import type {
    RadioGroupAspectRatio,
    RadioGroupColumns,
    RadioGroupValueChangeDetails,
  } from "../../src/index.js";

  let {
    columns = undefined,
    aspectRatio = undefined,
    onValueChange = undefined,
  }: {
    columns?: RadioGroupColumns;
    aspectRatio?: RadioGroupAspectRatio;
    onValueChange?: (details: RadioGroupValueChangeDetails) => void;
  } = $props();

  /** A 1×1 transparent GIF: jsdom never loads it, but the `<img>` is real. */
  const pixel = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

  const layouts = [
    { value: "title", label: "Title", description: "A heading alone" },
    { value: "split", label: "Split", description: "Text beside a picture" },
    { value: "grid", label: "Grid", description: "Four pictures", disabled: true },
  ];
</script>

<RadioGroup.Root variant="tile" {columns} {aspectRatio} defaultValue="title" {onValueChange}>
  <RadioGroup.Label>Layout</RadioGroup.Label>
  {#each layouts as layout (layout.value)}
    <RadioGroup.Item value={layout.value} disabled={layout.disabled}>
      <RadioGroup.ItemMedia>
        <img src={pixel} alt="" />
      </RadioGroup.ItemMedia>
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>
        {layout.label}
        <RadioGroup.ItemDescription>{layout.description}</RadioGroup.ItemDescription>
      </RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  {/each}
  <RadioGroup.Item value="blank">
    <RadioGroup.ItemMedia>
      <img src={pixel} alt="Blank slide" />
    </RadioGroup.ItemMedia>
    <RadioGroup.ItemControl />
    <RadioGroup.ItemHiddenInput />
  </RadioGroup.Item>
</RadioGroup.Root>
