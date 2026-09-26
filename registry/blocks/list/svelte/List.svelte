<script lang="ts">
  import { Alert, Avatar, Badge, Button, Card, Skeleton, type BadgeVariant } from "@moderno-ui/svelte";

  interface ListItem {
    id: string;
    title: string;
    subtitle?: string;
    initials: string;
    avatarUrl?: string;
    status?: string;
    statusVariant?: BadgeVariant;
    meta?: string;
  }

  interface Props {
    items?: ListItem[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    oninvite?: () => void;
    onedit?: (id: string) => void;
    onremove?: (id: string) => void;
    onretry?: () => void;
  }

  const sampleItems: ListItem[] = [
    {
      id: "ana-lopez",
      title: "Ana López",
      subtitle: "ana.lopez@example.com",
      initials: "AL",
      status: "Active",
      statusVariant: "success",
      meta: "Online now",
    },
    {
      id: "ben-okafor",
      title: "Ben Okafor",
      subtitle: "ben.okafor@example.com",
      initials: "BO",
      status: "Invited",
      statusVariant: "info",
      meta: "Sent 2 days ago",
    },
    {
      id: "chen-wei",
      title: "Chen Wei",
      subtitle: "chen.wei@example.com",
      initials: "CW",
      status: "Active",
      statusVariant: "success",
      meta: "Seen 3 hrs ago",
    },
    {
      id: "dara-singh",
      title: "Dara Singh",
      subtitle: "dara.singh@example.com",
      initials: "DS",
      status: "Away",
      statusVariant: "warning",
      meta: "Back on Monday",
    },
    {
      id: "eli-moreau",
      title: "Eli Moreau",
      subtitle: "eli.moreau@example.com",
      initials: "EM",
      status: "Suspended",
      statusVariant: "error",
      meta: "Since last week",
    },
  ];

  const placeholders = ["first", "second", "third"];

  let {
    items = sampleItems,
    heading = "Team members",
    description = "People who can open and edit this workspace.",
    error,
    loading = false,
    disabled = false,
    oninvite,
    onedit,
    onremove,
    onretry,
  }: Props = $props();

  const inert = $derived(loading || disabled);
</script>

<section class="@container moderno-block-list text-foreground">
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
          <Alert.Description>Nothing was changed. Your team is still in place.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {:else if loading}
      <Card.Root size="sm">
        <div role="status" aria-busy="true">
          <span class="sr-only">Loading team members…</span>
          <div class="divide-y divide-border" aria-hidden="true">
            {#each placeholders as key (key)}
              <div class="flex items-center gap-3 px-4 py-3">
                <Skeleton shape="circle" />
                <div class="grid flex-1 gap-2">
                  <Skeleton shape="text" class="w-1/2" />
                  <Skeleton shape="text" class="w-3/4" />
                </div>
              </div>
            {/each}
          </div>
        </div>
      </Card.Root>
    {:else if items.length === 0}
      <Card.Root>
        <Card.Header class="items-center text-center">
          <Card.Title>No members yet</Card.Title>
          <Card.Description>People you invite show up here, one row each.</Card.Description>
        </Card.Header>
      </Card.Root>
    {:else}
      <Card.Root size="sm">
        <ul class="divide-y divide-border">
          {#each items as item (item.id)}
            <li
              class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 px-4 py-3 @sm:grid-cols-[auto_minmax(0,1fr)_auto] @md:grid-cols-[auto_minmax(0,1fr)_auto_auto] @md:gap-x-4"
            >
              <Avatar.Root>
                <Avatar.Fallback>{item.initials}</Avatar.Fallback>
                {#if item.avatarUrl}
                  <Avatar.Image src={item.avatarUrl} alt="" />
                {/if}
              </Avatar.Root>
              <div class="grid min-w-0 gap-0.5">
                <p class="truncate text-ui-md font-medium">{item.title}</p>
                {#if item.subtitle}
                  <p class="truncate text-ui-sm text-muted-foreground">{item.subtitle}</p>
                {/if}
              </div>
              {#if item.status || item.meta}
                <div
                  class="col-start-2 flex flex-wrap items-center gap-2 @md:col-start-3 @md:row-start-1 @md:flex-col @md:items-end @md:gap-1 @lg:flex-row @lg:items-center @lg:gap-4"
                >
                  {#if item.status}
                    <Badge variant={item.statusVariant ?? "neutral"} size="sm" dot>{item.status}</Badge>
                  {/if}
                  {#if item.meta}
                    <span class="text-ui-xs text-muted-foreground @lg:w-28 @lg:text-right">{item.meta}</span>
                  {/if}
                </div>
              {/if}
              <div
                class="col-start-2 flex gap-2 @sm:col-start-3 @sm:row-span-2 @sm:row-start-1 @md:col-start-4 @md:row-span-1"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  {disabled}
                  aria-label={`Edit ${item.title}`}
                  onclick={() => onedit?.(item.id)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  {disabled}
                  aria-label={`Remove ${item.title}`}
                  onclick={() => onremove?.(item.id)}
                >
                  Remove
                </Button>
              </div>
            </li>
          {/each}
        </ul>
      </Card.Root>
    {/if}
  </div>
</section>
