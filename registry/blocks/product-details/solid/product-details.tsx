import { For, Index, Show, createSignal } from "solid-js";
import {
  Alert,
  Button,
  Carousel,
  NumberInput,
  RadioGroup,
  Skeleton,
  Spinner,
  Tabs,
} from "@moderno-ui/solid";

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductOptionValue {
  value: string;
  label: string;
  soldOut?: boolean;
}

export interface ProductOption {
  name: string;
  values: ProductOptionValue[];
}

export interface ProductSection {
  title: string;
  body: string;
}

export interface Product {
  name: string;
  price: string;
  compareAtPrice?: string;
  description?: string;
  images?: ProductImage[];
  options?: ProductOption[];
  sections?: ProductSection[];
  maxQuantity?: number;
}

export interface ProductSelection {
  options: Record<string, string>;
  quantity: number;
}

const sampleProduct: Product = {
  name: "Stoneware mug",
  price: "€28",
  description:
    "Thrown and glazed by hand in small batches, so no two are quite the same. A wide handle and a heavy base keep it steady on the desk.",
  options: [
    {
      name: "Colour",
      values: [
        { value: "sage", label: "Sage" },
        { value: "oat", label: "Oat" },
        { value: "charcoal", label: "Charcoal", soldOut: true },
      ],
    },
    {
      name: "Size",
      values: [
        { value: "250", label: "250 ml" },
        { value: "350", label: "350 ml" },
        { value: "450", label: "450 ml" },
      ],
    },
  ],
  sections: [
    {
      title: "Details",
      body: "Stoneware, glazed inside and out. The foot is left bare, so you feel the clay.",
    },
    {
      title: "Care",
      body: "Safe in the dishwasher and the microwave. Avoid sudden changes of temperature.",
    },
    {
      title: "Shipping",
      body: "Ships in 2–3 working days. Free returns within 30 days.",
    },
  ],
};

const defaultMaxQuantity = 99;

const wholeNumberFormat: Intl.NumberFormatOptions = {
  maximumFractionDigits: 0,
  useGrouping: false,
};

function isValidQuantity(quantity: number, maxQuantity = defaultMaxQuantity) {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= maxQuantity;
}

function firstAvailableValue(option: ProductOption) {
  return option.values.find((value) => !value.soldOut)?.value;
}

export interface ProductDetailsProps {
  product?: Product | null;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  adding?: boolean;
  onAddToCart?: (selection: ProductSelection) => void;
  onRetry?: () => void;
}

export function ProductDetails(props: ProductDetailsProps) {
  const [picked, setPicked] = createSignal<Record<string, string>>({});
  const [quantity, setQuantity] = createSignal(1);

  const product = () => (props.product === undefined ? sampleProduct : props.product);
  const images = () => product()?.images ?? [];
  const options = () => product()?.options ?? [];
  const sections = () => product()?.sections ?? [];
  const soldOut = () => options().some((option) => firstAvailableValue(option) === undefined);

  function addToCart() {
    const chosen = options().map((option) => [
      option.name,
      picked()[option.name] ?? firstAvailableValue(option) ?? "",
    ]);
    props.onAddToCart?.({ options: Object.fromEntries(chosen), quantity: quantity() });
  }

  return (
    <section class="@container moderno-block-product-details text-foreground">
      <div class="px-4 py-12 @lg:py-16">
        <Show
          when={!props.error}
          fallback={
            <Alert.Root variant="error">
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
              <div role="status" aria-busy="true" class="relative">
                <span class="sr-only">Loading the product…</span>
                <div aria-hidden="true" class="grid gap-8 @lg:grid-cols-2 @lg:gap-10">
                  <Skeleton shape="rect" class="aspect-square h-auto rounded-lg" />
                  <div class="grid content-start gap-6">
                    <div class="grid gap-3">
                      <Skeleton shape="text" class="w-2/3" />
                      <Skeleton shape="text" class="w-1/4" />
                    </div>
                    <div class="grid gap-2">
                      <Skeleton shape="text" />
                      <Skeleton shape="text" class="w-5/6" />
                    </div>
                    <Skeleton shape="rect" class="h-16 w-2/3" />
                    <Skeleton shape="rect" class="h-10" />
                  </div>
                </div>
              </div>
            }
          >
            <Show
              when={product()}
              fallback={
                <p class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
                  This product is no longer available.
                </p>
              }
            >
              {(shown) => (
                <div class="grid gap-8 @lg:grid-cols-2 @lg:items-start @lg:gap-10">
                  <Show
                    when={images().length > 0}
                    fallback={<div class="aspect-square rounded-lg bg-muted" />}
                  >
                    <Carousel.Root
                      slideCount={images().length}
                      aria-label={`Photos of ${shown().name}`}
                    >
                      <Carousel.ItemGroup>
                        <Index each={images()}>
                          {(image, index) => (
                            <Carousel.Item index={index}>
                              <div class="relative aspect-square overflow-hidden rounded-lg bg-muted">
                                <img
                                  src={image().src}
                                  alt={image().alt}
                                  class="absolute inset-0 size-full object-cover"
                                />
                              </div>
                            </Carousel.Item>
                          )}
                        </Index>
                      </Carousel.ItemGroup>
                      <Show when={images().length > 1}>
                        <Carousel.Control>
                          <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
                          <Carousel.IndicatorGroup>
                            <Index each={images()}>
                              {(_, index) => <Carousel.Indicator index={index} />}
                            </Index>
                          </Carousel.IndicatorGroup>
                          <Carousel.NextTrigger>›</Carousel.NextTrigger>
                        </Carousel.Control>
                      </Show>
                    </Carousel.Root>
                  </Show>

                  <div class="grid content-start gap-6">
                    <div class="grid gap-2">
                      <h2 class="font-serif text-heading-sm text-balance @md:text-heading">
                        {shown().name}
                      </h2>
                      <p class="flex flex-wrap items-baseline gap-x-2">
                        <span class="text-body-lg font-semibold tabular-nums">{shown().price}</span>
                        <Show when={shown().compareAtPrice}>
                          <s class="text-ui-md text-muted-foreground tabular-nums">
                            <span class="sr-only">Was</span> {shown().compareAtPrice}
                          </s>
                        </Show>
                      </p>
                    </div>

                    <Show when={shown().description}>
                      <p class="text-body text-pretty text-muted-foreground">
                        {shown().description}
                      </p>
                    </Show>

                    <For each={options()}>
                      {(option) => (
                        <RadioGroup.Root
                          orientation="horizontal"
                          defaultValue={firstAvailableValue(option)}
                          disabled={props.disabled}
                          onValueChange={(details) => {
                            const value = details.value;
                            if (value)
                              setPicked((current) => ({ ...current, [option.name]: value }));
                          }}
                        >
                          <RadioGroup.Label>{option.name}</RadioGroup.Label>
                          <For each={option.values}>
                            {(value) => (
                              <RadioGroup.Item value={value.value} disabled={value.soldOut}>
                                <RadioGroup.ItemControl />
                                <RadioGroup.ItemText>
                                  {value.label}
                                  <Show when={value.soldOut}>
                                    <RadioGroup.ItemDescription>
                                      Sold out
                                    </RadioGroup.ItemDescription>
                                  </Show>
                                </RadioGroup.ItemText>
                                <RadioGroup.ItemHiddenInput />
                              </RadioGroup.Item>
                            )}
                          </For>
                        </RadioGroup.Root>
                      )}
                    </For>

                    <div class="grid gap-3 @sm:flex @sm:items-end">
                      <NumberInput.Root
                        class="@sm:w-32 @sm:shrink-0"
                        defaultValue="1"
                        min={1}
                        max={shown().maxQuantity ?? defaultMaxQuantity}
                        formatOptions={wholeNumberFormat}
                        disabled={props.disabled || soldOut()}
                        onValueChange={(details) => {
                          if (isValidQuantity(details.valueAsNumber, shown().maxQuantity)) {
                            setQuantity(details.valueAsNumber);
                          }
                        }}
                      >
                        <NumberInput.Label>Quantity</NumberInput.Label>
                        <NumberInput.Control>
                          <NumberInput.Input />
                          <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
                          <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
                        </NumberInput.Control>
                      </NumberInput.Root>
                      <Button
                        type="button"
                        class="@sm:flex-1"
                        disabled={props.disabled || props.adding || soldOut()}
                        aria-busy={props.adding || undefined}
                        onClick={addToCart}
                      >
                        <Show when={props.adding} fallback={soldOut() ? "Sold out" : "Add to cart"}>
                          <Spinner size="sm" aria-hidden="true" />
                          Adding
                        </Show>
                      </Button>
                    </div>

                    <Show when={sections().length > 0}>
                      <Tabs.Root defaultValue="0">
                        <Tabs.List aria-label={`About ${shown().name}`}>
                          <Index each={sections()}>
                            {(section, index) => (
                              <Tabs.Trigger value={String(index)}>{section().title}</Tabs.Trigger>
                            )}
                          </Index>
                          <Tabs.Indicator />
                        </Tabs.List>
                        <Index each={sections()}>
                          {(section, index) => (
                            <Tabs.Content
                              value={String(index)}
                              class="text-ui-md text-pretty text-muted-foreground"
                            >
                              {section().body}
                            </Tabs.Content>
                          )}
                        </Index>
                      </Tabs.Root>
                    </Show>
                  </div>
                </div>
              )}
            </Show>
          </Show>
        </Show>
      </div>
    </section>
  );
}
