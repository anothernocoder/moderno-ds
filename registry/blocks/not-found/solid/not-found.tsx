import { For, Show } from "solid-js";
import { Alert, Badge, Button, Skeleton } from "@moderno-ui/solid";

export interface NotFoundLink {
  label: string;
  description?: string;
  href: string;
}

const sampleLinks: NotFoundLink[] = [
  { label: "Pricing", description: "Plans for teams of every size.", href: "#" },
  { label: "Help centre", description: "Guides and answers to common questions.", href: "#" },
  { label: "Changelog", description: "What changed in the product this month.", href: "#" },
];

const placeholders = ["first", "second", "third"];

export interface NotFoundProps {
  code?: string;
  title?: string;
  description?: string;
  primaryAction?: string;
  secondaryAction?: string;
  linksTitle?: string;
  links?: NotFoundLink[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onRetry?: () => void;
}

export function NotFound(props: NotFoundProps) {
  const code = () => props.code ?? "404";
  const title = () => props.title ?? "Page not found";
  const description = () =>
    props.description ??
    "The page you are looking for has moved, or the link that brought you here is out of date.";
  const primaryAction = () => props.primaryAction ?? "Back to home";
  const secondaryAction = () => props.secondaryAction ?? "Contact support";
  const linksTitle = () => props.linksTitle ?? "Popular pages";
  const links = () => props.links ?? sampleLinks;
  const hasActions = () => Boolean(primaryAction() || secondaryAction());
  const hasPages = () => Boolean(props.error) || Boolean(props.loading) || links().length > 0;

  return (
    <section class="@container moderno-block-not-found text-foreground">
      <div
        class="grid gap-12 px-4 py-12 @lg:gap-16 @lg:py-24"
        classList={{ "@lg:grid-cols-2 @lg:items-center": hasPages() }}
      >
        <div
          class="grid justify-items-center gap-6 text-center"
          classList={{ "@lg:justify-items-start @lg:text-start": hasPages() }}
        >
          <Show when={code()}>
            <Badge variant="neutral">{code()}</Badge>
          </Show>

          <div class="grid max-w-md gap-3">
            <h1 class="font-serif text-heading text-balance @md:text-heading-lg">{title()}</h1>
            <Show when={description()}>
              <p class="text-body text-pretty text-muted-foreground">{description()}</p>
            </Show>
          </div>

          <Show when={hasActions()}>
            <div class="grid w-full gap-3 @sm:flex @sm:w-auto @sm:justify-center">
              <Show when={primaryAction()}>
                <Button type="button" disabled={props.disabled} onClick={props.onPrimaryAction}>
                  {primaryAction()}
                </Button>
              </Show>
              <Show when={secondaryAction()}>
                <Button
                  type="button"
                  variant="outline"
                  disabled={props.disabled}
                  onClick={props.onSecondaryAction}
                >
                  {secondaryAction()}
                </Button>
              </Show>
            </div>
          </Show>
        </div>

        <Show
          when={!props.error}
          fallback={
            <Alert.Root variant="error" class="w-full max-w-md justify-self-center @lg:max-w-none">
              <Alert.Content>
                <Alert.Title>{props.error}</Alert.Title>
                <Alert.Description>The rest of the page still works.</Alert.Description>
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
                class="grid w-full max-w-md gap-3 justify-self-center @lg:max-w-none"
              >
                <span class="sr-only">Loading pages…</span>
                <Skeleton aria-hidden="true" shape="text" class="w-1/3" />
                <div aria-hidden="true" class="grid gap-5 rounded-lg border border-border p-4">
                  <For each={placeholders}>
                    {() => (
                      <div class="grid gap-2">
                        <Skeleton shape="text" class="w-1/3" />
                        <Skeleton shape="text" class="w-3/4" />
                      </div>
                    )}
                  </For>
                </div>
              </div>
            }
          >
            <Show when={links().length > 0}>
              <nav
                aria-label={linksTitle()}
                class="grid w-full max-w-md gap-3 justify-self-center @lg:max-w-none"
              >
                <h2 class="text-ui-sm font-semibold text-muted-foreground">{linksTitle()}</h2>
                <ul class="grid divide-y divide-border overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
                  <For each={links()}>
                    {(link) => (
                      <li class="grid">
                        <a
                          class="grid gap-1 px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                          href={link.href}
                        >
                          <span class="text-ui-md font-medium">{link.label}</span>
                          <Show when={link.description}>
                            <span class="text-ui-sm text-muted-foreground">{link.description}</span>
                          </Show>
                        </a>
                      </li>
                    )}
                  </For>
                </ul>
              </nav>
            </Show>
          </Show>
        </Show>
      </div>
    </section>
  );
}
