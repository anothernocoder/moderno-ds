<!--
  Live Button preview — the real @moderno-ui/svelte primitive across its variants
  and sizes. Hydrated as an island; painted by @moderno-ui/css from the active
  theme, so it re-skins live with the Theme Builder and the color-scheme toggle.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example") — the source below the live demo is this file, raw-imported, so
  it cannot drift from what actually renders.
-->
<script lang="ts">
  import { Button } from "@moderno-ui/svelte";
</script>

<div class="demo-row">
  <Button variant="primary">Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="destructive">Destructive</Button>
</div>
<div class="demo-row">
  <Button size="sm">Small</Button>
  <Button size="md">Medium</Button>
  <Button size="lg">Large</Button>
</div>
