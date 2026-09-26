<!--
  Divider — CSS-only, but proves an optional child (the label) and the
  conditional separator role serialise. Mounted in every recipe cell the
  props table advertises, captioned × vertical included.
-->
<script lang="ts">
  import { Divider } from "../../src/exports/divider.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="dividers">
  <Divider />
  <Divider align="start">Or</Divider>
  <Divider orientation="vertical" />
  <Divider orientation="vertical">Or</Divider>
</section>
