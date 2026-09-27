import type { ReactNode } from "react";
import { Alert, Badge, Button, Card, Skeleton } from "@moderno-ui/react";

export type SectionHeaderVariant = "page" | "section" | "card";

export type SectionHeaderTone = "neutral" | "info" | "success" | "warning" | "error";

export interface SectionHeaderCrumb {
  label: string;
  href?: string;
}

export interface SectionHeaderStatus {
  label: string;
  tone?: SectionHeaderTone;
}

const sampleCrumbs: SectionHeaderCrumb[] = [
  { label: "Projects", href: "#" },
  { label: "Marketing", href: "#" },
  { label: "Q3 redesign" },
];

const sampleStatus: SectionHeaderStatus = { label: "Active", tone: "success" };

const sampleMeta = ["Due Oct 14", "Owned by Ada Lovelace"];

const headingTags = { page: "h1", section: "h2", card: "h3" } as const;

export interface SectionHeaderProps {
  variant?: SectionHeaderVariant;
  heading?: string;
  description?: string;
  breadcrumbs?: SectionHeaderCrumb[];
  status?: SectionHeaderStatus | null;
  meta?: string[];
  count?: number;
  primaryLabel?: string;
  secondaryLabel?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onRetry?: () => void;
  children?: ReactNode;
}

export function SectionHeader({
  variant = "page",
  heading = "Q3 redesign",
  description = "Refresh the marketing site and the onboarding flow before the October launch.",
  breadcrumbs = sampleCrumbs,
  status = sampleStatus,
  meta = sampleMeta,
  count,
  primaryLabel = "New task",
  secondaryLabel = "Share",
  error,
  loading = false,
  disabled = false,
  onPrimaryAction,
  onSecondaryAction,
  onRetry,
  children,
}: SectionHeaderProps) {
  const Heading = headingTags[variant];
  const isPage = variant === "page";
  const inert = disabled || loading || Boolean(error);
  const showDetails = !loading && !error;
  const showCount = showDetails && count !== undefined;
  const showStatusLine = isPage && showDetails && (status !== null || meta.length > 0);

  const bar = (
    <div className="grid gap-3">
      {isPage && breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-ui-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => {
              const current = index === breadcrumbs.length - 1;
              const parent = index === breadcrumbs.length - 2;
              return (
                <li
                  key={index}
                  className={
                    parent ? "flex items-center gap-2" : "hidden items-center gap-2 @sm:flex"
                  }
                >
                  {parent ? (
                    <span aria-hidden="true" className="@sm:hidden">
                      ←
                    </span>
                  ) : null}
                  {index > 0 ? (
                    <span aria-hidden="true" className="hidden @sm:inline">
                      /
                    </span>
                  ) : null}
                  {crumb.href && !current ? (
                    <a
                      className="rounded-sm transition-colors hover:text-foreground hover:underline underline-offset-4 focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      href={crumb.href}
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span
                      aria-current={current ? "page" : undefined}
                      className="font-medium text-foreground"
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      <div className="grid gap-4 @sm:flex @sm:items-start @sm:justify-between @sm:gap-6">
        {loading ? (
          <div role="status" aria-busy="true" className="grid min-w-0 flex-1 gap-2">
            <span className="sr-only">Loading…</span>
            <Skeleton shape="text" className="h-7 w-1/2 @md:h-8" />
            <Skeleton shape="text" className="w-3/4" />
            {isPage ? <Skeleton shape="text" className="w-1/3" /> : null}
          </div>
        ) : (
          <div className="grid min-w-0 flex-1 gap-1">
            <Heading
              className={
                variant === "page"
                  ? "flex flex-wrap items-center gap-x-3 gap-y-1 font-serif text-heading-sm @md:text-heading @lg:text-heading-lg"
                  : variant === "section"
                    ? "flex flex-wrap items-center gap-x-3 gap-y-1 text-body-lg font-semibold @md:text-heading-sm"
                    : "flex flex-wrap items-center gap-x-3 gap-y-1 text-body font-semibold"
              }
            >
              {heading}
              {showCount ? (
                <Badge variant="neutral" size="sm">
                  {count}
                </Badge>
              ) : null}
            </Heading>
            {description ? (
              <p className="text-ui-md text-muted-foreground @lg:text-body">{description}</p>
            ) : null}
            {showStatusLine ? (
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-ui-sm text-muted-foreground">
                {status ? (
                  <li className="flex">
                    <Badge variant={status.tone ?? "neutral"} size="sm" dot>
                      {status.label}
                    </Badge>
                  </li>
                ) : null}
                {meta.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        )}

        {primaryLabel || secondaryLabel ? (
          <div className="flex gap-2 @sm:shrink-0">
            {secondaryLabel ? (
              <Button
                type="button"
                variant="outline"
                size={isPage ? "md" : "sm"}
                className="flex-1 @sm:flex-none"
                disabled={inert || count === 0}
                onClick={onSecondaryAction}
              >
                {secondaryLabel}
              </Button>
            ) : null}
            {primaryLabel ? (
              <Button
                type="button"
                variant="primary"
                size={isPage ? "md" : "sm"}
                className="flex-1 @sm:flex-none"
                disabled={inert}
                onClick={onPrimaryAction}
              >
                {primaryLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? (
        <Alert.Root variant="error">
          <Alert.Content>
            <Alert.Title>{error}</Alert.Title>
            <Alert.Description>
              Only these details failed to load; nothing was lost.
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
      ) : null}
    </div>
  );

  if (variant === "card") {
    return (
      <div
        className="@container moderno-block-section-header text-foreground"
        data-variant={variant}
      >
        <Card.Root>
          <Card.Header>{bar}</Card.Header>
          {children ? <Card.Content>{children}</Card.Content> : null}
        </Card.Root>
      </div>
    );
  }

  return (
    <header
      className="@container moderno-block-section-header text-foreground"
      data-variant={variant}
    >
      <div className={variant === "section" ? "border-b border-border pb-4" : undefined}>{bar}</div>
    </header>
  );
}
