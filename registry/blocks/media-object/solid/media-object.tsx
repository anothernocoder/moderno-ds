import { createUniqueId, Show } from "solid-js";
import { Alert, Avatar, Button, Skeleton } from "@moderno-ui/solid";

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

export function MediaObject(props: MediaObjectProps) {
  const headingId = `${createUniqueId()}-heading`;
  const heading = () => props.heading ?? "Ada Lovelace";
  const meta = () => props.meta ?? "Commented 2 hours ago";
  const body = () =>
    props.body ??
    "The new onboarding reads well. Could we drop the second step? Most people skip it, and the first one already asks for the same details.";
  const initials = () => props.initials ?? "AL";
  const actionLabel = () => props.actionLabel ?? "Reply";
  const mediaPosition = () => props.mediaPosition ?? "start";

  return (
    <article class="@container moderno-block-media-object text-foreground">
      <Show
        when={!props.loading}
        fallback={
          <div
            role="status"
            aria-busy="true"
            data-media-position={mediaPosition()}
            class="flex flex-col items-start gap-3 @sm:flex-row @sm:gap-4 @sm:data-[media-position=end]:flex-row-reverse"
          >
            <span class="sr-only">Loading…</span>
            <Skeleton shape="circle" aria-hidden="true" class="w-10" />
            <div aria-hidden="true" class="grid w-full min-w-0 flex-1 gap-2">
              <Skeleton shape="text" class="w-1/3" />
              <Skeleton shape="text" />
              <Skeleton shape="text" class="w-2/3" />
            </div>
          </div>
        }
      >
        <div
          data-media-position={mediaPosition()}
          class="flex flex-col items-start gap-3 @sm:flex-row @sm:gap-4 @sm:data-[media-position=end]:flex-row-reverse"
        >
          <Avatar.Root>
            <Avatar.Fallback>{initials()}</Avatar.Fallback>
            <Show when={props.avatarUrl}>
              <Avatar.Image src={props.avatarUrl} alt="" />
            </Show>
          </Avatar.Root>

          <div class="grid w-full min-w-0 flex-1 gap-2">
            <header class="grid gap-0.5 @lg:flex @lg:items-baseline @lg:justify-between @lg:gap-4">
              <h3 id={headingId} class="text-body font-semibold @md:text-body-lg">
                {heading()}
              </h3>
              <Show when={meta()}>
                <p class="text-ui-sm text-muted-foreground @lg:shrink-0">{meta()}</p>
              </Show>
            </header>

            <Show
              when={!props.error}
              fallback={
                <Alert.Root variant="error">
                  <Alert.Content>
                    <Alert.Title>{props.error}</Alert.Title>
                    <Alert.Description>Only this message failed to load.</Alert.Description>
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
              }
            >
              <Show
                when={body()}
                fallback={<p class="text-ui-md text-muted-foreground">Nothing written yet.</p>}
              >
                <p class="text-ui-md @md:text-body">{body()}</p>
              </Show>
            </Show>

            <Show when={!props.error && actionLabel()}>
              <div class="flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={props.disabled}
                  aria-describedby={headingId}
                  onClick={() => props.onAction?.()}
                >
                  {actionLabel()}
                </Button>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </article>
  );
}
