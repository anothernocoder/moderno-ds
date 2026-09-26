<script lang="ts">
  import { Alert, Avatar, Button, Skeleton } from "@moderno-ui/svelte";

  type MediaObjectPosition = "start" | "end";

  interface Props {
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
    onaction?: () => void;
    onretry?: () => void;
  }

  let {
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
    onaction,
    onretry,
  }: Props = $props();

  const uid = $props.id();
  const headingId = `${uid}-heading`;
</script>

<article class="@container moderno-block-media-object text-foreground">
  {#if loading}
    <div
      role="status"
      aria-busy="true"
      data-media-position={mediaPosition}
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
  {:else}
    <div data-media-position={mediaPosition} class="flex flex-col items-start gap-3 @sm:flex-row @sm:gap-4 @sm:data-[media-position=end]:flex-row-reverse">
      <Avatar.Root>
        <Avatar.Fallback>{initials}</Avatar.Fallback>
        {#if avatarUrl}
          <Avatar.Image src={avatarUrl} alt="" />
        {/if}
      </Avatar.Root>

      <div class="grid w-full min-w-0 flex-1 gap-2">
        <header class="grid gap-0.5 @lg:flex @lg:items-baseline @lg:justify-between @lg:gap-4">
          <h3 id={headingId} class="text-body font-semibold @md:text-body-lg">{heading}</h3>
          {#if meta}
            <p class="text-ui-sm text-muted-foreground @lg:shrink-0">{meta}</p>
          {/if}
        </header>

        {#if error}
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>Only this message failed to load.</Alert.Description>
              <Alert.Action>
                <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        {:else if body}
          <p class="text-ui-md @md:text-body">{body}</p>
        {:else}
          <p class="text-ui-md text-muted-foreground">Nothing written yet.</p>
        {/if}

        {#if !error && actionLabel}
          <div class="flex">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              {disabled}
              aria-describedby={headingId}
              onclick={onaction}
            >
              {actionLabel}
            </Button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</article>
