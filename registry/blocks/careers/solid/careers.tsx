import { For, Show } from "solid-js";
import { Alert, Badge, Button, Skeleton } from "@moderno-ui/solid";

export interface CareersRole {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  href: string;
}

const sampleRoles: CareersRole[] = [
  {
    id: "product-designer",
    title: "Senior Product Designer",
    department: "Design",
    location: "Remote, Europe",
    type: "Full-time",
    href: "#",
  },
  {
    id: "frontend-engineer",
    title: "Staff Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    href: "#",
  },
  {
    id: "payments-engineer",
    title: "Backend Engineer, Payments",
    department: "Engineering",
    location: "Stockholm",
    type: "Full-time",
    href: "#",
  },
  {
    id: "customer-success",
    title: "Customer Success Lead",
    department: "Support",
    location: "Remote, Americas",
    type: "Full-time",
    href: "#",
  },
  {
    id: "content-marketer",
    title: "Content Marketer",
    department: "Marketing",
    location: "Remote",
    type: "Part-time",
    href: "#",
  },
];

const placeholders = ["first", "second", "third"];

function ArrowGlyph() {
  return (
    <svg
      class="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export interface CareersProps {
  heading?: string;
  description?: string;
  roles?: CareersRole[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export function Careers(props: CareersProps) {
  const heading = () => props.heading ?? "Come build with us";
  const description = () =>
    props.description ??
    "We are a small team making money simple for small businesses. Every role below is open now.";
  const roles = () => props.roles ?? sampleRoles;

  return (
    <section class="@container moderno-block-careers text-foreground">
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
            <Alert.Root variant="error" class="mx-auto w-full max-w-lg">
              <Alert.Content>
                <Alert.Title>{props.error}</Alert.Title>
                <Alert.Description>
                  The roles are still open. Try again in a moment.
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
                class="mx-auto grid w-full max-w-lg divide-y divide-border border-y border-border"
              >
                <span class="sr-only">Loading open roles…</span>
                <For each={placeholders}>
                  {() => (
                    <div aria-hidden="true" class="grid gap-2 py-4">
                      <Skeleton shape="text" class="w-1/2" />
                      <Skeleton shape="text" class="w-1/3" />
                    </div>
                  )}
                </For>
              </div>
            }
          >
            <Show
              when={roles().length > 0}
              fallback={
                <p class="mx-auto w-full max-w-lg rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
                  No open roles right now. Check back soon.
                </p>
              }
            >
              <ul class="mx-auto w-full max-w-lg divide-y divide-border border-y border-border">
                <For each={roles()}>
                  {(role) => (
                    <li class="grid gap-3 py-4 @sm:grid-cols-[minmax(0,1fr)_auto] @sm:items-center @sm:gap-6">
                      <div class="grid min-w-0 gap-2">
                        <h3 class="text-body font-semibold">{role.title}</h3>
                        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <Badge variant="outline" size="sm">
                            {role.department}
                          </Badge>
                          <span class="text-ui-sm text-muted-foreground">
                            {role.location} · {role.type}
                          </span>
                        </div>
                      </div>
                      <a
                        class="inline-flex items-center gap-1 justify-self-start rounded-sm text-ui-md font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline @sm:justify-self-end"
                        href={props.disabled ? undefined : role.href}
                        role={props.disabled ? "link" : undefined}
                        aria-disabled={props.disabled || undefined}
                        aria-label={`Apply for ${role.title}`}
                      >
                        Apply
                        <ArrowGlyph />
                      </a>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </Show>
        </Show>
      </div>
    </section>
  );
}
