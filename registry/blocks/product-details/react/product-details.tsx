import { useState } from "react";
import {
  Alert,
  Button,
  Carousel,
  NumberInput,
  RadioGroup,
  Skeleton,
  Spinner,
  Tabs,
} from "@moderno-ui/react";

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

export function ProductDetails({
  product = sampleProduct,
  error,
  loading = false,
  disabled = false,
  adding = false,
  onAddToCart,
  onRetry,
}: ProductDetailsProps) {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const images = product?.images ?? [];
  const options = product?.options ?? [];
  const sections = product?.sections ?? [];
  const soldOut = options.some((option) => firstAvailableValue(option) === undefined);

  function addToCart() {
    const chosen = options.map((option) => [
      option.name,
      picked[option.name] ?? firstAvailableValue(option) ?? "",
    ]);
    onAddToCart?.({ options: Object.fromEntries(chosen), quantity });
  }

  return (
    <section className="@container moderno-block-product-details text-foreground">
      <div className="px-4 py-12 @lg:py-16">
        {error ? (
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>
                The rest of the page still works. Try again in a moment.
              </Alert.Description>
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
        ) : loading ? (
          <div role="status" aria-busy="true" className="relative">
            <span className="sr-only">Loading the product…</span>
            <div aria-hidden="true" className="grid gap-8 @lg:grid-cols-2 @lg:gap-10">
              <Skeleton shape="rect" className="aspect-square h-auto rounded-lg" />
              <div className="grid content-start gap-6">
                <div className="grid gap-3">
                  <Skeleton shape="text" className="w-2/3" />
                  <Skeleton shape="text" className="w-1/4" />
                </div>
                <div className="grid gap-2">
                  <Skeleton shape="text" />
                  <Skeleton shape="text" className="w-5/6" />
                </div>
                <Skeleton shape="rect" className="h-16 w-2/3" />
                <Skeleton shape="rect" className="h-10" />
              </div>
            </div>
          </div>
        ) : !product ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
            This product is no longer available.
          </p>
        ) : (
          <div className="grid gap-8 @lg:grid-cols-2 @lg:items-start @lg:gap-10">
            {images.length > 0 ? (
              <Carousel.Root slideCount={images.length} aria-label={`Photos of ${product.name}`}>
                <Carousel.ItemGroup>
                  {images.map((image, index) => (
                    <Carousel.Item key={index} index={index}>
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="absolute inset-0 size-full object-cover"
                        />
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel.ItemGroup>
                {images.length > 1 ? (
                  <Carousel.Control>
                    <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
                    <Carousel.IndicatorGroup>
                      {images.map((_, index) => (
                        <Carousel.Indicator key={index} index={index} />
                      ))}
                    </Carousel.IndicatorGroup>
                    <Carousel.NextTrigger>›</Carousel.NextTrigger>
                  </Carousel.Control>
                ) : null}
              </Carousel.Root>
            ) : (
              <div className="aspect-square rounded-lg bg-muted" />
            )}

            <div className="grid content-start gap-6">
              <div className="grid gap-2">
                <h2 className="font-serif text-heading-sm text-balance @md:text-heading">
                  {product.name}
                </h2>
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-body-lg font-semibold tabular-nums">{product.price}</span>
                  {product.compareAtPrice ? (
                    <s className="text-ui-md text-muted-foreground tabular-nums">
                      <span className="sr-only">Was</span> {product.compareAtPrice}
                    </s>
                  ) : null}
                </p>
              </div>

              {product.description ? (
                <p className="text-body text-pretty text-muted-foreground">{product.description}</p>
              ) : null}

              {options.map((option) => (
                <RadioGroup.Root
                  key={option.name}
                  orientation="horizontal"
                  defaultValue={firstAvailableValue(option)}
                  disabled={disabled}
                  onValueChange={(details) => {
                    const value = details.value;
                    if (value) setPicked((current) => ({ ...current, [option.name]: value }));
                  }}
                >
                  <RadioGroup.Label>{option.name}</RadioGroup.Label>
                  {option.values.map((value) => (
                    <RadioGroup.Item key={value.value} value={value.value} disabled={value.soldOut}>
                      <RadioGroup.ItemControl />
                      <RadioGroup.ItemText>
                        {value.label}
                        {value.soldOut ? (
                          <RadioGroup.ItemDescription>Sold out</RadioGroup.ItemDescription>
                        ) : null}
                      </RadioGroup.ItemText>
                      <RadioGroup.ItemHiddenInput />
                    </RadioGroup.Item>
                  ))}
                </RadioGroup.Root>
              ))}

              <div className="grid gap-3 @sm:flex @sm:items-end">
                <NumberInput.Root
                  className="@sm:w-32 @sm:shrink-0"
                  defaultValue="1"
                  min={1}
                  max={product.maxQuantity ?? defaultMaxQuantity}
                  formatOptions={wholeNumberFormat}
                  disabled={disabled || soldOut}
                  onValueChange={(details) => {
                    if (isValidQuantity(details.valueAsNumber, product.maxQuantity)) {
                      setQuantity(details.valueAsNumber);
                    }
                  }}
                >
                  <NumberInput.Label>Quantity</NumberInput.Label>
                  <NumberInput.Control>
                    <NumberInput.Input className="w-full" />
                    <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
                    <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
                  </NumberInput.Control>
                </NumberInput.Root>
                <Button
                  type="button"
                  className="@sm:flex-1"
                  disabled={disabled || adding || soldOut}
                  aria-busy={adding || undefined}
                  onClick={addToCart}
                >
                  {adding ? (
                    <>
                      <Spinner size="sm" aria-hidden="true" />
                      Adding
                    </>
                  ) : soldOut ? (
                    "Sold out"
                  ) : (
                    "Add to cart"
                  )}
                </Button>
              </div>

              {sections.length > 0 ? (
                <Tabs.Root defaultValue="0">
                  <Tabs.List aria-label={`About ${product.name}`}>
                    {sections.map((section, index) => (
                      <Tabs.Trigger key={index} value={String(index)}>
                        {section.title}
                      </Tabs.Trigger>
                    ))}
                    <Tabs.Indicator />
                  </Tabs.List>
                  {sections.map((section, index) => (
                    <Tabs.Content
                      key={index}
                      value={String(index)}
                      className="text-ui-md text-pretty text-muted-foreground"
                    >
                      {section.body}
                    </Tabs.Content>
                  ))}
                </Tabs.Root>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
