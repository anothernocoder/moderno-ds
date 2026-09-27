import { For, Show } from "solid-js";
import { Alert, Avatar, Button, Indicator, Skeleton } from "@moderno-ui/solid";

export interface PortfolioLink {
  id: string;
  label: string;
  href: string;
}

const sampleLinks: PortfolioLink[] = [
  { id: "email", label: "Email", href: "#" },
  { id: "linkedin", label: "LinkedIn", href: "#" },
  { id: "dribbble", label: "Dribbble", href: "#" },
  { id: "cv", label: "CV", href: "#" },
];

export interface PortfolioHeaderProps {
  name?: string;
  role?: string;
  bio?: string;
  initials?: string;
  avatarUrl?: string;
  availability?: string;
  links?: PortfolioLink[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export function PortfolioHeader(props: PortfolioHeaderProps) {
  const name = () => props.name ?? "Lena Ortiz";
  const role = () => props.role ?? "Product designer in Lisbon";
  const bio = () =>
    props.bio ??
    "I design calm, useful software for small teams, from the first sketch to the shipped product. Ten years in, I still love the details.";
  const initials = () => props.initials ?? "LO";
  const availability = () => props.availability ?? "Available for new projects";
  const links = () => props.links ?? sampleLinks;
  const hasAvatar = () => Boolean(initials() || props.avatarUrl);

  return (
    <section class="@container moderno-block-portfolio-header text-foreground">
      <div class="px-4 py-12 @lg:py-20">
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
              <div
                role="status"
                aria-busy="true"
                class="mx-auto flex max-w-lg flex-col gap-6 @md:flex-row @md:gap-8"
              >
                <span class="sr-only">Loading the profile…</span>
                <Skeleton aria-hidden="true" shape="circle" class="w-12 self-start" />
                <div aria-hidden="true" class="grid flex-1 gap-6 @lg:gap-8">
                  <Skeleton shape="text" class="w-48" />
                  <div class="grid gap-3">
                    <Skeleton shape="text" class="h-8 w-2/3 @md:h-10" />
                    <Skeleton shape="text" class="w-1/2" />
                    <Skeleton shape="text" class="w-full" />
                    <Skeleton shape="text" class="w-3/4" />
                  </div>
                  <div class="flex gap-6">
                    <Skeleton shape="text" class="w-12" />
                    <Skeleton shape="text" class="w-16" />
                    <Skeleton shape="text" class="w-16" />
                  </div>
                </div>
              </div>
            }
          >
            <header class="mx-auto flex w-fit max-w-lg flex-col gap-6 @md:flex-row @md:gap-8">
              <Show when={hasAvatar()}>
                <Avatar.Root size="lg">
                  <Avatar.Fallback>{initials()}</Avatar.Fallback>
                  <Show when={props.avatarUrl}>
                    <Avatar.Image src={props.avatarUrl} alt="" />
                  </Show>
                </Avatar.Root>
              </Show>

              <div class="grid min-w-0 flex-1 gap-6 @lg:gap-8">
                <Show when={availability()}>
                  <Indicator variant="success" class="justify-self-start">
                    {availability()}
                  </Indicator>
                </Show>

                <div class="grid gap-3">
                  <h1 class="font-serif text-heading text-balance @md:text-heading-lg">{name()}</h1>
                  <Show when={role()}>
                    <p class="text-body font-medium @sm:text-body-lg">{role()}</p>
                  </Show>
                  <Show when={bio()}>
                    <p class="text-body text-pretty text-muted-foreground @sm:text-body-lg">
                      {bio()}
                    </p>
                  </Show>
                </div>

                <Show when={links().length > 0}>
                  <nav aria-label="Links">
                    <ul class="flex flex-wrap gap-x-6 gap-y-2">
                      <For each={links()}>
                        {(link) => (
                          <li>
                            <a
                              class="rounded-sm text-ui-md font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                              href={props.disabled ? undefined : link.href}
                              role={props.disabled ? "link" : undefined}
                              aria-disabled={props.disabled || undefined}
                            >
                              {link.label}
                            </a>
                          </li>
                        )}
                      </For>
                    </ul>
                  </nav>
                </Show>
              </div>
            </header>
          </Show>
        </Show>
      </div>
    </section>
  );
}
