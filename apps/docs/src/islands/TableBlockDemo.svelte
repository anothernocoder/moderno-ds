<!--
  The table block in one state per Preview: the page's main preview mounts
  `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/table/svelte), not a
  copy, so the demo cannot drift from the file the docs print underneath it.
  Sorting, selection and paging are live: the block keeps its own state.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (the table scrolls inside
  its frame, the page row centred), 30rem sits between `--container-sm` and
  `--container-md` (the page row at the end), 40rem between `--container-md`
  and `--container-lg` (a larger heading) and 50rem crosses `--container-lg`
  (the Issued column, each customer's email, more room above and below). The
  docs column never reaches the 48rem `@lg` step, so the wide frame holds a
  50rem stage and scrolls sideways inside itself; the page never does.

  `one-page` passes three invoices, fewer than a page, so no page row shows.
  `dollars` formats the amounts in US dollars with the block's `formatAmount`.

  The error copy holds its message the way a consumer does, as a string, and
  "Try again" clears it to "": the block treats the empty string as no error
  and shows the invoices again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import Table from "../../../../registry/blocks/table/svelte/Table.svelte";

  type State =
    | "default"
    | "widths"
    | "one-page"
    | "dollars"
    | "empty"
    | "loading"
    | "error"
    | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: { error: "We could not load your invoices." },
    es: { error: "No pudimos cargar tus facturas." },
  }[locale];

  const fewInvoices = [
    {
      id: "inv-1042",
      number: "INV-1042",
      customer: "Acme Studio",
      email: "billing@acme.example",
      issued: "12 Jan 2026",
      amount: 2400,
      status: "Paid",
      statusVariant: "success" as const,
    },
    {
      id: "inv-1041",
      number: "INV-1041",
      customer: "Northwind Traders",
      email: "ap@northwind.example",
      issued: "9 Jan 2026",
      amount: 1250.5,
      status: "Pending",
      statusVariant: "warning" as const,
    },
    {
      id: "inv-1040",
      number: "INV-1040",
      customer: "Lumen Labs",
      email: "finance@lumen.example",
      issued: "5 Jan 2026",
      amount: 860,
      status: "Overdue",
      statusVariant: "error" as const,
    },
  ];

  const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

  let error = $state(copy.error);
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <Table />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <Table />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <Table />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><Table /></div>
        </div>
      </div>
    </div>
  {:else if shown === "one-page"}
    <Table invoices={fewInvoices} />
  {:else if shown === "dollars"}
    <Table invoices={fewInvoices} formatAmount={(amount) => dollars.format(amount)} />
  {:else if shown === "empty"}
    <Table invoices={[]} />
  {:else if shown === "loading"}
    <Table loading />
  {:else if shown === "error"}
    <Table {error} onretry={() => (error = "")} />
  {:else if shown === "disabled"}
    <Table disabled />
  {:else}
    <Table />
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
