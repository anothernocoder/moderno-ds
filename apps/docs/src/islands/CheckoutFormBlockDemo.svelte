<!--
  The checkout-form block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/checkout-form/svelte),
  not a copy, so the demo cannot drift from the file the docs print underneath
  it.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (every field on its own
  row, the buttons stacked full width), 30rem sits between `--container-sm` and
  `--container-md` (fields paired off, the buttons on one row), 40rem between
  `--container-md` and `--container-lg` (a larger heading, the delivery options
  side by side) and 50rem crosses `--container-lg` (each group's title beside
  its fields, more room above and below). The docs column never reaches the
  48rem `@lg` step, so the wide frame holds a 50rem stage and scrolls sideways
  inside itself; the page never does.

  The default copy walks the two steps the way a checkout screen does:
  "Continue to payment" shows the payment step and "Back to shipping" returns.
  The error copy holds its messages the way a consumer does: submitting again
  clears them to "" and {}, and the block treats the empty string as no error.
  Every copy stops the browser's own submit, so the docs page never navigates.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import CheckoutForm from "../../../../registry/blocks/checkout-form/svelte/CheckoutForm.svelte";

  type State =
    | "default"
    | "payment"
    | "widths"
    | "empty"
    | "loading"
    | "error"
    | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: {
      error: "We could not save your address.",
      postalCode: "Enter a postal code, like 94103.",
    },
    es: {
      error: "No pudimos guardar tu dirección.",
      postalCode: "Escribe un código postal, como 28013.",
    },
  }[locale];

  let step: "shipping" | "payment" = $state("shipping");
  let error = $state(copy.error);
  let errors: Record<string, string> = $state({ postalCode: copy.postalCode });

  const stay = (event: SubmitEvent) => event.preventDefault();

  function advance(event: SubmitEvent) {
    event.preventDefault();
    step = "payment";
  }

  function submitAgain(event: SubmitEvent) {
    event.preventDefault();
    error = "";
    errors = {};
  }
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <CheckoutForm onsubmit={stay} />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <CheckoutForm onsubmit={stay} />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <CheckoutForm onsubmit={stay} />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><CheckoutForm onsubmit={stay} /></div>
        </div>
      </div>
    </div>
  {:else if shown === "payment"}
    <CheckoutForm step="payment" onsubmit={stay} />
  {:else if shown === "empty"}
    <CheckoutForm deliveryOptions={[]} onsubmit={stay} />
  {:else if shown === "loading"}
    <CheckoutForm loading />
  {:else if shown === "error"}
    <CheckoutForm {error} {errors} onsubmit={submitAgain} />
  {:else if shown === "disabled"}
    <CheckoutForm disabled />
  {:else}
    <CheckoutForm
      {step}
      onsubmit={step === "shipping" ? advance : stay}
      onback={() => (step = "shipping")}
    />
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
