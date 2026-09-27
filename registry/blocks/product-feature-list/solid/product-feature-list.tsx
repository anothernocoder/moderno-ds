import { For, Show } from "solid-js";
import { Alert, Button, Skeleton } from "@moderno-ui/solid";

export type ProductFeatureIcon = "leaf" | "flame" | "droplet" | "shield" | "truck" | "package";

export interface ProductFeature {
  id: string;
  icon: ProductFeatureIcon;
  title: string;
  description: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

const iconPaths: Record<ProductFeatureIcon, string[]> = {
  leaf: [
    "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",
    "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
  ],
  flame: [
    "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z",
  ],
  droplet: [
    "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z",
  ],
  shield: [
    "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z",
    "m9 12 2 2 4-4",
  ],
  truck: [
    "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",
    "M15 18H9",
    "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14",
    "M19 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
    "M9 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  ],
  package: [
    "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73Z",
    "M12 22V12",
    "m3.3 7 7.7 4.73a2 2 0 0 0 2 0L20.7 7",
    "m7.5 4.27 9 5.15",
  ],
};

const sampleFeatures: ProductFeature[] = [
  {
    id: "clay",
    icon: "leaf",
    title: "Local clay",
    description: "Thrown by hand from stoneware clay dug less than a day from the studio.",
  },
  {
    id: "firing",
    icon: "flame",
    title: "Fired twice",
    description: "A second, hotter firing turns the glaze hard enough for daily use.",
  },
  {
    id: "care",
    icon: "droplet",
    title: "Dishwasher safe",
    description: "The glaze seals the clay, so it goes in the dishwasher and the microwave.",
  },
  {
    id: "guarantee",
    icon: "shield",
    title: "Two-year guarantee",
    description: "If it chips or cracks in normal use, we send you a new one.",
  },
];

const sampleSpecs: ProductSpec[] = [
  { label: "Material", value: "Glazed stoneware" },
  { label: "Capacity", value: "350 ml" },
  { label: "Size", value: "9 cm tall, 8.5 cm across" },
  { label: "Weight", value: "380 g" },
  { label: "Care", value: "Dishwasher and microwave safe" },
  { label: "Origin", value: "Made in Porto, Portugal" },
];

const featurePlaceholders = ["first", "second", "third", "fourth"];
const specPlaceholders = ["first", "second", "third", "fourth"];

function Glyph(props: { icon: ProductFeatureIcon }) {
  return (
    <svg
      class="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <For each={iconPaths[props.icon]}>{(d) => <path d={d} />}</For>
    </svg>
  );
}

export interface ProductFeatureListProps {
  heading?: string;
  description?: string;
  features?: ProductFeature[];
  specs?: ProductSpec[];
  action?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: () => void;
  onRetry?: () => void;
}

export function ProductFeatureList(props: ProductFeatureListProps) {
  const heading = () => props.heading ?? "Made to be used every day";
  const description = () =>
    props.description ??
    "Each mug is thrown by hand in small batches, so no two are quite the same.";
  const features = () => props.features ?? sampleFeatures;
  const specs = () => props.specs ?? sampleSpecs;
  const action = () => props.action ?? "Download the spec sheet";
  const hasDetails = () => features().length > 0 || specs().length > 0;
  const showDetails = () => !props.error && !props.loading && hasDetails();

  return (
    <section class="@container moderno-block-product-feature-list text-foreground">
      <div class="grid gap-10 px-4 py-12 @lg:py-16">
        <div class="mx-auto grid max-w-md gap-3 text-center">
          <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading()}</h2>
          <Show when={description()}>
            <p class="text-body text-muted-foreground">{description()}</p>
          </Show>
        </div>

        <Show
          when={!props.error}
          fallback={
            <Alert.Root variant="error" class="mx-auto w-full max-w-md">
              <Alert.Content>
                <Alert.Title>{props.error}</Alert.Title>
                <Alert.Description>
                  The rest of the page still works. Try again in a moment.
                </Alert.Description>
                <Alert.Action>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={props.disabled}
                    onClick={props.onRetry}
                  >
                    Try again
                  </Button>
                </Alert.Action>
              </Alert.Content>
            </Alert.Root>
          }
        >
          <Show
            when={!props.loading}
            fallback={
              <div role="status" aria-busy="true" class="grid gap-10">
                <span class="sr-only">Loading product details…</span>
                <div aria-hidden="true" class="grid gap-8 @sm:grid-cols-2 @lg:grid-cols-4">
                  <For each={featurePlaceholders}>
                    {() => (
                      <div class="grid content-start gap-3">
                        <Skeleton shape="rect" class="size-10" />
                        <Skeleton shape="text" class="w-2/3" />
                        <Skeleton shape="text" class="w-full" />
                      </div>
                    )}
                  </For>
                </div>
                <div
                  aria-hidden="true"
                  class="grid border-t border-border @lg:grid-cols-2 @lg:gap-x-8"
                >
                  <For each={specPlaceholders}>
                    {() => (
                      <div class="border-b border-border py-3">
                        <Skeleton shape="text" class="w-full" />
                      </div>
                    )}
                  </For>
                </div>
              </div>
            }
          >
            <Show
              when={hasDetails()}
              fallback={
                <p class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
                  No details for this product yet.
                </p>
              }
            >
              <Show when={features().length > 0}>
                <ul class="grid gap-8 @sm:grid-cols-2 @lg:grid-cols-4">
                  <For each={features()}>
                    {(feature) => (
                      <li class="grid content-start gap-3">
                        <div class="grid size-10 place-items-center rounded-lg border border-border bg-muted text-foreground">
                          <Glyph icon={feature.icon} />
                        </div>
                        <div class="grid gap-1">
                          <h3 class="text-body font-semibold">{feature.title}</h3>
                          <p class="text-ui-md text-muted-foreground">{feature.description}</p>
                        </div>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>

              <Show when={specs().length > 0}>
                <div class="grid gap-4">
                  <h3 class="text-body font-semibold">Specifications</h3>
                  <dl class="grid border-t border-border @lg:grid-cols-2 @lg:gap-x-8">
                    <For each={specs()}>
                      {(spec) => (
                        <div class="grid gap-1 border-b border-border py-3 @sm:grid-cols-3 @sm:gap-4">
                          <dt class="text-ui-md font-medium">{spec.label}</dt>
                          <dd class="text-ui-md text-muted-foreground @sm:col-span-2">
                            {spec.value}
                          </dd>
                        </div>
                      )}
                    </For>
                  </dl>
                </div>
              </Show>
            </Show>
          </Show>
        </Show>

        <Show when={showDetails() && action()}>
          <div class="flex justify-center">
            <Button
              type="button"
              variant="outline"
              disabled={props.disabled}
              onClick={props.onAction}
            >
              {action()}
            </Button>
          </div>
        </Show>
      </div>
    </section>
  );
}
