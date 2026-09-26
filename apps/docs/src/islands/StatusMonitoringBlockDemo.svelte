<!--
  The status-monitoring block in one state per Preview: the page's main
  preview mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/status-monitoring/svelte),
  not a copy, so the demo cannot drift from the file the docs print underneath.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (everything stacked), 30rem
  sits between `--container-sm` and `--container-md` (the header and each
  service's name and status line up), 40rem between `--container-md` and
  `--container-lg` (taller bars, a larger heading) and 50rem crosses
  `--container-lg` (two services a row). The docs column never reaches the 48rem
  `@lg` step, so the wide frame holds a 50rem stage and scrolls sideways inside
  itself; the page never does.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import StatusMonitoring from "../../../../registry/blocks/status-monitoring/svelte/StatusMonitoring.svelte";

  type State = "default" | "widths" | "outage" | "empty" | "loading" | "error" | "disabled";

  let { locale = "en", state = "default" }: { locale?: "en" | "es"; state?: State } = $props();

  const copy = {
    en: { error: "We could not load the status of your services." },
    es: { error: "No pudimos cargar el estado de tus servicios." },
  }[locale];

  type Day = "operational" | "degraded" | "outage" | "maintenance" | "no-data";

  const days = (length: number, day: Day): Day[] => Array.from({ length }, () => day);

  const outage = [
    {
      id: "api",
      name: "API",
      status: "outage" as const,
      uptime: "98.62%",
      history: [...days(27, "operational"), "degraded" as const, ...days(2, "outage")],
    },
    {
      id: "search",
      name: "Search",
      status: "operational" as const,
      uptime: "100%",
      history: [...days(18, "no-data"), ...days(12, "operational")],
    },
  ];
</script>

<div class="demo-state" data-demo-state={state}>
  {#if state === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <StatusMonitoring />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <StatusMonitoring />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <StatusMonitoring />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><StatusMonitoring /></div>
        </div>
      </div>
    </div>
  {:else if state === "outage"}
    <StatusMonitoring services={outage} />
  {:else if state === "empty"}
    <StatusMonitoring services={[]} />
  {:else if state === "loading"}
    <StatusMonitoring loading />
  {:else if state === "error"}
    <StatusMonitoring error={copy.error} />
  {:else if state === "disabled"}
    <StatusMonitoring disabled />
  {:else}
    <StatusMonitoring />
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
