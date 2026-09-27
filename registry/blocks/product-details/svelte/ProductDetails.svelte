<script lang="ts">
  import {
    Alert,
    Button,
    Carousel,
    NumberInput,
    RadioGroup,
    Skeleton,
    Spinner,
    Tabs,
  } from "@moderno-ui/svelte";

  interface ProductImage {
    src: string;
    alt: string;
  }

  interface ProductOptionValue {
    value: string;
    label: string;
    soldOut?: boolean;
  }

  interface ProductOption {
    name: string;
    values: ProductOptionValue[];
  }

  interface ProductSection {
    title: string;
    body: string;
  }

  interface Product {
    name: string;
    price: string;
    compareAtPrice?: string;
    description?: string;
    images?: ProductImage[];
    options?: ProductOption[];
    sections?: ProductSection[];
    maxQuantity?: number;
  }

  interface ProductSelection {
    options: Record<string, string>;
    quantity: number;
  }

  interface Props {
    product?: Product | null;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    adding?: boolean;
    onaddtocart?: (selection: ProductSelection) => void;
    onretry?: () => void;
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

  let {
    product = sampleProduct,
    error,
    loading = false,
    disabled = false,
    adding = false,
    onaddtocart,
    onretry,
  }: Props = $props();

  let picked = $state<Record<string, string>>({});
  let quantity = $state(1);

  const images = $derived(product?.images ?? []);
  const options = $derived(product?.options ?? []);
  const sections = $derived(product?.sections ?? []);
  const soldOut = $derived(options.some((option) => firstAvailableValue(option) === undefined));

  function addToCart() {
    const chosen = options.map((option) => [
      option.name,
      picked[option.name] ?? firstAvailableValue(option) ?? "",
    ]);
    onaddtocart?.({ options: Object.fromEntries(chosen), quantity });
  }
</script>

<section class="@container moderno-block-product-details text-foreground">
  <div class="px-4 py-12 @lg:py-16">
    {#if error}
      <Alert.Root variant="error">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>The rest of the page still works. Try again in a moment.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {:else if loading}
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
    {:else if !product}
      <p
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        This product is no longer available.
      </p>
    {:else}
      <div class="grid gap-8 @lg:grid-cols-2 @lg:items-start @lg:gap-10">
        {#if images.length > 0}
          <Carousel.Root slideCount={images.length} aria-label="Photos of {product.name}">
            <Carousel.ItemGroup>
              {#each images as image, index (index)}
                <Carousel.Item {index}>
                  <div class="relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <img
                      src={image.src}
                      alt={image.alt}
                      class="absolute inset-0 size-full object-cover"
                    />
                  </div>
                </Carousel.Item>
              {/each}
            </Carousel.ItemGroup>
            {#if images.length > 1}
              <Carousel.Control>
                <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
                <Carousel.IndicatorGroup>
                  {#each images as _, index (index)}
                    <Carousel.Indicator {index} />
                  {/each}
                </Carousel.IndicatorGroup>
                <Carousel.NextTrigger>›</Carousel.NextTrigger>
              </Carousel.Control>
            {/if}
          </Carousel.Root>
        {:else}
          <div class="aspect-square rounded-lg bg-muted"></div>
        {/if}

        <div class="grid content-start gap-6">
          <div class="grid gap-2">
            <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{product.name}</h2>
            <p class="flex flex-wrap items-baseline gap-x-2">
              <span class="text-body-lg font-semibold tabular-nums">{product.price}</span>
              {#if product.compareAtPrice}
                <s class="text-ui-md text-muted-foreground tabular-nums">
                  <span class="sr-only">Was</span>
                  {product.compareAtPrice}
                </s>
              {/if}
            </p>
          </div>

          {#if product.description}
            <p class="text-body text-pretty text-muted-foreground">{product.description}</p>
          {/if}

          {#each options as option (option.name)}
            <RadioGroup.Root
              orientation="horizontal"
              defaultValue={firstAvailableValue(option)}
              {disabled}
              onValueChange={(details) => {
                if (details.value) picked = { ...picked, [option.name]: details.value };
              }}
            >
              <RadioGroup.Label>{option.name}</RadioGroup.Label>
              {#each option.values as value (value.value)}
                <RadioGroup.Item value={value.value} disabled={value.soldOut}>
                  <RadioGroup.ItemControl />
                  <RadioGroup.ItemText>
                    {value.label}
                    {#if value.soldOut}
                      <RadioGroup.ItemDescription>Sold out</RadioGroup.ItemDescription>
                    {/if}
                  </RadioGroup.ItemText>
                  <RadioGroup.ItemHiddenInput />
                </RadioGroup.Item>
              {/each}
            </RadioGroup.Root>
          {/each}

          <div class="grid gap-3 @sm:flex @sm:items-end">
            <NumberInput.Root
              class="@sm:w-32 @sm:shrink-0"
              defaultValue="1"
              min={1}
              max={product.maxQuantity ?? defaultMaxQuantity}
              formatOptions={wholeNumberFormat}
              disabled={disabled || soldOut}
              onValueChange={(details) => {
                if (isValidQuantity(details.valueAsNumber, product?.maxQuantity)) {
                  quantity = details.valueAsNumber;
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
              disabled={disabled || adding || soldOut}
              aria-busy={adding || undefined}
              onclick={addToCart}
            >
              {#if adding}
                <Spinner size="sm" aria-hidden="true" />
                Adding
              {:else if soldOut}
                Sold out
              {:else}
                Add to cart
              {/if}
            </Button>
          </div>

          {#if sections.length > 0}
            <Tabs.Root defaultValue="0">
              <Tabs.List aria-label="About {product.name}">
                {#each sections as section, index (index)}
                  <Tabs.Trigger value={String(index)}>{section.title}</Tabs.Trigger>
                {/each}
                <Tabs.Indicator />
              </Tabs.List>
              {#each sections as section, index (index)}
                <Tabs.Content
                  value={String(index)}
                  class="text-ui-md text-pretty text-muted-foreground"
                >
                  {section.body}
                </Tabs.Content>
              {/each}
            </Tabs.Root>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</section>
