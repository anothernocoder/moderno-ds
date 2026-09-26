<script lang="ts">
  import { Toggle } from "@moderno-ui/svelte";
</script>

<Toggle.Root>
  <Toggle.Indicator>
    {#snippet fallback()}☆{/snippet}
    ★
  </Toggle.Indicator>
  Favorite
</Toggle.Root>
