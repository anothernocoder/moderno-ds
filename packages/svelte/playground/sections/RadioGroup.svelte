<!--
  RadioGroup — one native radio per item, bound to its label and text by
  ids; the checked item, the orientation, the disabled group and the tile
  grid with its media and its invalid edges reach the server string.
-->
<script lang="ts">
  import { RadioGroup } from "../../src/exports/radio-group.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="radio groups">
  <RadioGroup.Root defaultValue="standard">
    <RadioGroup.Label>Shipping</RadioGroup.Label>
    <RadioGroup.Item value="standard">
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>
        Standard
        <RadioGroup.ItemDescription>3–5 business days</RadioGroup.ItemDescription>
      </RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
    <RadioGroup.Item value="express">
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>
        Express
        <RadioGroup.ItemDescription>1–2 business days</RadioGroup.ItemDescription>
      </RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  </RadioGroup.Root>
  <RadioGroup.Root size="sm" orientation="horizontal" disabled>
    <RadioGroup.Label>Billing</RadioGroup.Label>
    <RadioGroup.Item value="monthly">
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>Monthly</RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
    <RadioGroup.Item value="yearly">
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>Yearly</RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  </RadioGroup.Root>
  <RadioGroup.Root variant="tile" columns={2} aspectRatio="4:3" defaultValue="title">
    <RadioGroup.Label>Layout</RadioGroup.Label>
    <RadioGroup.Item value="title">
      <RadioGroup.ItemMedia>
        <svg viewBox="0 0 4 3" aria-hidden="true">
          <rect x="1" y="1" width="2" height="1" />
        </svg>
      </RadioGroup.ItemMedia>
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>
        Title
        <RadioGroup.ItemDescription>A heading alone</RadioGroup.ItemDescription>
      </RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
    <RadioGroup.Item value="split" disabled>
      <RadioGroup.ItemMedia>
        <svg viewBox="0 0 4 3" aria-hidden="true">
          <rect x="0" y="0" width="2" height="3" />
        </svg>
      </RadioGroup.ItemMedia>
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>Split</RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  </RadioGroup.Root>
  <RadioGroup.Root variant="tile" columns={2} aspectRatio="4:3" invalid defaultValue="light">
    <RadioGroup.Label>Cover</RadioGroup.Label>
    <RadioGroup.Item value="light">
      <RadioGroup.ItemMedia>
        <svg viewBox="0 0 4 3" aria-hidden="true">
          <rect x="1" y="1" width="2" height="1" />
        </svg>
      </RadioGroup.ItemMedia>
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>Light</RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
    <RadioGroup.Item value="dark">
      <RadioGroup.ItemMedia>
        <svg viewBox="0 0 4 3" aria-hidden="true">
          <rect x="0" y="0" width="4" height="3" />
        </svg>
      </RadioGroup.ItemMedia>
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>Dark</RadioGroup.ItemText>
      <RadioGroup.ItemHiddenInput />
    </RadioGroup.Item>
  </RadioGroup.Root>
</section>
