<!--
  The pricing block in one state per Preview: the page's main preview mounts
  `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/pricing/svelte), not a
  copy, so the demo cannot drift from the file the docs print underneath it.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (plans stacked, one feature
  per line), 30rem sits between `--container-sm` and `--container-md` (plans
  stacked, features in two columns), 40rem between `--container-md` and
  `--container-lg` (plans side by side, a larger title) and 50rem crosses
  `--container-lg` (more room around and between the plans). The docs column
  never reaches the 48rem `@lg` step, so the wide frame holds a 50rem stage and
  scrolls sideways inside itself; the page never does.

  The error copy holds its message the way a consumer does, as a string, and
  "Try again" clears it to "": the block treats the empty string as no error
  and shows its plans again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import Pricing from "../../../../registry/blocks/pricing/svelte/Pricing.svelte";

  type State = "default" | "widths" | "two-plans" | "empty" | "loading" | "error" | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: {
      error: "We could not load the plans.",
      twoPlans: [
        {
          id: "monthly",
          name: "Monthly",
          price: "$29",
          period: "/month",
          description: "Pay as you go. Cancel at any time.",
          features: ["Every Pro feature", "Email support"],
          action: "Choose monthly",
        },
        {
          id: "yearly",
          name: "Yearly",
          price: "$290",
          period: "/year",
          description: "Two months free when you pay for the year.",
          features: ["Every Pro feature", "Priority support"],
          action: "Choose yearly",
          highlighted: true,
          badge: "Save 17%",
        },
      ],
    },
    es: {
      error: "No pudimos cargar los planes.",
      twoPlans: [
        {
          id: "monthly",
          name: "Mensual",
          price: "29 $",
          period: "/mes",
          description: "Paga mes a mes. Cancela cuando quieras.",
          features: ["Todo lo de Pro", "Soporte por correo"],
          action: "Elegir mensual",
        },
        {
          id: "yearly",
          name: "Anual",
          price: "290 $",
          period: "/año",
          description: "Dos meses gratis si pagas el año.",
          features: ["Todo lo de Pro", "Soporte prioritario"],
          action: "Elegir anual",
          highlighted: true,
          badge: "Ahorra un 17 %",
        },
      ],
    },
  }[locale];

  let error = $state(copy.error);
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <Pricing />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <Pricing />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <Pricing />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><Pricing /></div>
        </div>
      </div>
    </div>
  {:else if shown === "two-plans"}
    <Pricing plans={copy.twoPlans} />
  {:else if shown === "empty"}
    <Pricing plans={[]} />
  {:else if shown === "loading"}
    <Pricing loading />
  {:else if shown === "error"}
    <Pricing {error} onretry={() => (error = "")} />
  {:else if shown === "disabled"}
    <Pricing disabled />
  {:else}
    <Pricing />
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
