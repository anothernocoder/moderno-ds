import { For, Show } from "solid-js";
import { Alert, Button, Divider, Skeleton } from "@moderno-ui/solid";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  id: string;
  heading: string;
  links: FooterLink[];
}

export type FooterNetwork = "github" | "x" | "linkedin" | "youtube";

export interface FooterSocialLink {
  network: FooterNetwork;
  label: string;
  href: string;
}

const networkPaths: Record<FooterNetwork, string> = {
  github:
    "M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.08 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3",
  x: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93ZM17.61 20.64h2.04L6.49 3.24H4.3Z",
  linkedin:
    "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13M7.12 20.45H3.56V9h3.56ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0",
  youtube:
    "M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81M9.55 15.57V8.43L15.82 12Z",
};

const sampleColumns: FooterColumn[] = [
  {
    id: "product",
    heading: "Product",
    links: [
      { label: "Invoicing", href: "#" },
      { label: "Time tracking", href: "#" },
      { label: "Receipts", href: "#" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    id: "company",
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Customers", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    id: "resources",
    heading: "Resources",
    links: [
      { label: "Help centre", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
];

const sampleLegal: FooterLink[] = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Cookies", href: "#" },
];

const sampleSocial: FooterSocialLink[] = [
  { network: "github", label: "Northwind on GitHub", href: "#" },
  { network: "x", label: "Northwind on X", href: "#" },
  { network: "linkedin", label: "Northwind on LinkedIn", href: "#" },
  { network: "youtube", label: "Northwind on YouTube", href: "#" },
];

const placeholders = ["first", "second", "third"];

const linkClass =
  "rounded-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export interface FooterProps {
  brand?: string;
  tagline?: string;
  action?: string;
  columns?: FooterColumn[];
  legal?: FooterLink[];
  social?: FooterSocialLink[];
  copyright?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: () => void;
  onRetry?: () => void;
}

export function Footer(props: FooterProps) {
  const brand = () => props.brand ?? "Northwind";
  const tagline = () =>
    props.tagline ?? "Invoices, time tracking and receipts in one calm workspace.";
  const action = () => props.action ?? "Contact us";
  const columns = () => props.columns ?? sampleColumns;
  const legal = () => props.legal ?? sampleLegal;
  const social = () => props.social ?? sampleSocial;
  const copyright = () => props.copyright ?? "© 2026 Northwind Labs, Inc. All rights reserved.";

  return (
    <footer class="@container moderno-block-footer text-foreground">
      <div class="grid gap-10 px-4 py-12 @lg:py-16">
        <div class="grid gap-10 @lg:grid-cols-3">
          <div class="grid content-start justify-items-start gap-4">
            <p class="font-serif text-heading-sm">{brand()}</p>
            <Show when={tagline()}>
              <p class="max-w-sm text-ui-md text-muted-foreground">{tagline()}</p>
            </Show>
            <Show when={action()}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={props.disabled}
                onClick={props.onAction}
              >
                {action()}
              </Button>
            </Show>
          </div>

          <Show
            when={!props.error}
            fallback={
              <Alert.Root variant="error" class="self-start @lg:col-span-2">
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
                <div
                  role="status"
                  aria-busy="true"
                  class="grid grid-cols-2 gap-8 @sm:grid-cols-3 @lg:col-span-2"
                >
                  <span class="sr-only">Loading links…</span>
                  <For each={placeholders}>
                    {() => (
                      <div aria-hidden="true" class="grid content-start gap-3">
                        <Skeleton shape="text" class="w-1/2" />
                        <Skeleton shape="text" class="w-3/4" />
                        <Skeleton shape="text" class="w-2/3" />
                        <Skeleton shape="text" class="w-3/4" />
                      </div>
                    )}
                  </For>
                </div>
              }
            >
              <Show when={columns().length > 0}>
                <nav
                  aria-label="Footer"
                  class="grid grid-cols-2 gap-8 @sm:grid-cols-3 @lg:col-span-2"
                >
                  <For each={columns()}>
                    {(column) => (
                      <div class="grid content-start gap-3">
                        <h2 class="text-ui-sm font-semibold">{column.heading}</h2>
                        <ul class="grid gap-2">
                          <For each={column.links}>
                            {(link) => (
                              <li class="flex">
                                <a class={`text-ui-md ${linkClass}`} href={link.href}>
                                  {link.label}
                                </a>
                              </li>
                            )}
                          </For>
                        </ul>
                      </div>
                    )}
                  </For>
                </nav>
              </Show>
            </Show>
          </Show>
        </div>

        <Divider />

        <div class="grid gap-4 @md:flex @md:items-center @md:justify-between">
          <div class="grid gap-2 @sm:flex @sm:flex-wrap @sm:items-center @sm:gap-x-6">
            <p class="text-ui-sm text-muted-foreground">{copyright()}</p>
            <Show when={legal().length > 0}>
              <nav aria-label="Legal">
                <ul class="flex flex-wrap gap-x-4 gap-y-2">
                  <For each={legal()}>
                    {(link) => (
                      <li class="flex">
                        <a class={`text-ui-sm ${linkClass}`} href={link.href}>
                          {link.label}
                        </a>
                      </li>
                    )}
                  </For>
                </ul>
              </nav>
            </Show>
          </div>

          <Show when={social().length > 0}>
            <ul aria-label="Social" class="-ml-2.5 flex gap-1 @md:-mr-2.5 @md:ml-0">
              <For each={social()}>
                {(link) => (
                  <li class="flex">
                    <a
                      class="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      href={link.href}
                      aria-label={link.label}
                    >
                      <svg
                        class="size-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={networkPaths[link.network]} />
                      </svg>
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </div>
      </div>
    </footer>
  );
}
