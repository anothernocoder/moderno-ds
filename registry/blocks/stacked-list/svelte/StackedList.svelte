<script lang="ts">
  import { Alert, Avatar, Badge, Button, Card, Skeleton } from "@moderno-ui/svelte";

  type StackedListStatus = "neutral" | "info" | "success" | "warning" | "error";

  interface StackedListItem {
    id: string;
    title: string;
    subtitle?: string;
    initials: string;
    image?: string;
    status?: string;
    statusVariant?: StackedListStatus;
    meta?: string;
  }

  interface Props {
    items?: StackedListItem[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onview?: (id: string) => void;
    oninvite?: () => void;
    onretry?: () => void;
  }

  const sampleItems: StackedListItem[] = [
    {
      id: "leslie",
      title: "Leslie Alexander",
      subtitle: "leslie.alexander@example.com",
      initials: "LA",
      status: "Active",
      statusVariant: "success",
      meta: "Last seen 3 hrs ago",
    },
    {
      id: "michael",
      title: "Michael Foster",
      subtitle: "michael.foster@example.com",
      initials: "MF",
      status: "Invited",
      statusVariant: "info",
      meta: "Invited 2 days ago",
    },
    {
      id: "dries",
      title: "Dries Vincent",
      subtitle: "dries.vincent@example.com",
      initials: "DV",
      status: "Away",
      statusVariant: "warning",
      meta: "Last seen yesterday",
    },
    {
      id: "lindsay",
      title: "Lindsay Walton",
      subtitle: "lindsay.walton@example.com",
      initials: "LW",
      status: "Suspended",
      statusVariant: "error",
      meta: "Suspended last week",
    },
    {
      id: "courtney",
      title: "Courtney Henry",
      subtitle: "courtney.henry@example.com",
      initials: "CH",
      status: "Guest",
      statusVariant: "neutral",
      meta: "Last seen 2 weeks ago",
    },
  ];

  const placeholders = ["first", "second", "third"];

  let {
    items = sampleItems,
    heading = "Team members",
    description = "Everyone with access to this workspace.",
    error,
    loading = false,
    disabled = false,
    onview,
    oninvite,
    onretry,
  }: Props = $props();

  const inert = $derived(loading || disabled);
  const showRows = $derived(!loading && items.length > 0);
</script>

<section class="@container moderno-block-stacked-list text-foreground">
  <div class="grid gap-4">
    <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
      <div class="grid gap-1">
        <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
        {#if description}
          <p class="text-ui-md text-muted-foreground">{description}</p>
        {/if}
      </div>
      <Button type="button" size="sm" disabled={inert} onclick={oninvite}>Invite member</Button>
    </div>

    {#if error}
      <Alert.Root variant="error">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>Nothing was changed. Your team is still saved.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" onclick={onretry}>Try again</Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {:else}
      <Card.Root>
        <Card.Content class="gap-0 p-4 @sm:p-6">
          {#if loading}
            <div role="status" aria-busy="true" class="grid">
              {#each placeholders as key (key)}
                <div aria-hidden="true" class="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
                  <Skeleton shape="circle" class="size-10 shrink-0" />
                  <div class="grid flex-1 gap-2">
                    <Skeleton shape="text" class="w-1/3" />
                    <Skeleton shape="text" class="w-2/3" />
                  </div>
                </div>
              {/each}
              <span class="sr-only">Loading team members…</span>
            </div>
          {/if}

          {#if !loading && items.length === 0}
            <div class="grid gap-1 py-4 text-center">
              <p class="text-ui-md font-medium">No members yet</p>
              <p class="text-ui-md text-muted-foreground">People you invite show up here.</p>
            </div>
          {/if}

          {#if showRows}
            <ul class="divide-y divide-border">
              {#each items as item (item.id)}
                <li
                  class="grid justify-items-start gap-3 py-4 first:pt-0 last:pb-0 @sm:flex @sm:items-center @sm:gap-4"
                >
                  <div class="flex w-full min-w-0 flex-1 items-start gap-3 @md:items-center">
                    <Avatar.Root>
                      <Avatar.Fallback>{item.initials}</Avatar.Fallback>
                      {#if item.image}
                        <Avatar.Image src={item.image} alt="" />
                      {/if}
                    </Avatar.Root>
                    <div
                      class="grid min-w-0 flex-1 gap-2 @md:flex @md:items-center @md:justify-between @md:gap-4"
                    >
                      <div class="grid min-w-0 gap-1">
                        <p class="truncate text-ui-md font-medium">{item.title}</p>
                        {#if item.subtitle}
                          <p class="truncate text-ui-md text-muted-foreground">{item.subtitle}</p>
                        {/if}
                      </div>
                      {#if item.status || item.meta}
                        <div
                          class="flex flex-wrap items-center gap-2 @md:shrink-0 @md:flex-col @md:items-end @md:gap-1 @lg:flex-row @lg:items-center @lg:gap-3"
                        >
                          {#if item.status}
                            <Badge variant={item.statusVariant ?? "neutral"} dot>{item.status}</Badge>
                          {/if}
                          {#if item.meta}
                            <span class="text-ui-sm text-muted-foreground">{item.meta}</span>
                          {/if}
                        </div>
                      {/if}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    class="shrink-0"
                    disabled={inert}
                    aria-label={`View ${item.title}`}
                    onclick={() => onview?.(item.id)}
                  >
                    View
                  </Button>
                </li>
              {/each}
            </ul>
          {/if}
        </Card.Content>
      </Card.Root>
    {/if}
  </div>
</section>
