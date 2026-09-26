<script lang="ts">
  import { Alert, Avatar, Badge, Button, Card, Skeleton } from "@moderno-ui/svelte";

  type GridListStatus = "neutral" | "info" | "success" | "warning" | "error";

  interface GridListItem {
    id: string;
    title: string;
    subtitle?: string;
    initials: string;
    image?: string;
    status?: string;
    statusVariant?: GridListStatus;
    meta?: string;
  }

  interface Props {
    items?: GridListItem[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onopen?: (id: string) => void;
    oncreate?: () => void;
    onretry?: () => void;
  }

  const sampleItems: GridListItem[] = [
    {
      id: "checkout",
      title: "Checkout redesign",
      subtitle: "Product team",
      initials: "CR",
      status: "In progress",
      statusVariant: "info",
      meta: "Updated 2 hrs ago",
    },
    {
      id: "payments",
      title: "Payments API v2",
      subtitle: "Platform team",
      initials: "PA",
      status: "Blocked",
      statusVariant: "error",
      meta: "Updated yesterday",
    },
    {
      id: "campaign",
      title: "Summer campaign",
      subtitle: "Marketing",
      initials: "SC",
      status: "Paused",
      statusVariant: "warning",
      meta: "Updated 3 days ago",
    },
    {
      id: "migration",
      title: "Vue 3 migration",
      subtitle: "Platform team",
      initials: "VM",
      status: "Shipped",
      statusVariant: "success",
      meta: "Updated last week",
    },
    {
      id: "brand",
      title: "Brand refresh",
      subtitle: "Design",
      initials: "BR",
      status: "Draft",
      statusVariant: "neutral",
      meta: "Updated 2 weeks ago",
    },
    {
      id: "onboarding",
      title: "Mobile onboarding",
      subtitle: "Product team",
      initials: "MO",
      status: "In progress",
      statusVariant: "info",
      meta: "Updated last month",
    },
  ];

  const placeholders = ["first", "second", "third"];

  let {
    items = sampleItems,
    heading = "Projects",
    description = "Everything your team is working on, most recent first.",
    error,
    loading = false,
    disabled = false,
    onopen,
    oncreate,
    onretry,
  }: Props = $props();

  const inert = $derived(loading || disabled);
  const showGrid = $derived(!error && !loading && items.length > 0);
</script>

<section class="@container moderno-block-grid-list text-foreground">
  <div class="grid gap-4">
    <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
      <div class="grid gap-1">
        <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
        {#if description}
          <p class="text-ui-md text-muted-foreground">{description}</p>
        {/if}
      </div>
      <Button type="button" size="sm" disabled={inert} onclick={oncreate}>New project</Button>
    </div>

    {#if error}
      <Alert.Root variant="error">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>Nothing was changed. Your projects are still saved.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" onclick={onretry}>Try again</Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {/if}

    {#if loading}
      <div role="status" aria-busy="true" class="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3">
        <span class="sr-only">Loading projects…</span>
        {#each placeholders as key (key)}
          <Card.Root size="sm" aria-hidden="true">
            <Card.Header class="flex-row items-center gap-3">
              <Skeleton shape="rect" class="size-10" />
              <div class="grid flex-1 gap-2">
                <Skeleton shape="text" class="w-3/4" />
                <Skeleton shape="text" class="w-1/2" />
              </div>
            </Card.Header>
            <Card.Content>
              <Skeleton shape="text" class="w-1/3" />
            </Card.Content>
            <Card.Footer>
              <Skeleton shape="text" class="h-8" />
            </Card.Footer>
          </Card.Root>
        {/each}
      </div>
    {/if}

    {#if !error && !loading && items.length === 0}
      <Card.Root>
        <Card.Header class="items-center text-center">
          <Card.Title>No projects yet</Card.Title>
          <Card.Description>Projects you create or join show up here as cards.</Card.Description>
        </Card.Header>
      </Card.Root>
    {/if}

    {#if showGrid}
      <ul class="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3">
        {#each items as item (item.id)}
          <li class="flex">
            <Card.Root size="sm">
              <Card.Header class="flex-row items-center gap-3">
                <Avatar.Root shape="square">
                  <Avatar.Fallback>{item.initials}</Avatar.Fallback>
                  {#if item.image}
                    <Avatar.Image src={item.image} alt="" />
                  {/if}
                </Avatar.Root>
                <div class="grid min-w-0 flex-1 gap-1">
                  <Card.Title class="truncate">{item.title}</Card.Title>
                  {#if item.subtitle}
                    <Card.Description class="truncate">{item.subtitle}</Card.Description>
                  {/if}
                </div>
              </Card.Header>
              <Card.Content class="flex-row flex-wrap items-center gap-2">
                {#if item.status}
                  <Badge variant={item.statusVariant ?? "neutral"} dot>{item.status}</Badge>
                {/if}
                {#if item.meta}
                  <span class="text-ui-sm text-muted-foreground">{item.meta}</span>
                {/if}
              </Card.Content>
              <Card.Footer>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  class="w-full"
                  disabled={inert}
                  aria-label={`Open ${item.title}`}
                  onclick={() => onopen?.(item.id)}
                >
                  Open
                </Button>
              </Card.Footer>
            </Card.Root>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>
