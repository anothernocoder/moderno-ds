<script lang="ts">
  import { Alert, Badge, Button, Card, Divider, Skeleton } from "@moderno-ui/svelte";

  type DescriptionListBadge = "neutral" | "info" | "success" | "warning" | "error";

  interface DescriptionListItem {
    id: string;
    term: string;
    value: string;
    badge?: DescriptionListBadge;
    action?: string;
  }

  interface Props {
    items?: DescriptionListItem[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onaction?: (id: string) => void;
    onretry?: () => void;
  }

  const sampleItems: DescriptionListItem[] = [
    { id: "name", term: "Full name", value: "Margot Foster", action: "Change" },
    { id: "email", term: "Email", value: "margot.foster@example.com", action: "Change" },
    { id: "company", term: "Company", value: "Northwind Labs" },
    { id: "plan", term: "Plan", value: "Pro, billed yearly", action: "Change" },
    { id: "status", term: "Status", value: "Active", badge: "success" },
    { id: "since", term: "Customer since", value: "March 12, 2024" },
    {
      id: "notes",
      term: "Notes",
      value:
        "Prefers invoices in euros and a call before any plan change. Renewals go through the finance team.",
    },
  ];

  const placeholders = ["first", "second", "third", "fourth"];

  let {
    items = sampleItems,
    heading = "Customer details",
    description = "Contact and billing details for this account.",
    error,
    loading = false,
    disabled = false,
    onaction,
    onretry,
  }: Props = $props();

  const inert = $derived(loading || disabled);
  const showList = $derived(!error && !loading && items.length > 0);
</script>

<section class="@container moderno-block-description-list text-foreground">
  <div class="grid gap-4">
    <div class="grid gap-1">
      <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
      {#if description}
        <p class="text-ui-md text-muted-foreground">{description}</p>
      {/if}
    </div>

    <Divider />

    {#if error}
      <Alert.Root variant="error">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>Nothing was changed. The details are still saved.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" onclick={onretry}>Try again</Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {/if}

    {#if loading}
      <div role="status" aria-busy="true" class="grid">
        {#each placeholders as key (key)}
          <div
            aria-hidden="true"
            class="grid gap-2 py-3 first:pt-0 @md:grid-cols-3 @md:gap-4 @lg:grid-cols-4"
          >
            <Skeleton shape="text" class="w-1/3 @md:w-2/3" />
            <Skeleton shape="text" class="w-2/3 @md:col-span-2 @lg:col-span-3" />
          </div>
        {/each}
        <span class="sr-only">Loading details…</span>
      </div>
    {/if}

    {#if !error && !loading && items.length === 0}
      <Card.Root>
        <Card.Header class="items-center text-center">
          <Card.Title>No details yet</Card.Title>
          <Card.Description>Details added to this record show up here.</Card.Description>
        </Card.Header>
      </Card.Root>
    {/if}

    {#if showList}
      <dl class="divide-y divide-border">
        {#each items as item (item.id)}
          <div
            class="grid gap-1 py-3 first:pt-0 @md:grid-cols-3 @md:items-baseline @md:gap-4 @lg:grid-cols-4"
          >
            <dt class="text-ui-md text-muted-foreground">{item.term}</dt>
            <dd
              class="grid justify-items-start gap-2 text-ui-md @sm:flex @sm:items-center @sm:justify-between @sm:gap-4 @md:col-span-2 @lg:col-span-3"
            >
              {#if item.badge}
                <Badge variant={item.badge} dot>{item.value}</Badge>
              {:else}
                <span class="min-w-0 break-words">{item.value}</span>
              {/if}
              {#if item.action}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="-my-1 -ml-3 shrink-0 @sm:ml-0 @sm:-mr-3"
                  disabled={inert}
                  aria-label={`${item.action} ${item.term}`}
                  onclick={() => onaction?.(item.id)}
                >
                  {item.action}
                </Button>
              {/if}
            </dd>
          </div>
        {/each}
      </dl>
    {/if}
  </div>
</section>
