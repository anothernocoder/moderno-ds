import { For, Show } from "solid-js";
import { Alert, Button, Chip, Skeleton } from "@moderno-ui/solid";

export interface BlogCategory {
  id: string;
  label: string;
  href: string;
}

const sampleCategories: BlogCategory[] = [
  { id: "all", label: "All posts", href: "#" },
  { id: "product", label: "Product", href: "#" },
  { id: "engineering", label: "Engineering", href: "#" },
  { id: "design", label: "Design", href: "#" },
  { id: "company", label: "Company", href: "#" },
  { id: "guides", label: "Guides", href: "#" },
];

export interface BlogHeaderProps {
  kicker?: string;
  title?: string;
  description?: string;
  categories?: BlogCategory[];
  activeCategory?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export function BlogHeader(props: BlogHeaderProps) {
  const kicker = () => props.kicker ?? "Blog";
  const title = () => props.title ?? "Notes from the ledger";
  const description = () =>
    props.description ??
    "Product updates, engineering deep dives and guides to closing the month without the stress.";
  const categories = () => props.categories ?? sampleCategories;
  const activeCategory = () => props.activeCategory ?? "all";

  return (
    <header class="@container moderno-block-blog-header text-foreground">
      <div class="grid justify-items-center gap-8 px-4 py-12 text-center @lg:gap-10 @lg:py-16">
        <div class="grid max-w-md gap-3">
          <Show when={kicker()}>
            <p class="text-ui-sm font-medium text-muted-foreground">{kicker()}</p>
          </Show>
          <h1 class="font-serif text-heading text-balance @md:text-heading-lg">{title()}</h1>
          <Show when={description()}>
            <p class="text-ui-md text-pretty text-muted-foreground @sm:text-body">
              {description()}
            </p>
          </Show>
        </div>

        <Show
          when={!props.error}
          fallback={
            <Alert.Root variant="error" class="w-full max-w-md text-start">
              <Alert.Content>
                <Alert.Title>{props.error}</Alert.Title>
                <Alert.Description>
                  The posts still load. Try again to bring the categories back.
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
                class="flex flex-wrap justify-center gap-2 @md:gap-3"
              >
                <span class="sr-only">Loading the categories…</span>
                <Skeleton aria-hidden="true" shape="rect" class="h-7 w-20" />
                <Skeleton aria-hidden="true" shape="rect" class="h-7 w-16" />
                <Skeleton aria-hidden="true" shape="rect" class="h-7 w-24" />
                <Skeleton aria-hidden="true" shape="rect" class="h-7 w-16" />
                <Skeleton aria-hidden="true" shape="rect" class="h-7 w-20" />
              </div>
            }
          >
            <Show
              when={categories().length > 0}
              fallback={
                <p class="rounded-lg border border-dashed border-border px-4 py-3 text-ui-sm text-muted-foreground">
                  No categories yet.
                </p>
              }
            >
              <nav aria-label="Categories">
                <ul class="flex flex-wrap justify-center gap-2 @md:gap-3">
                  <For each={categories()}>
                    {(category) => {
                      const active = () => category.id === activeCategory();
                      return (
                        <li class="flex">
                          <a
                            class="flex rounded-lg hover:[--border:var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed"
                            href={props.disabled ? undefined : category.href}
                            role={props.disabled ? "link" : undefined}
                            aria-disabled={props.disabled || undefined}
                            aria-current={active() ? "page" : undefined}
                          >
                            <Chip
                              variant={active() ? "solid" : props.disabled ? "muted" : "outline"}
                            >
                              {category.label}
                            </Chip>
                          </a>
                        </li>
                      );
                    }}
                  </For>
                </ul>
              </nav>
            </Show>
          </Show>
        </Show>
      </div>
    </header>
  );
}
