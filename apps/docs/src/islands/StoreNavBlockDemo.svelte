<!--
  The store-nav block in one state per Preview: the page's main preview mounts
  `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/store-nav/svelte), not a
  copy, so the demo cannot drift from the file the docs print underneath it.

  The block ships sample links to `/workspace/desks`, `/products/…`… and a home
  link to `/`. A click on one here would leave the docs, so the demo passes the
  same categories and suggestions with fragment links.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (the brand, the cart and
  the "Menu" button, the search on its own row), 30rem sits between
  `--container-sm` and `--container-md` (more room at the ends), 40rem between
  `--container-md` and `--container-lg` (the categories in the bar in place of
  the "Menu" button) and 50rem crosses `--container-lg` (the search joins the
  bar). The docs column never reaches the 48rem `@lg` step, so the wide frame
  holds a 50rem stage and scrolls sideways inside itself; the page never does.

  A search goes where a store's would, to a results page: the default copy
  turns `onsearch` into a `#store-nav-search-<query>` fragment, so Enter stays
  on the docs page and the address shows what the block handed over.

  The error copy holds its message the way a consumer does, as a string, and
  "Try again" clears it to "": the block treats the empty string as no error
  and shows the categories again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import StoreNav from "../../../../registry/blocks/store-nav/svelte/StoreNav.svelte";

  type State = "default" | "widths" | "empty" | "loading" | "error" | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: { error: "We could not load the categories." },
    es: { error: "No pudimos cargar las categorías." },
  }[locale];

  const homeHref = "#store-nav-home";

  const workspace = {
    id: "workspace",
    label: "Workspace",
    links: [
      { id: "desks", label: "Desks", href: "#store-nav-desks" },
      { id: "chairs", label: "Chairs", href: "#store-nav-chairs" },
      { id: "lamps", label: "Lamps", href: "#store-nav-lamps" },
    ],
  };
  const stationery = {
    id: "stationery",
    label: "Stationery",
    links: [
      { id: "notebooks", label: "Notebooks", href: "#store-nav-notebooks" },
      { id: "pens", label: "Pens", href: "#store-nav-pens" },
      { id: "planners", label: "Planners", href: "#store-nav-planners" },
    ],
  };
  const bags = { id: "bags", label: "Bags", href: "#store-nav-bags", current: true };

  const categories = [workspace, stationery, bags];

  const withDisabled = [
    {
      ...workspace,
      links: workspace.links.map((link) => ({ ...link, disabled: link.id === "lamps" })),
    },
    stationery,
    bags,
    { id: "sale", label: "Sale", href: "#store-nav-sale", disabled: true },
  ];

  const suggestions = [
    { value: "oak-desk", label: "Oak standing desk", href: "#store-nav-oak-standing-desk" },
    { value: "task-chair", label: "Mesh task chair", href: "#store-nav-mesh-task-chair" },
    { value: "desk-lamp", label: "Brass desk lamp", href: "#store-nav-brass-desk-lamp" },
    { value: "linen-notebook", label: "Linen notebook", href: "#store-nav-linen-notebook" },
    { value: "fountain-pen", label: "Steel fountain pen", href: "#store-nav-steel-fountain-pen" },
    { value: "canvas-tote", label: "Canvas tote", href: "#store-nav-canvas-tote" },
  ];

  let error = $state(copy.error);

  function search(query: string) {
    location.hash = `store-nav-search-${encodeURIComponent(query)}`;
  }
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <StoreNav {homeHref} {categories} {suggestions} />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <StoreNav {homeHref} {categories} {suggestions} />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <StoreNav {homeHref} {categories} {suggestions} />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide">
            <StoreNav {homeHref} {categories} {suggestions} />
          </div>
        </div>
      </div>
    </div>
  {:else if shown === "empty"}
    <StoreNav {homeHref} categories={[]} suggestions={[]} cartCount={0} />
  {:else if shown === "loading"}
    <StoreNav {homeHref} {categories} {suggestions} loading />
  {:else if shown === "error"}
    <StoreNav {homeHref} {categories} {suggestions} {error} onretry={() => (error = "")} />
  {:else if shown === "disabled"}
    <StoreNav {homeHref} categories={withDisabled} {suggestions} />
  {:else}
    <StoreNav {homeHref} {categories} {suggestions} onsearch={search} />
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
