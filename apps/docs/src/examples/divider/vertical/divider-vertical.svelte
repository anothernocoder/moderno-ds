<!--
  Bare vertical Dividers between inline items — each rule takes its length
  from the row — @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Divider } from "@moderno-ui/svelte";
</script>

<div class="demo-row">
  <span>Overview</span>
  <Divider orientation="vertical" />
  <span>Activity</span>
  <Divider orientation="vertical" />
  <span>Settings</span>
</div>
