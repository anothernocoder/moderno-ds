<script lang="ts">
  import { Alert, Avatar, Badge, Button, Card, Skeleton, type BadgeVariant } from "@moderno-ui/svelte";

  interface ListContainerItem {
    id: string;
    title: string;
    subtitle?: string;
    meta?: string;
    initials: string;
    avatarUrl?: string;
    status?: string;
    statusVariant?: BadgeVariant;
  }

  interface Props {
    items?: ListContainerItem[];
    heading?: string;
    description?: string;
    actionLabel?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onaction?: () => void;
    onretry?: () => void;
  }

  const sampleItems: ListContainerItem[] = [
    {
      id: "onboarding",
      title: "Design the onboarding flow",
      subtitle: "Product",
      meta: "Due today",
      initials: "AL",
      status: "In progress",
      statusVariant: "info",
    },
    {
      id: "checkout-copy",
      title: "Review the checkout copy",
      subtitle: "Content",
      meta: "Due tomorrow",
      initials: "GH",
      status: "To do",
      statusVariant: "warning",
    },
    {
      id: "colour-tokens",
      title: "Migrate the colour tokens",
      subtitle: "Design",
      meta: "Yesterday",
      initials: "KJ",
      status: "Done",
      statusVariant: "success",
    },
    {
      id: "accessibility-audit",
      title: "Run the accessibility audit",
      subtitle: "QA",
      meta: "2 days ago",
      initials: "AT",
      status: "Blocked",
      statusVariant: "error",
    },
    {
      id: "brand-guide",
      title: "Update the brand guide",
      subtitle: "Marketing",
      meta: "3 days ago",
      initials: "MH",
      status: "Done",
      statusVariant: "success",
    },
    {
      id: "release-demo",
      title: "Prepare the release demo",
      subtitle: "Product",
      meta: "4 days ago",
      initials: "DV",
      status: "In progress",
      statusVariant: "info",
    },
  ];

  const placeholders = ["first", "second", "third", "fourth"];

  function countLabel(count: number): string {
    return count === 1 ? "1 task" : `${count} tasks`;
  }

  let {
    items = sampleItems,
    heading = "Sprint tasks",
    description = "Open work for the team, soonest first.",
    actionLabel = "View all tasks",
    error,
    loading = false,
    disabled = false,
    onaction,
    onretry,
  }: Props = $props();

  const showItems = $derived(!error && !loading && items.length > 0);
</script>

<section class="@container moderno-block-list-container text-foreground">
  <Card.Root size="sm">
    <Card.Header>
      <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
      {#if description}
        <Card.Description>{description}</Card.Description>
      {/if}
    </Card.Header>

    <div class="border-y border-border">
      {#if error}
        <div class="p-4">
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>Your tasks are safe; only this list failed to load.</Alert.Description>
              <Alert.Action>
                <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        </div>
      {:else if loading}
        <div role="status" aria-busy="true" class="grid gap-4 p-4">
          <span class="sr-only">Loading tasks…</span>
          {#each placeholders as key (key)}
            <div class="flex items-center gap-3" aria-hidden="true">
              <Skeleton shape="circle" />
              <div class="grid flex-1 gap-2">
                <Skeleton shape="text" class="w-2/3" />
                <Skeleton shape="text" class="w-1/3" />
              </div>
            </div>
          {/each}
        </div>
      {:else if items.length === 0}
        <div class="grid justify-items-center gap-1 px-4 py-10 text-center">
          <p class="text-ui-md font-semibold">No tasks yet</p>
          <p class="text-ui-md text-muted-foreground">New work for this sprint lands here.</p>
        </div>
      {:else}
        <div
          role="region"
          aria-label={heading}
          tabindex="0"
          class="max-h-80 overflow-y-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          <ul class="divide-y divide-border">
            {#each items as item (item.id)}
              <li
                class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 px-4 py-3 @sm:grid-cols-[auto_minmax(0,1fr)_auto]"
              >
                <Avatar.Root size="sm" class="row-span-2 self-start @sm:self-center">
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
                <div
                  class="col-start-2 mt-2 flex flex-wrap items-center gap-2 @sm:col-start-3 @sm:row-span-2 @sm:row-start-1 @sm:mt-0 @sm:flex-col @sm:items-end @sm:gap-1 @md:flex-row @md:items-center @md:gap-3"
                >
                  {#if item.status}
                    <Badge variant={item.statusVariant ?? "neutral"} size="sm" dot>{item.status}</Badge>
                  {/if}
                  {#if item.meta}
                    <span class="text-ui-xs text-muted-foreground @lg:w-24 @lg:text-right">{item.meta}</span>
                  {/if}
                </div>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>

    <Card.Footer>
      {#if showItems}
        <p class="text-ui-sm text-muted-foreground">{countLabel(items.length)}</p>
      {/if}
      {#if actionLabel}
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="ml-auto"
          disabled={disabled || !showItems}
          onclick={onaction}
        >
          {actionLabel}
        </Button>
      {/if}
    </Card.Footer>
  </Card.Root>
</section>
