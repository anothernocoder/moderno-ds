import { useId } from "react";
import { Alert, Avatar, Button, Skeleton } from "@moderno-ui/react";

export type MediaObjectPosition = "start" | "end";

export interface MediaObjectProps {
  heading?: string;
  meta?: string;
  body?: string;
  initials?: string;
  avatarUrl?: string;
  mediaPosition?: MediaObjectPosition;
  actionLabel?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: () => void;
  onRetry?: () => void;
}

export function MediaObject({
  heading = "Ada Lovelace",
  meta = "Commented 2 hours ago",
  body = "The new onboarding reads well. Could we drop the second step? Most people skip it, and the first one already asks for the same details.",
  initials = "AL",
  avatarUrl,
  mediaPosition = "start",
  actionLabel = "Reply",
  error,
  loading = false,
  disabled = false,
  onAction,
  onRetry,
}: MediaObjectProps) {
  const headingId = `${useId()}-heading`;

  if (loading) {
    return (
      <article className="@container moderno-block-media-object text-foreground">
        <div
          role="status"
          aria-busy="true"
          data-media-position={mediaPosition}
          className="flex flex-col items-start gap-3 @sm:flex-row @sm:gap-4 @sm:data-[media-position=end]:flex-row-reverse"
        >
          <span className="sr-only">Loading…</span>
          <Skeleton shape="circle" aria-hidden="true" className="w-10" />
          <div aria-hidden="true" className="grid w-full min-w-0 flex-1 gap-2">
            <Skeleton shape="text" className="w-1/3" />
            <Skeleton shape="text" />
            <Skeleton shape="text" className="w-2/3" />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="@container moderno-block-media-object text-foreground">
      <div
        data-media-position={mediaPosition}
        className="flex flex-col items-start gap-3 @sm:flex-row @sm:gap-4 @sm:data-[media-position=end]:flex-row-reverse"
      >
        <Avatar.Root>
          <Avatar.Fallback>{initials}</Avatar.Fallback>
          {avatarUrl ? <Avatar.Image src={avatarUrl} alt="" /> : null}
        </Avatar.Root>

        <div className="grid w-full min-w-0 flex-1 gap-2">
          <header className="grid gap-0.5 @lg:flex @lg:items-baseline @lg:justify-between @lg:gap-4">
            <h3 id={headingId} className="text-body font-semibold @md:text-body-lg">
              {heading}
            </h3>
            {meta ? <p className="text-ui-sm text-muted-foreground @lg:shrink-0">{meta}</p> : null}
          </header>

          {error ? (
            <Alert.Root variant="error">
              <Alert.Content>
                <Alert.Title>{error}</Alert.Title>
                <Alert.Description>Only this message failed to load.</Alert.Description>
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
          ) : body ? (
            <p className="text-ui-md @md:text-body">{body}</p>
          ) : (
            <p className="text-ui-md text-muted-foreground">Nothing written yet.</p>
          )}

          {!error && actionLabel ? (
            <div className="flex">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                aria-describedby={headingId}
                onClick={onAction}
              >
                {actionLabel}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
