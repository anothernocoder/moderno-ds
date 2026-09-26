<script lang="ts">
  import { Alert, Button, Skeleton } from "@moderno-ui/svelte";

  interface StatStripStat {
    id: string;
    value: string;
    label: string;
  }

  interface Props {
    heading?: string;
    description?: string;
    actionLabel?: string;
    stats?: StatStripStat[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onaction?: () => void;
    onretry?: () => void;
  }

  const sampleStats: StatStripStat[] = [
    { id: "invoiced", value: "$2.4B", label: "Invoiced by our customers" },
    { id: "teams", value: "12,000+", label: "Finance teams on board" },
    { id: "close", value: "3 days", label: "Saved on every month-end close" },
    { id: "uptime", value: "99.99%", label: "Uptime over the last year" },
  ];

  const placeholders = ["first", "second", "third", "fourth"];

  let {
    heading = "The numbers behind a calmer close",
    description = "Finance teams of every size run their books on one workspace.",
    actionLabel = "Read the customer report",
    stats = sampleStats,
    error,
    loading = false,
    disabled = false,
    onaction,
    onretry,
  }: Props = $props();
</script>

<section class="@container moderno-block-stat-strip text-foreground">
  <div class="mx-auto grid w-full max-w-lg gap-8 px-4 py-12 @lg:py-16">
    <div class="grid gap-4 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6">
      <div class="grid max-w-md gap-2">
        <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
        {#if description}
          <p class="text-body text-pretty text-muted-foreground">{description}</p>
        {/if}
      </div>
      {#if actionLabel}
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="justify-self-start @sm:shrink-0"
          {disabled}
          onclick={onaction}
        >
          {actionLabel}
        </Button>
      {/if}
    </div>

    {#if error}
      <Alert.Root variant="error">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>
            The rest of the page still works. Try again in a moment.
          </Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {:else if loading}
      <div role="status" aria-busy="true" class="grid grid-cols-2 gap-x-6 gap-y-8 @lg:grid-cols-4">
        <span class="sr-only">Loading stats…</span>
        {#each placeholders as key (key)}
          <div aria-hidden="true" class="grid gap-2 border-t border-border pt-4">
            <Skeleton shape="text" class="h-8 w-2/3 @md:h-10" />
            <Skeleton shape="text" class="w-3/4" />
          </div>
        {/each}
      </div>
    {:else if stats.length === 0}
      <p
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        No numbers to show yet.
      </p>
    {:else}
      <dl class="grid grid-cols-2 gap-x-6 gap-y-8 @lg:grid-cols-4">
        {#each stats as stat (stat.id)}
          <div class="grid content-start gap-1 border-t border-border pt-4">
            <dt class="row-start-2 text-ui-sm text-pretty text-muted-foreground">{stat.label}</dt>
            <dd class="row-start-1 font-serif text-heading tabular-nums @md:text-heading-lg">
              {stat.value}
            </dd>
          </div>
        {/each}
      </dl>
    {/if}
  </div>
</section>
