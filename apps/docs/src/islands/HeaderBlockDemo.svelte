<!--
  The header block in one state per Preview: the page's main preview mounts
  `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/header/svelte), not a
  copy, so the demo cannot drift from the file the docs print underneath it.

  The block ships sample links to `/pricing`, `/customers`… and a home link to
  `/`. A click on one here would leave the docs, so the demo passes the same
  links as fragments.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (the brand and the "Menu"
  button), 30rem sits between `--container-sm` and `--container-md` (the call
  to action joins the bar), 40rem between `--container-md` and
  `--container-lg` (the navigation in the bar in place of the "Menu" button)
  and 50rem crosses `--container-lg` (more room around and between). The docs
  column never reaches the 48rem `@lg` step, so the wide frame holds a 50rem
  stage and scrolls sideways inside itself; the page never does.

  The error copy holds its message the way a consumer does, as a string, and
  "Try again" clears it to "": the block treats the empty string as no error
  and shows the navigation again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import Header from "../../../../registry/blocks/header/svelte/Header.svelte";

  type State = "default" | "widths" | "empty" | "loading" | "error" | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: { error: "We could not load the menu." },
    es: { error: "No pudimos cargar el menú." },
  }[locale];

  const homeHref = "#header-home";

  const navigation = [
    {
      id: "product",
      label: "Product",
      links: [
        { id: "invoicing", label: "Invoicing", href: "#header-invoicing" },
        { id: "time-tracking", label: "Time tracking", href: "#header-time-tracking" },
        { id: "receipts", label: "Receipts", href: "#header-receipts" },
      ],
    },
    { id: "pricing", label: "Pricing", href: "#header-pricing", current: true },
    { id: "customers", label: "Customers", href: "#header-customers" },
  ];

  const withDisabled = [
    {
      id: "product",
      label: "Product",
      links: [
        { id: "invoicing", label: "Invoicing", href: "#header-invoicing" },
        { id: "time-tracking", label: "Time tracking", href: "#header-time-tracking" },
        { id: "receipts", label: "Receipts", href: "#header-receipts", disabled: true },
      ],
    },
    { id: "pricing", label: "Pricing", href: "#header-pricing", current: true },
    { id: "customers", label: "Customers", href: "#header-customers", disabled: true },
  ];

  let error = $state(copy.error);
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <Header {homeHref} {navigation} />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <Header {homeHref} {navigation} />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <Header {homeHref} {navigation} />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide">
            <Header {homeHref} {navigation} />
          </div>
        </div>
      </div>
    </div>
  {:else if shown === "empty"}
    <Header {homeHref} navigation={[]} />
  {:else if shown === "loading"}
    <Header {homeHref} {navigation} loading />
  {:else if shown === "error"}
    <Header {homeHref} {navigation} {error} onretry={() => (error = "")} />
  {:else if shown === "disabled"}
    <Header {homeHref} navigation={withDisabled} />
  {:else}
    <Header {homeHref} {navigation} />
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
