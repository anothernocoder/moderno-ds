import { Alert, Badge, Button, Skeleton } from "@moderno-ui/react";

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

const splitLayout = "@lg:grid-cols-2 @lg:items-center";
const splitMessage = "@lg:justify-items-start @lg:text-start";

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

export function NotFound({
  code = "404",
  title = "Page not found",
  description = "The page you are looking for has moved, or the link that brought you here is out of date.",
  primaryAction = "Back to home",
  secondaryAction = "Contact support",
  linksTitle = "Popular pages",
  links = sampleLinks,
  error,
  loading = false,
  disabled = false,
  onPrimaryAction,
  onSecondaryAction,
  onRetry,
}: NotFoundProps) {
  const hasActions = Boolean(primaryAction || secondaryAction);
  const hasPages = Boolean(error) || loading || links.length > 0;

  return (
    <section className="@container moderno-block-not-found text-foreground">
      <div className={`grid gap-12 px-4 py-12 @lg:gap-16 @lg:py-24 ${hasPages ? splitLayout : ""}`}>
        <div
          className={`grid justify-items-center gap-6 text-center ${hasPages ? splitMessage : ""}`}
        >
          {code ? <Badge variant="neutral">{code}</Badge> : null}

          <div className="grid max-w-md gap-3">
            <h1 className="font-serif text-heading text-balance @md:text-heading-lg">{title}</h1>
            {description ? (
              <p className="text-body text-pretty text-muted-foreground">{description}</p>
            ) : null}
          </div>

          {hasActions ? (
            <div className="grid w-full gap-3 @sm:flex @sm:w-auto @sm:justify-center">
              {primaryAction ? (
                <Button type="button" disabled={disabled} onClick={onPrimaryAction}>
                  {primaryAction}
                </Button>
              ) : null}
              {secondaryAction ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  onClick={onSecondaryAction}
                >
                  {secondaryAction}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {error ? (
          <Alert.Root
            variant="error"
            className="w-full max-w-md justify-self-center @lg:max-w-none"
          >
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>The rest of the page still works.</Alert.Description>
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
            className="grid w-full max-w-md gap-3 justify-self-center @lg:max-w-none"
          >
            <span className="sr-only">Loading pages…</span>
            <Skeleton aria-hidden="true" shape="text" className="w-1/3" />
            <div aria-hidden="true" className="grid gap-5 rounded-lg border border-border p-4">
              {placeholders.map((key) => (
                <div key={key} className="grid gap-2">
                  <Skeleton shape="text" className="w-1/3" />
                  <Skeleton shape="text" className="w-3/4" />
                </div>
              ))}
            </div>
          </div>
        ) : links.length > 0 ? (
          <nav
            aria-label={linksTitle}
            className="grid w-full max-w-md gap-3 justify-self-center @lg:max-w-none"
          >
            <h2 className="text-ui-sm font-semibold text-muted-foreground">{linksTitle}</h2>
            <ul className="grid divide-y divide-border overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
              {links.map((link) => (
                <li key={link.label} className="grid">
                  <a
                    className="grid gap-1 px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                    href={link.href}
                  >
                    <span className="text-ui-md font-medium">{link.label}</span>
                    {link.description ? (
                      <span className="text-ui-sm text-muted-foreground">{link.description}</span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </section>
  );
}
