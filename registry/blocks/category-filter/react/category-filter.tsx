import { useRef, useState, type ReactNode } from "react";
import {
  Accordion,
  Alert,
  Button,
  Checkbox,
  Drawer,
  Portal,
  Skeleton,
  Slider,
} from "@moderno-ui/react";

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
  children?: ReactNode;
  onFiltersChange?: (filters: CategoryFilters) => void;
  onRetry?: () => void;
}

export function CategoryFilter({
  heading = "New arrivals",
  description = "Stoneware, porcelain and glass, made by hand in small batches.",
  facets = sampleFacets,
  price = samplePrice,
  error,
  loading = false,
  disabled = false,
  children,
  onFiltersChange,
  onRetry,
}: CategoryFilterProps) {
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const [chosenPrice, setChosenPrice] = useState<[number, number] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const movedPrice = useRef<[number, number] | null>(null);

  const priceRange: [number, number] | null = price
    ? (chosenPrice ?? [price.min, price.max])
    : null;
  const activeCount =
    Object.values(picked).reduce((total, values) => total + values.length, 0) +
    (chosenPrice ? 1 : 0);
  const sections = [
    ...facets.map((facet) => ({ id: facet.id, label: facet.label, facet })),
    ...(price ? [{ id: "price", label: "Price", facet: undefined }] : []),
  ];

  function report(options: Record<string, string[]>, range: [number, number] | null) {
    onFiltersChange?.({ options, price: range });
  }

  function toggle(facetId: string, value: string, checked: boolean) {
    const current = picked[facetId] ?? [];
    const values = checked ? [...current, value] : current.filter((item) => item !== value);
    const next = { ...picked, [facetId]: values };
    setPicked(next);
    report(next, priceRange);
  }

  function movePrice(range: [number, number]) {
    const full = price !== null && range[0] <= price.min && range[1] >= price.max;
    movedPrice.current = range;
    setChosenPrice(full ? null : range);
  }

  // The end event can fire before the new value renders, so it reports the last value that moved.
  function settlePrice() {
    report(picked, movedPrice.current ?? priceRange);
    movedPrice.current = null;
  }

  function clearAll() {
    setPicked({});
    setChosenPrice(null);
    report({}, price ? [price.min, price.max] : null);
  }

  function filterPanel() {
    if (error) {
      return (
        <Alert.Root variant="error" size="sm">
          <Alert.Content>
            <Alert.Title>{error}</Alert.Title>
            <Alert.Description>The products still show. Try again in a moment.</Alert.Description>
            <Alert.Action>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={onRetry}
              >
                Try again
              </Button>
            </Alert.Action>
          </Alert.Content>
        </Alert.Root>
      );
    }

    if (loading) {
      return (
        <div role="status" aria-busy="true" className="grid gap-6 py-4">
          <span className="sr-only">Loading filters…</span>
          {placeholders.map((key) => (
            <div key={key} aria-hidden="true" className="grid gap-3">
              <Skeleton shape="text" className="w-1/2" />
              <Skeleton shape="text" className="w-3/4" />
              <Skeleton shape="text" className="w-2/3" />
            </div>
          ))}
        </div>
      );
    }

    if (sections.length === 0) {
      return (
        <p className="m-0 rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
          No filters for this category.
        </p>
      );
    }

    return (
      <Accordion.Root multiple defaultValue={sections.map((section) => section.id)}>
        {sections.map((section) => (
          <Accordion.Item key={section.id} value={section.id}>
            <h3 className="m-0">
              <Accordion.ItemTrigger>
                {section.label}
                <Accordion.ItemIndicator>
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Accordion.ItemIndicator>
              </Accordion.ItemTrigger>
            </h3>
            <Accordion.ItemContent>
              {section.facet ? (
                <ul className="m-0 grid list-none gap-3 px-1 pt-1">
                  {section.facet.options.map((option) => (
                    <li key={option.value}>
                      <Checkbox.Root
                        className="flex"
                        checked={picked[section.id]?.includes(option.value) ?? false}
                        disabled={disabled}
                        onCheckedChange={(details) =>
                          toggle(section.id, option.value, details.checked === true)
                        }
                      >
                        <Checkbox.Control>
                          <Checkbox.Indicator>✓</Checkbox.Indicator>
                        </Checkbox.Control>
                        <Checkbox.Label>{option.label}</Checkbox.Label>
                        {option.count !== undefined ? (
                          <span className="ms-auto text-ui-sm text-muted-foreground tabular-nums">
                            {option.count}
                          </span>
                        ) : null}
                        <Checkbox.HiddenInput />
                      </Checkbox.Root>
                    </li>
                  ))}
                </ul>
              ) : price && priceRange ? (
                <Slider.Root
                  className="px-1 pt-1"
                  size="sm"
                  min={price.min}
                  max={price.max}
                  step={price.step ?? 1}
                  value={priceRange}
                  disabled={disabled}
                  getAriaValueText={(details) => formatPrice(details.value, price.currency)}
                  onValueChange={(details) => movePrice([details.value[0]!, details.value[1]!])}
                  onValueChangeEnd={settlePrice}
                >
                  <Slider.ValueText>
                    {formatPrice(priceRange[0], price.currency)} –{" "}
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
              ) : null}
            </Accordion.ItemContent>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    );
  }

  function clearButton(size: "sm" | "md") {
    return (
      <Button
        type="button"
        variant="ghost"
        size={size}
        disabled={disabled || activeCount === 0}
        onClick={clearAll}
      >
        Clear all
      </Button>
    );
  }

  return (
    <section className="@container moderno-block-category-filter text-foreground">
      <div className="px-4 py-12 @lg:py-16">
        <div className="grid gap-4 border-b border-border pb-6 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6">
          <div className="grid gap-1">
            <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
            {description ? (
              <p className="text-body text-pretty text-muted-foreground">{description}</p>
            ) : null}
          </div>

          <Drawer.Root
            placement="left"
            lazyMount
            unmountOnExit
            open={drawerOpen}
            onOpenChange={(details) => setDrawerOpen(details.open)}
          >
            <Drawer.Trigger asChild>
              <Button
                type="button"
                variant="outline"
                className="@sm:shrink-0 @md:hidden"
                disabled={disabled}
              >
                {activeCount > 0 ? `Filters (${activeCount})` : "Filters"}
              </Button>
            </Drawer.Trigger>
            <Portal>
              <Drawer.Backdrop />
              <Drawer.Positioner>
                <Drawer.Content>
                  <Drawer.Title>Filters</Drawer.Title>
                  <Drawer.CloseTrigger aria-label="Close filters">
                    <span aria-hidden="true">×</span>
                  </Drawer.CloseTrigger>
                  <div className="flex-1">{filterPanel()}</div>
                  <div className="flex justify-end gap-2 border-t border-border pt-4">
                    {clearButton("md")}
                    <Drawer.CloseTrigger asChild>
                      <Button type="button">Show results</Button>
                    </Drawer.CloseTrigger>
                  </div>
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>
        </div>

        <div className="grid gap-8 pt-6 @md:grid-cols-[auto_minmax(0,1fr)] @lg:gap-10">
          <aside
            aria-label="Filters"
            className="hidden @md:grid @md:w-48 @md:content-start @md:gap-3 @lg:w-60"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-ui-md font-semibold">Filters</p>
              {clearButton("sm")}
            </div>
            {filterPanel()}
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}
