import { Alert, Badge, Button, Card, Skeleton } from "@moderno-ui/react";

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

export function ProjectGrid({
  heading = "Selected work",
  description = "Products, brands and sites we shipped with the teams that run them.",
  allProjectsHref = "#",
  projects = sampleProjects,
  error,
  loading = false,
  disabled = false,
  onRetry,
}: ProjectGridProps) {
  return (
    <section className="@container moderno-block-project-grid text-foreground">
      <div className="grid gap-10 px-4 py-12 @lg:py-16">
        <div className="grid gap-4 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6">
          <div className="grid max-w-md gap-3">
            <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
            {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
          </div>
          {allProjectsHref ? (
            <a
              className={`justify-self-start shrink-0 text-ui-md font-medium ${linkClass}`}
              href={disabled ? undefined : allProjectsHref}
              role={disabled ? "link" : undefined}
              aria-disabled={disabled || undefined}
            >
              View all projects
            </a>
          ) : null}
        </div>

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
          <div
            role="status"
            aria-busy="true"
            className="grid gap-6 @md:grid-cols-2 @lg:grid-cols-3 @lg:gap-8"
          >
            <span className="sr-only">Loading the projects…</span>
            {placeholders.map((key) => (
              <Card.Root key={key} aria-hidden="true" className="overflow-hidden">
                <Skeleton shape="rect" className="aspect-video h-auto rounded-none" />
                <Card.Header className="gap-2">
                  <Skeleton shape="text" className="w-1/3" />
                  <Skeleton shape="text" className="w-3/4" />
                </Card.Header>
                <Card.Content className="gap-2">
                  <Skeleton shape="text" />
                  <Skeleton shape="text" className="w-2/3" />
                </Card.Content>
                <Card.Footer className="gap-2">
                  <Skeleton shape="text" className="w-1/4" />
                  <Skeleton shape="text" className="w-1/4" />
                </Card.Footer>
              </Card.Root>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
            No projects to show yet.
          </p>
        ) : (
          <ul className="grid gap-6 @md:grid-cols-2 @lg:grid-cols-3 @lg:gap-8">
            {projects.map((project) => (
              <li key={project.id} className="flex">
                <Card.Root className="overflow-hidden">
                  <div className="relative grid aspect-video place-items-center bg-muted px-6">
                    {project.image ? (
                      <img
                        src={project.image.src}
                        alt={project.image.alt}
                        className="absolute inset-0 size-full object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="font-serif text-heading-sm text-balance text-center text-muted-foreground"
                      >
                        {project.client}
                      </span>
                    )}
                  </div>
                  <Card.Header className="gap-2">
                    <p className="flex flex-wrap gap-x-2 text-ui-sm text-muted-foreground">
                      <span>{project.client}</span>
                      <span aria-hidden="true">·</span>
                      <time dateTime={project.year}>{project.year}</time>
                    </p>
                    <Card.Title className="text-body-lg text-balance">
                      {project.href ? (
                        <a
                          className={linkClass}
                          href={disabled ? undefined : project.href}
                          role={disabled ? "link" : undefined}
                          aria-disabled={disabled || undefined}
                        >
                          {project.title}
                        </a>
                      ) : (
                        project.title
                      )}
                    </Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <p className="text-pretty text-muted-foreground">{project.summary}</p>
                  </Card.Content>
                  {project.tags.length > 0 ? (
                    <Card.Footer>
                      <ul className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <li key={tag}>
                            <Badge size="sm">{tag}</Badge>
                          </li>
                        ))}
                      </ul>
                    </Card.Footer>
                  ) : null}
                </Card.Root>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
