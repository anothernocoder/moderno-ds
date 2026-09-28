<!--
  VectorPad — Moderno's vector-pad machine: the handle reaches the server as a
  slider named by its label that says both values, the root carries the
  handle's place inline, and each field shows its axis's value.
-->
<script lang="ts">
  import { VectorPad } from "../../src/exports/vector-pad.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="vector-pad">
  <VectorPad.Root defaultValue={{ x: 20, y: -10 }}>
    <VectorPad.Label>Offset</VectorPad.Label>
    <VectorPad.Control>
      <VectorPad.Grid />
      <VectorPad.Crosshair />
      <VectorPad.Thumb />
    </VectorPad.Control>
    <VectorPad.Input axis="x" />
    <VectorPad.Input axis="y" />
  </VectorPad.Root>
  <VectorPad.Root size="sm" min={0} max={{ x: 100, y: 50 }} step={5} invertY>
    <VectorPad.Label>Position</VectorPad.Label>
    <VectorPad.Control>
      <VectorPad.Thumb />
    </VectorPad.Control>
  </VectorPad.Root>
</section>
