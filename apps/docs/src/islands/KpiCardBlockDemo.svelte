<!--
  The kpi-card block in one state per Preview: the page's main preview mounts
  `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/kpi-card/svelte), not a
  copy, so the demo cannot drift from the file the docs print underneath it.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (the sparkline under the
  value), 30rem sits between `--container-sm` and `--container-md` (side by
  side), 40rem between `--container-md` and `--container-lg` (a larger value
  and a wider line) and 50rem crosses `--container-lg` (the widest line). The
  docs column never reaches the 48rem `@lg` step, so the wide frame holds a
  50rem stage and scrolls sideways inside itself; the page never does.

  The error copy holds its message the way a consumer does, as a string, and
  "Try again" clears it to "": the block treats the empty string as no error
  and shows the number again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import KpiCard from "../../../../registry/blocks/kpi-card/svelte/KpiCard.svelte";

  type State = "default" | "widths" | "negative" | "empty" | "loading" | "error" | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const errorMessage = {
    en: "We could not load this number.",
    es: "No pudimos cargar esta métrica.",
  }[locale];

  const churn = {
    value: "2.4%",
    delta: "+0.6 pts",
    tone: "negative" as const,
    caption: "vs last month",
    trend: [1.6, 1.7, 1.6, 1.8, 1.9, 1.8, 2.0, 2.1, 2.0, 2.2, 2.3, 2.4],
  };

  let error = $state(errorMessage);
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <KpiCard />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <KpiCard />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <KpiCard />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><KpiCard /></div>
        </div>
      </div>
    </div>
  {:else if shown === "negative"}
    <KpiCard label="Churn rate" metric={churn} />
  {:else if shown === "empty"}
    <KpiCard metric={null} />
  {:else if shown === "loading"}
    <KpiCard loading />
  {:else if shown === "error"}
    <KpiCard {error} onretry={() => (error = "")} />
  {:else if shown === "disabled"}
    <KpiCard disabled />
  {:else}
    <KpiCard />
  {/if}
</div>

<style>
  /* `minmax(0, 1fr)`, not the implicit `auto`: an auto track grows to its
     items' min-content, and the 50rem stage would widen the track past the
     frame instead of scrolling inside it. */
  .demo-widths {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 2.5rem;
  }
  .demo-scroll {
    overflow-x: auto;
  }
  /* The width is the demo's, not the design system's: the block sizes only
     from contract slots. */
  .demo-wide {
    width: 50rem;
  }
</style>
