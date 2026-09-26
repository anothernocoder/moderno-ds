<!--
  The activity-feed block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/activity-feed/svelte), not
  a copy, so the demo cannot drift from the file the docs print underneath it.

  `widths` frames the same file three times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm`, 30rem sits between
  `--container-sm` and `--container-md`, and 50rem crosses `--container-lg`.
  The docs column never reaches the 48rem `@lg` step, so the wide frame holds a
  50rem stage and scrolls sideways inside itself; the page never does.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import ActivityFeed from "../../../../registry/blocks/activity-feed/svelte/ActivityFeed.svelte";

  type State = "default" | "widths" | "empty" | "loading" | "error" | "disabled";

  let { locale = "en", state = "default" }: { locale?: "en" | "es"; state?: State } = $props();

  const error = {
    en: "We could not load the activity feed.",
    es: "No pudimos cargar la actividad.",
  }[locale];
</script>

<div class="demo-state" data-demo-state={state}>
  {#if state === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <ActivityFeed />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <ActivityFeed />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><ActivityFeed /></div>
        </div>
      </div>
    </div>
  {:else if state === "empty"}
    <ActivityFeed events={[]} />
  {:else if state === "loading"}
    <ActivityFeed loading />
  {:else if state === "error"}
    <ActivityFeed {error} />
  {:else if state === "disabled"}
    <ActivityFeed disabled />
  {:else}
    <ActivityFeed />
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
  .demo-scroll {
    overflow-x: auto;
  }
  .demo-wide {
    width: 50rem;
  }
</style>
