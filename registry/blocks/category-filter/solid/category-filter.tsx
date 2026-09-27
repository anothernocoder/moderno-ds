import { createSignal, For, Match, Show, Switch, type JSX } from "solid-js";
import {
  Accordion,
  Alert,
  Button,
  Checkbox,
  Drawer,
  Portal,
  Skeleton,
  Slider,
} from "@moderno-ui/solid";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterFacet {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface PriceFilter {
  min: number;
  max: number;
  step?: number;
  currency?: string;
}

export interface CategoryFilters {
  options: Record<string, string[]>;
  price: [number, number] | null;
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

export interface CategoryFilterProps {
  heading?: string;
  description?: string;
  facets?: FilterFacet[];
  price?: PriceFilter | null;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  children?: JSX.Element;
  onFiltersChange?: (filters: CategoryFilters) => void;
  onRetry?: () => void;
}

export function CategoryFilter(props: CategoryFilterProps) {
  const [picked, setPicked] = createSignal<Record<string, string[]>>({});
  const [chosenPrice, setChosenPrice] = createSignal<[number, number] | null>(null);
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  let movedPrice: [number, number] | null = null;

  const heading = () => props.heading ?? "New arrivals";
  const description = () =>
    props.description ?? "Stoneware, porcelain and glass, made by hand in small batches.";
  const facets = () => props.facets ?? sampleFacets;
  const price = () => (props.price === undefined ? samplePrice : props.price);
  const disabled = () => Boolean(props.disabled);

  const priceRange = (): [number, number] | null => {
    const filter = price();
    return filter ? (chosenPrice() ?? [filter.min, filter.max]) : null;
  };
  const activeCount = () =>
    Object.values(picked()).reduce((total, values) => total + values.length, 0) +
    (chosenPrice() ? 1 : 0);
  const sections = () => [
    ...facets().map((facet) => ({ id: facet.id, label: facet.label, facet })),
    ...(price() ? [{ id: "price", label: "Price", facet: undefined }] : []),
  ];

  function report(options: Record<string, string[]>, range: [number, number] | null) {
    props.onFiltersChange?.({ options, price: range });
  }

  function toggle(facetId: string, value: string, checked: boolean) {
    const current = picked()[facetId] ?? [];
    const values = checked ? [...current, value] : current.filter((item) => item !== value);
    const next = { ...picked(), [facetId]: values };
    setPicked(next);
    report(next, priceRange());
  }

  function movePrice(range: [number, number]) {
    const filter = price();
    const full = filter !== null && range[0] <= filter.min && range[1] >= filter.max;
    movedPrice = range;
    setChosenPrice(full ? null : range);
  }

  // The end event can fire before the new value renders, so it reports the last value that moved.
  function settlePrice() {
    report(picked(), movedPrice ?? priceRange());
    movedPrice = null;
  }

  function clearAll() {
    const filter = price();
    setPicked({});
    setChosenPrice(null);
    report({}, filter ? [filter.min, filter.max] : null);
  }

  const filterPanel = () => (
    <Switch>
      <Match when={props.error}>
        {(message) => (
          <Alert.Root variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{message()}</Alert.Title>
              <Alert.Description>The products still show. Try again in a moment.</Alert.Description>
              <Alert.Action>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled()}
                  onClick={() => props.onRetry?.()}
                >
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        )}
      </Match>
      <Match when={props.loading}>
        <div role="status" aria-busy="true" class="grid gap-6 py-4">
          <span class="sr-only">Loading filters…</span>
          <For each={placeholders}>
            {() => (
              <div aria-hidden="true" class="grid gap-3">
                <Skeleton shape="text" class="w-1/2" />
                <Skeleton shape="text" class="w-3/4" />
                <Skeleton shape="text" class="w-2/3" />
              </div>
            )}
          </For>
        </div>
      </Match>
      <Match when={sections().length === 0}>
        <p class="m-0 rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
          No filters for this category.
        </p>
      </Match>
      <Match when={sections().length > 0}>
        <Accordion.Root multiple defaultValue={sections().map((section) => section.id)}>
          <For each={sections()}>
            {(section) => (
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
                  <Show when={section.facet}>
                    {(facet) => (
                      <ul class="m-0 grid list-none gap-3 px-1 pt-1">
                        <For each={facet().options}>
                          {(option) => (
                            <li>
                              <Checkbox.Root
                                class="flex"
                                checked={picked()[section.id]?.includes(option.value) ?? false}
                                disabled={disabled()}
                                onCheckedChange={(details) =>
                                  toggle(section.id, option.value, details.checked === true)
                                }
                              >
                                <Checkbox.Control>
                                  <Checkbox.Indicator>✓</Checkbox.Indicator>
                                </Checkbox.Control>
                                <Checkbox.Label>{option.label}</Checkbox.Label>
                                <Show when={option.count !== undefined}>
                                  <span class="ms-auto text-ui-sm text-muted-foreground tabular-nums">
                                    {option.count}
                                  </span>
                                </Show>
                                <Checkbox.HiddenInput />
                              </Checkbox.Root>
                            </li>
                          )}
                        </For>
                      </ul>
                    )}
                  </Show>
                  <Show when={!section.facet && price()}>
                    {(filter) => (
                      <Slider.Root
                        class="px-1 pt-1"
                        size="sm"
                        min={filter().min}
                        max={filter().max}
                        step={filter().step ?? 1}
                        value={priceRange() ?? [filter().min, filter().max]}
                        disabled={disabled()}
                        getAriaValueText={(details) =>
                          formatPrice(details.value, filter().currency)
                        }
                        onValueChange={(details) =>
                          movePrice([details.value[0]!, details.value[1]!])
                        }
                        onValueChangeEnd={settlePrice}
                      >
                        <Slider.ValueText>
                          {formatPrice(priceRange()?.[0] ?? filter().min, filter().currency)} –{" "}
                          {formatPrice(priceRange()?.[1] ?? filter().max, filter().currency)}
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
                    )}
                  </Show>
                </Accordion.ItemContent>
              </Accordion.Item>
            )}
          </For>
        </Accordion.Root>
      </Match>
    </Switch>
  );

  const clearButton = (size: "sm" | "md") => (
    <Button
      type="button"
      variant="ghost"
      size={size}
      disabled={disabled() || activeCount() === 0}
      onClick={clearAll}
    >
      Clear all
    </Button>
  );

  return (
    <section class="@container moderno-block-category-filter text-foreground">
      <div class="px-4 py-12 @lg:py-16">
        <div class="grid gap-4 border-b border-border pb-6 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6">
          <div class="grid gap-1">
            <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading()}</h2>
            <Show when={description()}>
              <p class="text-body text-pretty text-muted-foreground">{description()}</p>
            </Show>
          </div>

          <Drawer.Root
            placement="left"
            lazyMount
            unmountOnExit
            open={drawerOpen()}
            onOpenChange={(details) => setDrawerOpen(details.open)}
          >
            <Drawer.Trigger
              asChild={(triggerProps) => (
                <Button
                  {...triggerProps()}
                  type="button"
                  variant="outline"
                  class="@sm:shrink-0 @md:hidden"
                  disabled={disabled()}
                >
                  {activeCount() > 0 ? `Filters (${activeCount()})` : "Filters"}
                </Button>
              )}
            />
            <Portal>
              <Drawer.Backdrop />
              <Drawer.Positioner>
                <Drawer.Content>
                  <Drawer.Title>Filters</Drawer.Title>
                  <Drawer.CloseTrigger aria-label="Close filters">
                    <span aria-hidden="true">×</span>
                  </Drawer.CloseTrigger>
                  <div class="flex-1">{filterPanel()}</div>
                  <div class="flex justify-end gap-2 border-t border-border pt-4">
                    {clearButton("md")}
                    <Drawer.CloseTrigger
                      asChild={(closeProps) => (
                        <Button {...closeProps()} type="button">
                          Show results
                        </Button>
                      )}
                    />
                  </div>
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>
        </div>

        <div class="grid gap-8 pt-6 @md:grid-cols-[auto_minmax(0,1fr)] @lg:gap-10">
          <aside
            aria-label="Filters"
            class="hidden @md:grid @md:w-48 @md:content-start @md:gap-3 @lg:w-60"
          >
            <div class="flex items-center justify-between gap-2">
              <p class="text-ui-md font-semibold">Filters</p>
              {clearButton("sm")}
            </div>
            {filterPanel()}
          </aside>
          <div class="min-w-0">{props.children}</div>
        </div>
      </div>
    </section>
  );
}
