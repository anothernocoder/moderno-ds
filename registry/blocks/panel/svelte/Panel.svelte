<script lang="ts">
  import { Alert, Button, Card, Skeleton } from "@moderno-ui/svelte";

  interface PanelItem {
    id: string;
    title: string;
    description: string;
    actionLabel?: string;
  }

  interface Props {
    panels?: PanelItem[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onaction?: (id: string) => void;
    onretry?: () => void;
  }

  const samplePanels: PanelItem[] = [
    {
      id: "profile",
      title: "Profile",
      description: "Your name, photo and the bio other people see.",
      actionLabel: "Edit profile",
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Which updates reach you by email and which stay in the app.",
      actionLabel: "Manage notifications",
    },
    {
      id: "billing",
      title: "Billing",
      description: "Your plan, your payment method and every past invoice.",
      actionLabel: "View billing",
    },
    {
      id: "security",
      title: "Security",
      description: "Two-step verification and the devices signed in to your account.",
      actionLabel: "Review security",
    },
  ];

  const placeholders = ["first", "second", "third", "fourth"];

  let {
    panels = samplePanels,
    heading = "Account settings",
    description = "Related options, grouped so each one is easy to find.",
    error,
    loading = false,
    disabled = false,
    onaction,
    onretry,
  }: Props = $props();
</script>

<section class="@container moderno-block-panel text-foreground">
  <div class="grid gap-4 @lg:gap-6">
    <div class="grid gap-1">
      <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
      {#if description}
        <p class="text-ui-md text-muted-foreground">{description}</p>
      {/if}
    </div>

    {#if error}
      <Alert.Root variant="error">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>Your settings are safe; only this view failed to load.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {:else if loading}
      <div role="status" aria-busy="true" class="grid gap-3 @md:grid-cols-2 @lg:gap-4">
        <span class="sr-only">Loading settings…</span>
        {#each placeholders as key (key)}
          <Card.Root aria-hidden="true">
            <Card.Header class="gap-2">
              <Skeleton shape="text" class="w-1/3" />
              <Skeleton shape="text" />
              <Skeleton shape="text" class="w-2/3" />
            </Card.Header>
            <Card.Footer>
              <Skeleton shape="rect" class="h-8 w-full @sm:w-32" />
            </Card.Footer>
          </Card.Root>
        {/each}
      </div>
    {:else if panels.length === 0}
      <Card.Root>
        <Card.Header class="items-center text-center">
          <Card.Title>Nothing to set up yet</Card.Title>
          <Card.Description>Settings appear here once there is something to change.</Card.Description>
        </Card.Header>
      </Card.Root>
    {:else}
      <ul class="grid gap-3 @md:grid-cols-2 @lg:gap-4">
        {#each panels as panel (panel.id)}
          <li class="flex">
            <Card.Root>
              <Card.Header>
                <Card.Title>{panel.title}</Card.Title>
                <Card.Description>{panel.description}</Card.Description>
              </Card.Header>
              {#if panel.actionLabel}
                <Card.Footer class="mt-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    class="w-full @sm:w-auto"
                    {disabled}
                    onclick={() => onaction?.(panel.id)}
                  >
                    {panel.actionLabel}
                  </Button>
                </Card.Footer>
              {/if}
            </Card.Root>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>
