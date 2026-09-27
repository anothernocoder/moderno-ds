<script lang="ts">
  import { Alert, Avatar, Badge, Button, Card, Skeleton } from "@moderno-ui/svelte";

  interface StoryImage {
    src: string;
    alt: string;
  }

  interface Props {
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
    onaction?: () => void;
    onretry?: () => void;
  }

  let {
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
    onaction,
    onretry,
  }: Props = $props();

  const hasLogo = $derived(Boolean(brandInitials || brandLogoUrl));
  const isEmpty = $derived(!title && !image);
</script>

<article class="@container moderno-block-story-card text-foreground">
  <div class="mx-auto w-full max-w-md @lg:py-16">
    {#if error}
      <Alert.Root variant="error">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>The rest of the page still works. Try again in a moment.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {:else if loading}
      <div role="status" aria-busy="true" class="relative">
        <span class="sr-only">Loading the story…</span>
        <Card.Root aria-hidden="true" class="aspect-9/16 gap-4 overflow-hidden p-5 @sm:p-6 @md:gap-6 @md:p-10">
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
    {:else if isEmpty}
      <p
        class="flex aspect-9/16 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-ui-md text-muted-foreground"
      >
        This story has nothing to show yet.
      </p>
    {:else}
      <Card.Root class="aspect-9/16 gap-4 overflow-hidden p-5 @sm:p-6 @md:gap-6 @md:p-10">
        {#if brand}
          <div class="flex items-center gap-3">
            {#if hasLogo}
              <Avatar.Root size="sm" shape="square">
                <Avatar.Fallback>{brandInitials}</Avatar.Fallback>
                {#if brandLogoUrl}
                  <Avatar.Image src={brandLogoUrl} alt="" />
                {/if}
              </Avatar.Root>
            {/if}
            <p class="min-w-0 flex-1 truncate text-ui-md font-medium">{brand}</p>
            {#if badge}
              <Badge variant="outline" size="sm">{badge}</Badge>
            {/if}
          </div>
        {/if}

        {#if image}
          <div class="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-muted">
            <img src={image.src} alt={image.alt} class="absolute inset-0 size-full object-cover" />
          </div>
        {/if}

        <div class="mt-auto grid gap-2 @md:gap-3">
          {#if kicker}
            <p class="text-ui-sm font-medium text-muted-foreground @md:text-ui-md">{kicker}</p>
          {/if}
          {#if title}
            <h3 class="font-serif text-heading text-balance @sm:text-heading-lg">{title}</h3>
          {/if}
          {#if detail}
            <p class="text-body text-pretty text-muted-foreground @sm:text-body-lg">{detail}</p>
          {/if}
        </div>

        {#if actionLabel}
          <Button
            type="button"
            size="lg"
            class="w-full"
            {disabled}
            aria-label={title ? `${actionLabel}: ${title}` : undefined}
            onclick={onaction}
          >
            {actionLabel}
          </Button>
        {/if}
      </Card.Root>
    {/if}
  </div>
</article>
