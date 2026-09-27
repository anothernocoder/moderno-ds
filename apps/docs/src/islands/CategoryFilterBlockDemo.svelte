<!--
  The category-filter block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/category-filter/svelte),
  not a copy, so the demo cannot drift from the file the docs print underneath
  it.

  The block holds the filters and leaves the products to its consumer: every
  copy passes a small grid of products as its children. The default copy is
  live, the way a consumer wires it: it keeps the filters the block reports
  and shows only the products that match them.

  `widths` frames the same file four times around the block's steps
  (ADR-0005): 18rem is below `--container-sm` (the Filters button fills its
  row), 30rem sits between `--container-sm` and `--container-md` (the button
  beside the heading), 40rem sits at `--container-md` (the frame's own padding
  keeps it just under the step on a wide page, and the default preview crosses
  it) and 50rem crosses `--container-lg` (the sidebar beside the products,
  wider, with more room above and below). The docs column never reaches the
  48rem `@lg` step, so the wide frame holds a 50rem stage and scrolls sideways
  inside itself; the page never does.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import CategoryFilter from "../../../../registry/blocks/category-filter/svelte/CategoryFilter.svelte";

  type State = "default" | "widths" | "empty" | "loading" | "error" | "disabled";

  interface Product {
    name: string;
    price: number;
    category: string;
    colour: string;
    material: string;
  }

  interface Filters {
    options: Record<string, string[]>;
    price: [number, number] | null;
  }

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: {
      error: "We could not load the filters.",
      count: (n: number) => (n === 1 ? "1 product" : `${n} products`),
      none: "No products match these filters.",
      facets: {
        category: ["Category", { mugs: "Mugs", bowls: "Bowls", plates: "Plates", vases: "Vases" }],
        colour: ["Colour", { sage: "Sage", oat: "Oat", charcoal: "Charcoal", clay: "Clay" }],
        material: ["Material", { stoneware: "Stoneware", porcelain: "Porcelain", glass: "Glass" }],
      },
      names: [
        "Sage mug",
        "Oat mug",
        "Espresso cup",
        "Clay bowl",
        "Sage bowl",
        "Serving bowl",
        "Dinner plate",
        "Side plate",
        "Platter",
        "Bud vase",
        "Tall vase",
        "Round vase",
      ],
    },
    es: {
      error: "No pudimos cargar los filtros.",
      count: (n: number) => (n === 1 ? "1 producto" : `${n} productos`),
      none: "Ningún producto coincide con estos filtros.",
      facets: {
        category: ["Categoría", { mugs: "Tazas", bowls: "Cuencos", plates: "Platos", vases: "Jarrones" }],
        colour: ["Color", { sage: "Salvia", oat: "Avena", charcoal: "Carbón", clay: "Arcilla" }],
        material: ["Material", { stoneware: "Gres", porcelain: "Porcelana", glass: "Vidrio" }],
      },
      names: [
        "Taza salvia",
        "Taza avena",
        "Taza de espresso",
        "Cuenco de arcilla",
        "Cuenco salvia",
        "Cuenco para servir",
        "Plato llano",
        "Plato de postre",
        "Fuente",
        "Florero",
        "Jarrón alto",
        "Jarrón redondo",
      ],
    },
  }[locale];

  const catalogue: Omit<Product, "name">[] = [
    { price: 28, category: "mugs", colour: "sage", material: "stoneware" },
    { price: 32, category: "mugs", colour: "oat", material: "porcelain" },
    { price: 22, category: "mugs", colour: "charcoal", material: "porcelain" },
    { price: 45, category: "bowls", colour: "clay", material: "stoneware" },
    { price: 38, category: "bowls", colour: "sage", material: "stoneware" },
    { price: 64, category: "bowls", colour: "oat", material: "porcelain" },
    { price: 34, category: "plates", colour: "oat", material: "stoneware" },
    { price: 24, category: "plates", colour: "sage", material: "porcelain" },
    { price: 78, category: "plates", colour: "charcoal", material: "stoneware" },
    { price: 40, category: "vases", colour: "sage", material: "glass" },
    { price: 120, category: "vases", colour: "clay", material: "glass" },
    { price: 165, category: "vases", colour: "charcoal", material: "glass" },
  ];
  const products: Product[] = catalogue.map((product, index) => ({
    ...product,
    name: copy.names[index]!,
  }));

  const facetIds = ["category", "colour", "material"] as const;
  const facets = facetIds.map((id) => {
    const [label, options] = copy.facets[id] as [string, Record<string, string>];
    return {
      id,
      label,
      options: Object.entries(options).map(([value, optionLabel]) => ({
        value,
        label: optionLabel,
        count: products.filter((product) => product[id] === value).length,
      })),
    };
  });
  const price = { min: 0, max: 200, step: 10, currency: "EUR" };

  let filters = $state<Filters>({ options: {}, price: null });
  let error = $state(copy.error);

  const shownProducts = $derived(
    products.filter((product) => {
      const range = filters.price;
      if (range && (product.price < range[0] || product.price > range[1])) return false;
      return facetIds.every((id) => {
        const picked = filters.options[id] ?? [];
        return picked.length === 0 || picked.includes(product[id]);
      });
    }),
  );
</script>

{#snippet results(list: Product[])}
  <div class="grid gap-4">
    <p class="text-ui-md text-muted-foreground" aria-live="polite">{copy.count(list.length)}</p>
    {#if list.length === 0}
      <p
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        {copy.none}
      </p>
    {:else}
      <ul class="grid grid-cols-2 gap-4 @lg:grid-cols-3">
        {#each list as product (product.name)}
          <li class="grid gap-2">
            <div class="aspect-4/3 rounded-lg bg-muted"></div>
            <div class="flex flex-wrap items-baseline justify-between gap-x-2">
              <span class="text-ui-md font-medium">{product.name}</span>
              <span class="text-ui-md text-muted-foreground tabular-nums">€{product.price}</span>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/snippet}

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <CategoryFilter {facets} {price}>{@render results(products.slice(0, 4))}</CategoryFilter>
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <CategoryFilter {facets} {price}>{@render results(products.slice(0, 4))}</CategoryFilter>
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <CategoryFilter {facets} {price}>{@render results(products.slice(0, 4))}</CategoryFilter>
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide">
            <CategoryFilter {facets} {price}>{@render results(products.slice(0, 6))}</CategoryFilter>
          </div>
        </div>
      </div>
    </div>
  {:else if shown === "empty"}
    <CategoryFilter facets={[]} price={null}>{@render results(products.slice(0, 4))}</CategoryFilter>
  {:else if shown === "loading"}
    <CategoryFilter loading>{@render results(products.slice(0, 4))}</CategoryFilter>
  {:else if shown === "error"}
    <CategoryFilter {facets} {price} {error} onretry={() => (error = "")}>
      {@render results(products.slice(0, 4))}
    </CategoryFilter>
  {:else if shown === "disabled"}
    <CategoryFilter {facets} {price} disabled>
      {@render results(products.slice(0, 4))}
    </CategoryFilter>
  {:else}
    <CategoryFilter {facets} {price} onfilterschange={(next) => (filters = next)}>
      {@render results(shownProducts)}
    </CategoryFilter>
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
