import { Alert, Button, Skeleton } from "@moderno-ui/react";

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

function Glyph({ icon }: { icon: ProductFeatureIcon }) {
  return (
    <svg
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[icon].map((d) => (
        <path key={d} d={d} />
      ))}
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

export function ProductFeatureList({
  heading = "Made to be used every day",
  description = "Each mug is thrown by hand in small batches, so no two are quite the same.",
  features = sampleFeatures,
  specs = sampleSpecs,
  action = "Download the spec sheet",
  error,
  loading = false,
  disabled = false,
  onAction,
  onRetry,
}: ProductFeatureListProps) {
  const hasDetails = features.length > 0 || specs.length > 0;
  const showDetails = !error && !loading && hasDetails;

  return (
    <section className="@container moderno-block-product-feature-list text-foreground">
      <div className="grid gap-10 px-4 py-12 @lg:py-16">
        <div className="mx-auto grid max-w-md gap-3 text-center">
          <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
          {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
        </div>

        {error ? (
          <Alert.Root variant="error" className="mx-auto w-full max-w-md">
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
          <div role="status" aria-busy="true" className="grid gap-10">
            <span className="sr-only">Loading product details…</span>
            <div aria-hidden="true" className="grid gap-8 @sm:grid-cols-2 @lg:grid-cols-4">
              {featurePlaceholders.map((key) => (
                <div key={key} className="grid content-start gap-3">
                  <Skeleton shape="rect" className="size-10" />
                  <Skeleton shape="text" className="w-2/3" />
                  <Skeleton shape="text" className="w-full" />
                </div>
              ))}
            </div>
            <div
              aria-hidden="true"
              className="grid border-t border-border @lg:grid-cols-2 @lg:gap-x-8"
            >
              {specPlaceholders.map((key) => (
                <div key={key} className="border-b border-border py-3">
                  <Skeleton shape="text" className="w-full" />
                </div>
              ))}
            </div>
          </div>
        ) : !hasDetails ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
            No details for this product yet.
          </p>
        ) : (
          <>
            {features.length > 0 ? (
              <ul className="grid gap-8 @sm:grid-cols-2 @lg:grid-cols-4">
                {features.map((feature) => (
                  <li key={feature.id} className="grid content-start gap-3">
                    <div className="grid size-10 place-items-center rounded-lg border border-border bg-muted text-foreground">
                      <Glyph icon={feature.icon} />
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-body font-semibold">{feature.title}</h3>
                      <p className="text-ui-md text-muted-foreground">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {specs.length > 0 ? (
              <div className="grid gap-4">
                <h3 className="text-body font-semibold">Specifications</h3>
                <dl className="grid border-t border-border @lg:grid-cols-2 @lg:gap-x-8">
                  {specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="grid gap-1 border-b border-border py-3 @sm:grid-cols-3 @sm:gap-4"
                    >
                      <dt className="text-ui-md font-medium">{spec.label}</dt>
                      <dd className="text-ui-md text-muted-foreground @sm:col-span-2">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </>
        )}

        {showDetails && action ? (
          <div className="flex justify-center">
            <Button type="button" variant="outline" disabled={disabled} onClick={onAction}>
              {action}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
