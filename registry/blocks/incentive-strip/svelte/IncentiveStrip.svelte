<script lang="ts">
  import { Alert, Button, Skeleton } from "@moderno-ui/svelte";

  type IncentiveStripIcon = "truck" | "returns" | "shield" | "gift";

  interface IncentiveStripLink {
    label: string;
    href: string;
  }

  interface IncentiveStripItem {
    id: string;
    icon: IncentiveStripIcon;
    title: string;
    description: string;
    link?: IncentiveStripLink;
  }

  interface Props {
    heading?: string;
    description?: string;
    incentives?: IncentiveStripItem[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onretry?: () => void;
  }

  const iconPaths: Record<IncentiveStripIcon, string[]> = {
    truck: [
      "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",
      "M15 18H9",
      "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",
      "M19 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
      "M9 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
    ],
    returns: ["M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", "M3 3v5h5"],
    shield: [
      "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z",
      "m9 12 2 2 4-4",
    ],
    gift: [
      "M4 8h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z",
      "M12 8v13",
      "M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",
      "M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",
    ],
  };

  const sampleIncentives: IncentiveStripItem[] = [
    {
      id: "shipping",
      icon: "truck",
      title: "Free shipping",
      description: "On every order over €50, at your door in two to four days.",
      link: { label: "Shipping rates", href: "#" },
    },
    {
      id: "returns",
      icon: "returns",
      title: "30-day returns",
      description: "Changed your mind? Send it back within a month, on us.",
      link: { label: "Returns policy", href: "#" },
    },
    {
      id: "payment",
      icon: "shield",
      title: "Secure payment",
      description: "Card details are encrypted and never stored on our servers.",
      link: { label: "How we keep it safe", href: "#" },
    },
    {
      id: "gift",
      icon: "gift",
      title: "Gift wrapping",
      description: "Add recycled paper and a handwritten note at checkout.",
    },
  ];

  const placeholders = ["first", "second", "third", "fourth"];

  let {
    heading = "Shop with confidence",
    description = "Every order is covered, from the moment you pay to the day it arrives.",
    incentives = sampleIncentives,
    error,
    loading = false,
    disabled = false,
    onretry,
  }: Props = $props();
</script>

<section class="@container moderno-block-incentive-strip text-foreground">
  <div class="mx-auto grid w-full max-w-lg gap-8 px-4 py-12 @lg:py-16">
    <div class="grid max-w-md gap-2">
      <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
      {#if description}
        <p class="text-body text-pretty text-muted-foreground">{description}</p>
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
      <div role="status" aria-busy="true" class="grid gap-8 @sm:grid-cols-2 @lg:grid-cols-4">
        <span class="sr-only">Loading incentives…</span>
        {#each placeholders as key (key)}
          <div aria-hidden="true" class="flex gap-4 @sm:flex-col @sm:gap-3">
            <Skeleton shape="rect" class="size-10 shrink-0" />
            <div class="grid flex-1 content-start gap-2">
              <Skeleton shape="text" class="w-2/3" />
              <Skeleton shape="text" class="w-full" />
            </div>
          </div>
        {/each}
      </div>
    {:else if incentives.length === 0}
      <p
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        No incentives to show yet.
      </p>
    {:else}
      <ul class="grid gap-8 @sm:grid-cols-2 @lg:grid-cols-4">
        {#each incentives as incentive (incentive.id)}
          <li class="flex gap-4 @sm:flex-col @sm:gap-3">
            <div
              class="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-muted text-foreground"
            >
              <svg
                class="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                {#each iconPaths[incentive.icon] as d (d)}
                  <path {d} />
                {/each}
              </svg>
            </div>
            <div class="grid min-w-0 content-start gap-1">
              <h3 class="text-body font-semibold">{incentive.title}</h3>
              <p class="text-ui-md text-pretty text-muted-foreground">{incentive.description}</p>
              {#if incentive.link}
                <a
                  class="mt-1 justify-self-start rounded-sm text-ui-md font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                  href={disabled ? undefined : incentive.link.href}
                  role={disabled ? "link" : undefined}
                  aria-disabled={disabled || undefined}>{incentive.link.label}</a
                >
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>
