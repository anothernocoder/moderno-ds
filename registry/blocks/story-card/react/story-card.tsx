import { Alert, Avatar, Badge, Button, Card, Skeleton } from "@moderno-ui/react";

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

export function StoryCard({
  brand = "Moderno Studio",
  brandInitials = "MS",
  brandLogoUrl,
  badge = "Sponsored",
  kicker = "New collection",
  title = "Design that feels modern.",
  detail = "Hand-glazed stoneware for slow mornings. In stores Friday.",
  image,
  actionLabel = "Shop now",
  error,
  loading = false,
  disabled = false,
  onAction,
  onRetry,
}: StoryCardProps) {
  const hasLogo = Boolean(brandInitials || brandLogoUrl);
  const isEmpty = !title && !image;

  return (
    <article className="@container moderno-block-story-card text-foreground">
      <div className="mx-auto w-full max-w-md @lg:py-16">
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
          <div role="status" aria-busy="true" className="relative">
            <span className="sr-only">Loading the story…</span>
            <Card.Root
              aria-hidden="true"
              className="aspect-9/16 gap-4 overflow-hidden p-5 @sm:p-6 @md:gap-6 @md:p-10"
            >
              <div className="flex items-center gap-3">
                <Skeleton shape="circle" className="w-8" />
                <Skeleton shape="text" className="w-1/3" />
              </div>
              <Skeleton shape="rect" className="h-auto min-h-0 flex-1" />
              <div className="grid gap-2 @md:gap-3">
                <Skeleton shape="text" className="w-1/3" />
                <Skeleton shape="text" className="h-8 w-3/4" />
                <Skeleton shape="text" />
              </div>
              <Skeleton shape="rect" className="h-10 w-full" />
            </Card.Root>
          </div>
        ) : isEmpty ? (
          <p className="flex aspect-9/16 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-ui-md text-muted-foreground">
            This story has nothing to show yet.
          </p>
        ) : (
          <Card.Root className="aspect-9/16 gap-4 overflow-hidden p-5 @sm:p-6 @md:gap-6 @md:p-10">
            {brand ? (
              <div className="flex items-center gap-3">
                {hasLogo ? (
                  <Avatar.Root size="sm" shape="square">
                    <Avatar.Fallback>{brandInitials}</Avatar.Fallback>
                    {brandLogoUrl ? <Avatar.Image src={brandLogoUrl} alt="" /> : null}
                  </Avatar.Root>
                ) : null}
                <p className="min-w-0 flex-1 truncate text-ui-md font-medium">{brand}</p>
                {badge ? (
                  <Badge variant="outline" size="sm">
                    {badge}
                  </Badge>
                ) : null}
              </div>
            ) : null}

            {image ? (
              <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-muted">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
            ) : null}

            <div className="mt-auto grid gap-2 @md:gap-3">
              {kicker ? (
                <p className="text-ui-sm font-medium text-muted-foreground @md:text-ui-md">
                  {kicker}
                </p>
              ) : null}
              {title ? (
                <h3 className="font-serif text-heading text-balance @sm:text-heading-lg">
                  {title}
                </h3>
              ) : null}
              {detail ? (
                <p className="text-body text-pretty text-muted-foreground @sm:text-body-lg">
                  {detail}
                </p>
              ) : null}
            </div>

            {actionLabel ? (
              <Button
                type="button"
                size="lg"
                className="w-full"
                disabled={disabled}
                aria-label={title ? `${actionLabel}: ${title}` : undefined}
                onClick={onAction}
              >
                {actionLabel}
              </Button>
            ) : null}
          </Card.Root>
        )}
      </div>
    </article>
  );
}
