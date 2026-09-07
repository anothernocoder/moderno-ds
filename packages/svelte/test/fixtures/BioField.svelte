<script lang="ts">
  import { Field } from "../../src/index.js";
  import type { FieldSize } from "@moderno-ui/core";
  let { size = undefined }: { size?: FieldSize } = $props();
</script>

<Field.Root {size}>
  <Field.Label>Bio</Field.Label>
  <Field.Textarea placeholder="Tell us about yourself" />
</Field.Root>
