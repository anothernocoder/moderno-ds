<!--
  A labelled Divider at each of its three label alignments —
  @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Divider } from "@moderno-ui/svelte";
</script>

<div class="demo-stack">
  <Divider align="start">Start</Divider>
  <Divider align="center">Center</Divider>
  <Divider align="end">End</Divider>
</div>
