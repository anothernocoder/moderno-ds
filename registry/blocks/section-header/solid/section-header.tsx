import { children, For, Show, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Alert, Badge, Button, Card, Skeleton } from "@moderno-ui/solid";

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
  children?: JSX.Element;
}

export function SectionHeader(props: SectionHeaderProps) {
  const variant = () => props.variant ?? "page";
  const heading = () => props.heading ?? "Q3 redesign";
  const description = () =>
    props.description ??
    "Refresh the marketing site and the onboarding flow before the October launch.";
  const breadcrumbs = () => props.breadcrumbs ?? sampleCrumbs;
  const status = () => (props.status === undefined ? sampleStatus : props.status);
  const meta = () => props.meta ?? sampleMeta;
  const primaryLabel = () => props.primaryLabel ?? "New task";
  const secondaryLabel = () => props.secondaryLabel ?? "Share";

  const isPage = () => variant() === "page";
  const inert = () => Boolean(props.disabled) || Boolean(props.loading) || Boolean(props.error);
  const showDetails = () => !props.loading && !props.error;
  const showCount = () => showDetails() && props.count !== undefined;
  const showStatusLine = () =>
    isPage() && showDetails() && (status() !== null || meta().length > 0);
  const body = children(() => props.children);

  const bar = () => (
    <div class="grid gap-3">
      <Show when={isPage() && breadcrumbs().length > 0}>
        <nav aria-label="Breadcrumb">
          <ol class="flex flex-wrap items-center gap-2 text-ui-sm text-muted-foreground">
            <For each={breadcrumbs()}>
              {(crumb, index) => {
                const current = () => index() === breadcrumbs().length - 1;
                const parent = () => index() === breadcrumbs().length - 2;
                return (
                  <li
                    class={
                      parent() ? "flex items-center gap-2" : "hidden items-center gap-2 @sm:flex"
                    }
                  >
                    <Show when={parent()}>
                      <span aria-hidden="true" class="@sm:hidden">
                        ←
                      </span>
                    </Show>
                    <Show when={index() > 0}>
                      <span aria-hidden="true" class="hidden @sm:inline">
                        /
                      </span>
                    </Show>
                    <Show
                      when={crumb.href && !current()}
                      fallback={
                        <span
                          aria-current={current() ? "page" : undefined}
                          class="font-medium text-foreground"
                        >
                          {crumb.label}
                        </span>
                      }
                    >
                      <a
                        class="rounded-sm transition-colors hover:text-foreground hover:underline underline-offset-4 focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        href={crumb.href}
                      >
                        {crumb.label}
                      </a>
                    </Show>
                  </li>
                );
              }}
            </For>
          </ol>
        </nav>
      </Show>

      <div class="grid gap-4 @sm:flex @sm:items-start @sm:justify-between @sm:gap-6">
        <Show
          when={!props.loading}
          fallback={
            <div role="status" aria-busy="true" class="grid min-w-0 flex-1 gap-2">
              <span class="sr-only">Loading…</span>
              <Skeleton shape="text" class="h-7 w-1/2 @md:h-8" />
              <Skeleton shape="text" class="w-3/4" />
              <Show when={isPage()}>
                <Skeleton shape="text" class="w-1/3" />
              </Show>
            </div>
          }
        >
          <div class="grid min-w-0 flex-1 gap-1">
            <Dynamic
              component={headingTags[variant()]}
              class={
                variant() === "page"
                  ? "flex flex-wrap items-center gap-x-3 gap-y-1 font-serif text-heading-sm @md:text-heading @lg:text-heading-lg"
                  : variant() === "section"
                    ? "flex flex-wrap items-center gap-x-3 gap-y-1 text-body-lg font-semibold @md:text-heading-sm"
                    : "flex flex-wrap items-center gap-x-3 gap-y-1 text-body font-semibold"
              }
            >
              {heading()}
              <Show when={showCount()}>
                <Badge variant="neutral" size="sm">
                  {props.count}
                </Badge>
              </Show>
            </Dynamic>
            <Show when={description()}>
              <p class="text-ui-md text-muted-foreground @lg:text-body">{description()}</p>
            </Show>
            <Show when={showStatusLine()}>
              <ul class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-ui-sm text-muted-foreground">
                <Show when={status()}>
                  {(current) => (
                    <li class="flex">
                      <Badge variant={current().tone ?? "neutral"} size="sm" dot>
                        {current().label}
                      </Badge>
                    </li>
                  )}
                </Show>
                <For each={meta()}>{(item) => <li>{item}</li>}</For>
              </ul>
            </Show>
          </div>
        </Show>

        <Show when={primaryLabel() || secondaryLabel()}>
          <div class="flex gap-2 @sm:shrink-0">
            <Show when={secondaryLabel()}>
              <Button
                type="button"
                variant="outline"
                size={isPage() ? "md" : "sm"}
                class="flex-1 @sm:flex-none"
                disabled={inert() || props.count === 0}
                onClick={() => props.onSecondaryAction?.()}
              >
                {secondaryLabel()}
              </Button>
            </Show>
            <Show when={primaryLabel()}>
              <Button
                type="button"
                variant="primary"
                size={isPage() ? "md" : "sm"}
                class="flex-1 @sm:flex-none"
                disabled={inert()}
                onClick={() => props.onPrimaryAction?.()}
              >
                {primaryLabel()}
              </Button>
            </Show>
          </div>
        </Show>
      </div>

      <Show when={props.error}>
        <Alert.Root variant="error">
          <Alert.Content>
            <Alert.Title>{props.error}</Alert.Title>
            <Alert.Description>
              Only these details failed to load; nothing was lost.
            </Alert.Description>
            <Alert.Action>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={props.disabled}
                onClick={() => props.onRetry?.()}
              >
                Try again
              </Button>
            </Alert.Action>
          </Alert.Content>
        </Alert.Root>
      </Show>
    </div>
  );

  return (
    <Show
      when={variant() === "card"}
      fallback={
        <header
          class="@container moderno-block-section-header text-foreground"
          data-variant={variant()}
        >
          <div class={variant() === "section" ? "border-b border-border pb-4" : undefined}>
            {bar()}
          </div>
        </header>
      }
    >
      <div class="@container moderno-block-section-header text-foreground" data-variant="card">
        <Card.Root>
          <Card.Header>{bar()}</Card.Header>
          <Show when={body()}>
            <Card.Content>{body()}</Card.Content>
          </Show>
        </Card.Root>
      </div>
    </Show>
  );
}
