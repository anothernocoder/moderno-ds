import { Show } from "solid-js";
import { Alert, Avatar, Badge, Button, Card, Skeleton } from "@moderno-ui/solid";

export interface StoryImage {
  src: string;
  alt: string;
}

export interface StoryCardProps {
  brand?: string;
  brandInitials?: string;
  brandLogoUrl?: string;
  badge?: string;
  kicker?: string;
  title?: string;
  detail?: string;
  image?: StoryImage;
  actionLabel?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: () => void;
  onRetry?: () => void;
}

export function StoryCard(props: StoryCardProps) {
  const brand = () => props.brand ?? "Moderno Studio";
  const brandInitials = () => props.brandInitials ?? "MS";
  const badge = () => props.badge ?? "Sponsored";
  const kicker = () => props.kicker ?? "New collection";
  const title = () => props.title ?? "Design that feels modern.";
  const detail = () => props.detail ?? "Hand-glazed stoneware for slow mornings. In stores Friday.";
  const actionLabel = () => props.actionLabel ?? "Shop now";
  const hasLogo = () => Boolean(brandInitials() || props.brandLogoUrl);
  const isEmpty = () => !title() && !props.image;

  return (
    <article class="@container moderno-block-story-card text-foreground">
      <div class="mx-auto w-full max-w-md @lg:py-16">
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
              <div role="status" aria-busy="true" class="relative">
                <span class="sr-only">Loading the story…</span>
                <Card.Root
                  aria-hidden="true"
                  class="aspect-9/16 gap-4 overflow-hidden p-5 @sm:p-6 @md:gap-6 @md:p-10"
                >
                  <div class="flex items-center gap-3">
                    <Skeleton shape="circle" class="w-8" />
                    <Skeleton shape="text" class="w-1/3" />
                  </div>
                  <Skeleton shape="rect" class="h-auto min-h-0 flex-1" />
                  <div class="grid gap-2 @md:gap-3">
                    <Skeleton shape="text" class="w-1/3" />
                    <Skeleton shape="text" class="h-8 w-3/4" />
                    <Skeleton shape="text" />
                  </div>
                  <Skeleton shape="rect" class="h-10 w-full" />
                </Card.Root>
              </div>
            }
          >
            <Show
              when={!isEmpty()}
              fallback={
                <p class="flex aspect-9/16 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-ui-md text-muted-foreground">
                  This story has nothing to show yet.
                </p>
              }
            >
              <Card.Root class="aspect-9/16 gap-4 overflow-hidden p-5 @sm:p-6 @md:gap-6 @md:p-10">
                <Show when={brand()}>
                  <div class="flex items-center gap-3">
                    <Show when={hasLogo()}>
                      <Avatar.Root size="sm" shape="square">
                        <Avatar.Fallback>{brandInitials()}</Avatar.Fallback>
                        <Show when={props.brandLogoUrl}>
                          <Avatar.Image src={props.brandLogoUrl} alt="" />
                        </Show>
                      </Avatar.Root>
                    </Show>
                    <p class="min-w-0 flex-1 truncate text-ui-md font-medium">{brand()}</p>
                    <Show when={badge()}>
                      <Badge variant="outline" size="sm">
                        {badge()}
                      </Badge>
                    </Show>
                  </div>
                </Show>

                <Show when={props.image}>
                  {(image) => (
                    <div class="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={image().src}
                        alt={image().alt}
                        class="absolute inset-0 size-full object-cover"
                      />
                    </div>
                  )}
                </Show>

                <div class="mt-auto grid gap-2 @md:gap-3">
                  <Show when={kicker()}>
                    <p class="text-ui-sm font-medium text-muted-foreground @md:text-ui-md">
                      {kicker()}
                    </p>
                  </Show>
                  <Show when={title()}>
                    <h3 class="font-serif text-heading text-balance @sm:text-heading-lg">
                      {title()}
                    </h3>
                  </Show>
                  <Show when={detail()}>
                    <p class="text-body text-pretty text-muted-foreground @sm:text-body-lg">
                      {detail()}
                    </p>
                  </Show>
                </div>

                <Show when={actionLabel()}>
                  <Button
                    type="button"
                    size="lg"
                    class="w-full"
                    disabled={props.disabled}
                    aria-label={title() ? `${actionLabel()}: ${title()}` : undefined}
                    onClick={props.onAction}
                  >
                    {actionLabel()}
                  </Button>
                </Show>
              </Card.Root>
            </Show>
          </Show>
        </Show>
      </div>
    </article>
  );
}
