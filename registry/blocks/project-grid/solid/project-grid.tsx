import { For, Show } from "solid-js";
import { Alert, Badge, Button, Card, Skeleton } from "@moderno-ui/solid";

export interface ProjectImage {
  src: string;
  alt: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
  client: string;
  year: string;
  summary: string;
  tags: string[];
  href?: string;
  image?: ProjectImage;
}

const sampleProjects: ProjectSummary[] = [
  {
    id: "harbor",
    title: "A checkout that takes one tap",
    client: "Harbor Coffee",
    year: "2026",
    summary:
      "We rebuilt ordering around the regulars: their usual order, one tap, and a receipt that lands in the right folder.",
    tags: ["Product design", "iOS"],
    href: "#",
  },
  {
    id: "northwind",
    title: "Month-end reports on one screen",
    client: "Northwind Freight",
    year: "2026",
    summary:
      "Twelve spreadsheets became one dashboard the finance team opens every Monday morning.",
    tags: ["Dashboard", "Data"],
    href: "#",
  },
  {
    id: "atlas",
    title: "A brand that fits on a receipt",
    client: "Atlas Bakery",
    year: "2025",
    summary:
      "A new wordmark and a type system that read as well on the shop sign as on thermal paper.",
    tags: ["Brand", "Print"],
    href: "#",
  },
  {
    id: "fjord",
    title: "Booking a room in three steps",
    client: "Fjord Hotels",
    year: "2025",
    summary: "Dates, room, pay. We cut the booking flow from nine screens to three.",
    tags: ["Web", "Booking"],
    href: "#",
  },
  {
    id: "meridian",
    title: "Onboarding a clinic in a day",
    client: "Meridian Health",
    year: "2024",
    summary:
      "A guided setup that takes a small clinic from sign-up to its first booked patient before lunch.",
    tags: ["Onboarding", "Web"],
    href: "#",
  },
  {
    id: "kiln",
    title: "A shop for a two-person studio",
    client: "Kiln Studio",
    year: "2024",
    summary: "Product pages, stock and shipping that two potters can run between firings.",
    tags: ["E-commerce"],
  },
];

const placeholders = ["first", "second", "third"];

const linkClass =
  "rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline";

export interface ProjectGridProps {
  heading?: string;
  description?: string;
  allProjectsHref?: string;
  projects?: ProjectSummary[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export function ProjectGrid(props: ProjectGridProps) {
  const heading = () => props.heading ?? "Selected work";
  const description = () =>
    props.description ?? "Products, brands and sites we shipped with the teams that run them.";
  const allProjectsHref = () => props.allProjectsHref ?? "#";
  const projects = () => props.projects ?? sampleProjects;

  return (
    <section class="@container moderno-block-project-grid text-foreground">
      <div class="grid gap-10 px-4 py-12 @lg:py-16">
        <div class="grid gap-4 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6">
          <div class="grid max-w-md gap-3">
            <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading()}</h2>
            <Show when={description()}>
              <p class="text-body text-muted-foreground">{description()}</p>
            </Show>
          </div>
          <Show when={allProjectsHref()}>
            <a
              class={`justify-self-start shrink-0 text-ui-md font-medium ${linkClass}`}
              href={props.disabled ? undefined : allProjectsHref()}
              role={props.disabled ? "link" : undefined}
              aria-disabled={props.disabled || undefined}
            >
              View all projects
            </a>
          </Show>
        </div>

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
              <div
                role="status"
                aria-busy="true"
                class="grid gap-6 @md:grid-cols-2 @lg:grid-cols-3 @lg:gap-8"
              >
                <span class="sr-only">Loading the projects…</span>
                <For each={placeholders}>
                  {() => (
                    <Card.Root aria-hidden="true" class="overflow-hidden">
                      <Skeleton shape="rect" class="aspect-video h-auto rounded-none" />
                      <Card.Header class="gap-2">
                        <Skeleton shape="text" class="w-1/3" />
                        <Skeleton shape="text" class="w-3/4" />
                      </Card.Header>
                      <Card.Content class="gap-2">
                        <Skeleton shape="text" />
                        <Skeleton shape="text" class="w-2/3" />
                      </Card.Content>
                      <Card.Footer class="gap-2">
                        <Skeleton shape="text" class="w-1/4" />
                        <Skeleton shape="text" class="w-1/4" />
                      </Card.Footer>
                    </Card.Root>
                  )}
                </For>
              </div>
            }
          >
            <Show
              when={projects().length > 0}
              fallback={
                <p class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
                  No projects to show yet.
                </p>
              }
            >
              <ul class="grid gap-6 @md:grid-cols-2 @lg:grid-cols-3 @lg:gap-8">
                <For each={projects()}>
                  {(project) => (
                    <li class="flex">
                      <Card.Root class="overflow-hidden">
                        <div class="relative grid aspect-video place-items-center bg-muted px-6">
                          <Show
                            when={project.image}
                            fallback={
                              <span
                                aria-hidden="true"
                                class="font-serif text-heading-sm text-balance text-center text-muted-foreground"
                              >
                                {project.client}
                              </span>
                            }
                          >
                            {(image) => (
                              <img
                                src={image().src}
                                alt={image().alt}
                                class="absolute inset-0 size-full object-cover"
                              />
                            )}
                          </Show>
                        </div>
                        <Card.Header class="gap-2">
                          <p class="flex flex-wrap gap-x-2 text-ui-sm text-muted-foreground">
                            <span>{project.client}</span>
                            <span aria-hidden="true">·</span>
                            <time datetime={project.year}>{project.year}</time>
                          </p>
                          <Card.Title class="text-body-lg text-balance">
                            <Show when={project.href} fallback={project.title}>
                              <a
                                class={linkClass}
                                href={props.disabled ? undefined : project.href}
                                role={props.disabled ? "link" : undefined}
                                aria-disabled={props.disabled || undefined}
                              >
                                {project.title}
                              </a>
                            </Show>
                          </Card.Title>
                        </Card.Header>
                        <Card.Content>
                          <p class="text-pretty text-muted-foreground">{project.summary}</p>
                        </Card.Content>
                        <Show when={project.tags.length > 0}>
                          <Card.Footer>
                            <ul class="flex flex-wrap gap-2">
                              <For each={project.tags}>
                                {(tag) => (
                                  <li>
                                    <Badge size="sm">{tag}</Badge>
                                  </li>
                                )}
                              </For>
                            </ul>
                          </Card.Footer>
                        </Show>
                      </Card.Root>
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
