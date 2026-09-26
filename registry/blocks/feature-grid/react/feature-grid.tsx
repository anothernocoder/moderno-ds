import { Alert, Button, Skeleton } from "@moderno-ui/react";

export type FeatureGridIcon = "zap" | "clock" | "receipt" | "chart" | "shield" | "users";

export interface FeatureGridItem {
  id: string;
  icon: FeatureGridIcon;
  title: string;
  description: string;
}

const iconPaths: Record<FeatureGridIcon, string[]> = {
  zap: [
    "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14Z",
  ],
  clock: ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z", "M12 6v6l4 2"],
  receipt: [
    "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z",
    "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8",
    "M12 17.5v-11",
  ],
  chart: ["M3 3v16a2 2 0 0 0 2 2h16", "M18 17V9", "M13 17V5", "M8 17v-3"],
  shield: [
    "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z",
    "m9 12 2 2 4-4",
  ],
  users: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
};

const sampleFeatures: FeatureGridItem[] = [
  {
    id: "invoicing",
    icon: "zap",
    title: "Invoices in a minute",
    description: "Send a branded invoice from any device and see the moment it is opened.",
  },
  {
    id: "time",
    icon: "clock",
    title: "Time that bills itself",
    description: "Track hours as you work, then turn them into invoice lines in one step.",
  },
  {
    id: "receipts",
    icon: "receipt",
    title: "Receipts, matched",
    description: "Snap a receipt and it finds the transaction it belongs to on its own.",
  },
  {
    id: "reports",
    icon: "chart",
    title: "Reports that stay current",
    description: "Profit, spending and runway, updated every time money moves.",
  },
  {
    id: "security",
    icon: "shield",
    title: "Safe by default",
    description: "Encrypted at rest and in transit, with two-step sign-in for everyone.",
  },
  {
    id: "team",
    icon: "users",
    title: "Room for your team",
    description: "Invite your accountant and give each person only the access they need.",
  },
];

const placeholders = ["first", "second", "third"];

function Glyph({ icon }: { icon: FeatureGridIcon }) {
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

export interface FeatureGridProps {
  heading?: string;
  description?: string;
  features?: FeatureGridItem[];
  action?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: () => void;
  onRetry?: () => void;
}

export function FeatureGrid({
  heading = "Everything you need to get paid",
  description = "One workspace for the money side of your business, from the first quote to the last receipt.",
  features = sampleFeatures,
  action = "See all features",
  error,
  loading = false,
  disabled = false,
  onAction,
  onRetry,
}: FeatureGridProps) {
  const showFeatures = !error && !loading && features.length > 0;

  return (
    <section className="@container moderno-block-feature-grid text-foreground">
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
          <div
            role="status"
            aria-busy="true"
            className="grid gap-8 @sm:grid-cols-2 @lg:grid-cols-3"
          >
            <span className="sr-only">Loading features…</span>
            {placeholders.map((key) => (
              <div key={key} aria-hidden="true" className="grid content-start gap-3">
                <Skeleton shape="rect" className="size-10" />
                <Skeleton shape="text" className="w-2/3" />
                <Skeleton shape="text" className="w-full" />
              </div>
            ))}
          </div>
        ) : features.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
            No features to show yet.
          </p>
        ) : (
          <ul className="grid gap-8 @sm:grid-cols-2 @lg:grid-cols-3">
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
        )}

        {showFeatures && action ? (
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
