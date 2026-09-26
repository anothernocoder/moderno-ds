<script lang="ts">
  import { Chip } from "@moderno-ui/svelte";

  let tags = $state(["React", "Vue", "Svelte", "Solid"]);
</script>

<div class="demo-row">
  {#each tags as tag (tag)}
    <Chip removable removeLabel={`Remove ${tag}`} onRemove={() => (tags = tags.filter((t) => t !== tag))}>
      {tag}
    </Chip>
  {/each}
</div>
