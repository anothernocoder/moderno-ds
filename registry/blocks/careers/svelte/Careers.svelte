<script lang="ts">
  import { Alert, Badge, Button, Skeleton } from "@moderno-ui/svelte";

  interface CareersRole {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    href: string;
  }

  interface Props {
    heading?: string;
    description?: string;
    roles?: CareersRole[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onretry?: () => void;
  }

  const sampleRoles: CareersRole[] = [
    {
      id: "product-designer",
      title: "Senior Product Designer",
      department: "Design",
      location: "Remote, Europe",
      type: "Full-time",
      href: "#",
    },
    {
      id: "frontend-engineer",
      title: "Staff Frontend Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      href: "#",
    },
    {
      id: "payments-engineer",
      title: "Backend Engineer, Payments",
      department: "Engineering",
      location: "Stockholm",
      type: "Full-time",
      href: "#",
    },
    {
      id: "customer-success",
      title: "Customer Success Lead",
      department: "Support",
      location: "Remote, Americas",
      type: "Full-time",
      href: "#",
    },
    {
      id: "content-marketer",
      title: "Content Marketer",
      department: "Marketing",
      location: "Remote",
      type: "Part-time",
      href: "#",
    },
  ];

  const placeholders = ["first", "second", "third"];

  let {
    heading = "Come build with us",
    description = "We are a small team making money simple for small businesses. Every role below is open now.",
    roles = sampleRoles,
    error,
    loading = false,
    disabled = false,
    onretry,
  }: Props = $props();
</script>

<section class="@container moderno-block-careers text-foreground">
  <div class="grid gap-10 px-4 py-12 @lg:py-16">
    <div class="mx-auto grid max-w-md gap-3 text-center">
      <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
      {#if description}
        <p class="text-body text-muted-foreground">{description}</p>
      {/if}
    </div>

    {#if error}
      <Alert.Root variant="error" class="mx-auto w-full max-w-lg">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>The roles are still open. Try again in a moment.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {:else if loading}
      <div
        role="status"
        aria-busy="true"
        class="mx-auto grid w-full max-w-lg divide-y divide-border border-y border-border"
      >
        <span class="sr-only">Loading open roles…</span>
        {#each placeholders as key (key)}
          <div aria-hidden="true" class="grid gap-2 py-4">
            <Skeleton shape="text" class="w-1/2" />
            <Skeleton shape="text" class="w-1/3" />
          </div>
        {/each}
      </div>
    {:else if roles.length === 0}
      <p
        class="mx-auto w-full max-w-lg rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        No open roles right now. Check back soon.
      </p>
    {:else}
      <ul class="mx-auto w-full max-w-lg divide-y divide-border border-y border-border">
        {#each roles as role (role.id)}
          <li
            class="grid gap-3 py-4 @sm:grid-cols-[minmax(0,1fr)_auto] @sm:items-center @sm:gap-6"
          >
            <div class="grid min-w-0 gap-2">
              <h3 class="text-body font-semibold">{role.title}</h3>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Badge variant="outline" size="sm">{role.department}</Badge>
                <span class="text-ui-sm text-muted-foreground">{role.location} · {role.type}</span>
              </div>
            </div>
            <a
              class="inline-flex items-center gap-1 justify-self-start rounded-sm text-ui-md font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline @sm:justify-self-end"
              href={disabled ? undefined : role.href}
              role={disabled ? "link" : undefined}
              aria-disabled={disabled || undefined}
              aria-label="Apply for {role.title}"
            >
              Apply
              <svg
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>
