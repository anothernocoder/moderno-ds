<script lang="ts">
  import ListContainer from "../../../../registry/blocks/list-container/svelte/ListContainer.svelte";

  type State = "default" | "widths" | "empty" | "loading" | "error" | "disabled";

  let { locale = "en", state = "default" }: { locale?: "en" | "es"; state?: State } = $props();

  const error = {
    en: "We could not load your tasks.",
    es: "No pudimos cargar tus tareas.",
  }[locale];
</script>

<div class="demo-state" data-demo-state={state}>
  {#if state === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <ListContainer />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <ListContainer />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><ListContainer /></div>
        </div>
      </div>
    </div>
  {:else if state === "empty"}
    <ListContainer items={[]} />
  {:else if state === "loading"}
    <ListContainer loading />
  {:else if state === "error"}
    <ListContainer {error} />
  {:else if state === "disabled"}
    <ListContainer disabled />
  {:else}
    <ListContainer />
  {/if}
</div>

<style>
  /* `minmax(0, 1fr)`, not the implicit `auto`: an auto track grows to its
     items' min-content, and the 50rem stage would widen the track past the
     panel instead of scrolling inside its own frame. */
  .demo-widths {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 2.5rem;
  }
  /* The width is the demo's, not the design system's: the block sizes only
     from contract slots. */
  .demo-scroll {
    overflow-x: auto;
  }
  .demo-wide {
    width: 50rem;
  }
</style>
