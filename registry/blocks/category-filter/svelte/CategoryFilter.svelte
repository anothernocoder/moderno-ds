<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    Accordion,
    Alert,
    Button,
    Checkbox,
    Drawer,
    Portal,
    Skeleton,
    Slider,
  } from "@moderno-ui/svelte";

  interface FilterOption {
    value: string;
    label: string;
    count?: number;
  }

  interface FilterFacet {
    id: string;
    label: string;
    options: FilterOption[];
  }

  interface PriceFilter {
    min: number;
    max: number;
    step?: number;
    currency?: string;
  }

  interface CategoryFilters {
    options: Record<string, string[]>;
    price: [number, number] | null;
  }

  interface Props {
    heading?: string;
    description?: string;
    facets?: FilterFacet[];
    price?: PriceFilter | null;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    children?: Snippet;
    onfilterschange?: (filters: CategoryFilters) => void;
    onretry?: () => void;
  }

  const sampleFacets: FilterFacet[] = [
    {
      id: "category",
      label: "Category",
      options: [
        { value: "mugs", label: "Mugs", count: 12 },
        { value: "bowls", label: "Bowls", count: 9 },
        { value: "plates", label: "Plates", count: 7 },
        { value: "vases", label: "Vases", count: 4 },
      ],
    },
    {
      id: "colour",
      label: "Colour",
      options: [
        { value: "sage", label: "Sage", count: 10 },
        { value: "oat", label: "Oat", count: 8 },
        { value: "charcoal", label: "Charcoal", count: 5 },
        { value: "clay", label: "Clay", count: 3 },
      ],
    },
    {
      id: "material",
      label: "Material",
      options: [
        { value: "stoneware", label: "Stoneware", count: 14 },
        { value: "porcelain", label: "Porcelain", count: 11 },
        { value: "glass", label: "Glass", count: 7 },
      ],
    },
  ];

  const samplePrice: PriceFilter = { min: 0, max: 200, step: 10, currency: "EUR" };

  const placeholders = ["first", "second", "third"];

  function formatPrice(value: number, currency = "EUR") {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  }

  let {
    heading = "New arrivals",
    description = "Stoneware, porcelain and glass, made by hand in small batches.",
    facets = sampleFacets,
    price = samplePrice,
    error,
    loading = false,
    disabled = false,
    children,
    onfilterschange,
    onretry,
  }: Props = $props();

  let picked = $state<Record<string, string[]>>({});
  let chosenPrice = $state<[number, number] | null>(null);
  let drawerOpen = $state(false);
  let movedPrice: [number, number] | null = null;

  const priceRange = $derived<[number, number] | null>(
    price ? (chosenPrice ?? [price.min, price.max]) : null,
  );
  const activeCount = $derived(
    Object.values(picked).reduce((total, values) => total + values.length, 0) +
      (chosenPrice ? 1 : 0),
  );
  const sections = $derived([
    ...facets.map((facet) => ({ id: facet.id, label: facet.label, facet })),
    ...(price ? [{ id: "price", label: "Price", facet: undefined }] : []),
  ]);

  function report(options: Record<string, string[]>, range: [number, number] | null) {
    onfilterschange?.({ options, price: range });
  }

  function toggle(facetId: string, value: string, checked: boolean) {
    const current = picked[facetId] ?? [];
    const values = checked ? [...current, value] : current.filter((item) => item !== value);
    picked = { ...picked, [facetId]: values };
    report(picked, priceRange);
  }

  function movePrice(range: [number, number]) {
    const full = price !== null && range[0] <= price.min && range[1] >= price.max;
    movedPrice = range;
    chosenPrice = full ? null : range;
  }

  // The end event can fire before the new value renders, so it reports the last value that moved.
  function settlePrice() {
    report(picked, movedPrice ?? priceRange);
    movedPrice = null;
  }

  function clearAll() {
    picked = {};
    chosenPrice = null;
    report({}, price ? [price.min, price.max] : null);
  }
</script>

{#snippet filterPanel()}
  {#if error}
    <Alert.Root variant="error" size="sm">
      <Alert.Content>
        <Alert.Title>{error}</Alert.Title>
        <Alert.Description>The products still show. Try again in a moment.</Alert.Description>
        <Alert.Action>
          <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
            Try again
          </Button>
        </Alert.Action>
      </Alert.Content>
    </Alert.Root>
  {:else if loading}
    <div role="status" aria-busy="true" class="grid gap-6 py-4">
      <span class="sr-only">Loading filters…</span>
      {#each placeholders as key (key)}
        <div aria-hidden="true" class="grid gap-3">
          <Skeleton shape="text" class="w-1/2" />
          <Skeleton shape="text" class="w-3/4" />
          <Skeleton shape="text" class="w-2/3" />
        </div>
      {/each}
    </div>
  {:else if sections.length === 0}
    <p
      class="m-0 rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
    >
      No filters for this category.
    </p>
  {:else}
    <Accordion.Root multiple defaultValue={sections.map((section) => section.id)}>
      {#each sections as section (section.id)}
        <Accordion.Item value={section.id}>
          <h3 class="m-0">
            <Accordion.ItemTrigger>
              {section.label}
              <Accordion.ItemIndicator>
                <svg
                  class="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Accordion.ItemIndicator>
            </Accordion.ItemTrigger>
          </h3>
          <Accordion.ItemContent>
            {#if section.facet}
              <ul class="m-0 grid list-none gap-3 px-1 pt-1">
                {#each section.facet.options as option (option.value)}
                  <li>
                    <Checkbox.Root
                      class="flex"
                      checked={picked[section.id]?.includes(option.value) ?? false}
                      {disabled}
                      onCheckedChange={(details) =>
                        toggle(section.id, option.value, details.checked === true)}
                    >
                      <Checkbox.Control>
                        <Checkbox.Indicator>✓</Checkbox.Indicator>
                      </Checkbox.Control>
                      <Checkbox.Label>{option.label}</Checkbox.Label>
                      {#if option.count !== undefined}
                        <span class="ms-auto text-ui-sm text-muted-foreground tabular-nums">
                          {option.count}
                        </span>
                      {/if}
                      <Checkbox.HiddenInput />
                    </Checkbox.Root>
                  </li>
                {/each}
              </ul>
            {:else if price && priceRange}
              <Slider.Root
                class="px-1 pt-1"
                size="sm"
                min={price.min}
                max={price.max}
                step={price.step ?? 1}
                value={priceRange}
                {disabled}
                getAriaValueText={(details) => formatPrice(details.value, price.currency)}
                onValueChange={(details) => movePrice([details.value[0]!, details.value[1]!])}
                onValueChangeEnd={settlePrice}
              >
                <Slider.ValueText>
                  {formatPrice(priceRange[0], price.currency)} –
                  {formatPrice(priceRange[1], price.currency)}
                </Slider.ValueText>
                <Slider.Control>
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb index={0} aria-label="Minimum price">
                    <Slider.HiddenInput />
                  </Slider.Thumb>
                  <Slider.Thumb index={1} aria-label="Maximum price">
                    <Slider.HiddenInput />
                  </Slider.Thumb>
                </Slider.Control>
              </Slider.Root>
            {/if}
          </Accordion.ItemContent>
        </Accordion.Item>
      {/each}
    </Accordion.Root>
  {/if}
{/snippet}

{#snippet clearButton(size: "sm" | "md")}
  <Button
    type="button"
    variant="ghost"
    {size}
    disabled={disabled || activeCount === 0}
    onclick={clearAll}
  >
    Clear all
  </Button>
{/snippet}

<section class="@container moderno-block-category-filter text-foreground">
  <div class="px-4 py-12 @lg:py-16">
    <div
      class="grid gap-4 border-b border-border pb-6 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6"
    >
      <div class="grid gap-1">
        <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
        {#if description}
          <p class="text-body text-pretty text-muted-foreground">{description}</p>
        {/if}
      </div>

      <Drawer.Root placement="left" lazyMount unmountOnExit bind:open={drawerOpen}>
        <Drawer.Trigger>
          {#snippet asChild(triggerProps)}
            <Button
              {...triggerProps()}
              type="button"
              variant="outline"
              class="@sm:shrink-0 @md:hidden"
              {disabled}
            >
              {activeCount > 0 ? `Filters (${activeCount})` : "Filters"}
            </Button>
          {/snippet}
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Title>Filters</Drawer.Title>
              <Drawer.CloseTrigger aria-label="Close filters">
                <span aria-hidden="true">×</span>
              </Drawer.CloseTrigger>
              <div class="flex-1">{@render filterPanel()}</div>
              <div class="flex justify-end gap-2 border-t border-border pt-4">
                {@render clearButton("md")}
                <Drawer.CloseTrigger>
                  {#snippet asChild(closeProps)}
                    <Button {...closeProps()} type="button">Show results</Button>
                  {/snippet}
                </Drawer.CloseTrigger>
              </div>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </div>

    <div class="grid gap-8 pt-6 @md:grid-cols-[auto_minmax(0,1fr)] @lg:gap-10">
      <aside aria-label="Filters" class="hidden @md:grid @md:w-48 @md:content-start @md:gap-3 @lg:w-60">
        <div class="flex items-center justify-between gap-2">
          <p class="text-ui-md font-semibold">Filters</p>
          {@render clearButton("sm")}
        </div>
        {@render filterPanel()}
      </aside>
      <div class="min-w-0">{@render children?.()}</div>
    </div>
  </div>
</section>
