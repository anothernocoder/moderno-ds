<script lang="ts">
  import { Alert, Avatar, Button, Indicator, Skeleton } from "@moderno-ui/svelte";

  interface PortfolioLink {
    id: string;
    label: string;
    href: string;
  }

  interface Props {
    name?: string;
    role?: string;
    bio?: string;
    initials?: string;
    avatarUrl?: string;
    availability?: string;
    links?: PortfolioLink[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onretry?: () => void;
  }

  const sampleLinks: PortfolioLink[] = [
    { id: "email", label: "Email", href: "#" },
    { id: "linkedin", label: "LinkedIn", href: "#" },
    { id: "dribbble", label: "Dribbble", href: "#" },
    { id: "cv", label: "CV", href: "#" },
  ];

  let {
    name = "Lena Ortiz",
    role = "Product designer in Lisbon",
    bio = "I design calm, useful software for small teams, from the first sketch to the shipped product. Ten years in, I still love the details.",
    initials = "LO",
    avatarUrl,
    availability = "Available for new projects",
    links = sampleLinks,
    error,
    loading = false,
    disabled = false,
    onretry,
  }: Props = $props();

  const hasAvatar = $derived(Boolean(initials || avatarUrl));
</script>

<section class="@container moderno-block-portfolio-header text-foreground">
  <div class="px-4 py-12 @lg:py-20">
    {#if error}
      <Alert.Root variant="error" class="mx-auto w-full max-w-md">
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
      <div
        role="status"
        aria-busy="true"
        class="mx-auto flex max-w-lg flex-col gap-6 @md:flex-row @md:gap-8"
      >
        <span class="sr-only">Loading the profile…</span>
        <Skeleton aria-hidden="true" shape="circle" class="w-12 self-start" />
        <div aria-hidden="true" class="grid flex-1 gap-6 @lg:gap-8">
          <Skeleton shape="text" class="w-48" />
          <div class="grid gap-3">
            <Skeleton shape="text" class="h-8 w-2/3 @md:h-10" />
            <Skeleton shape="text" class="w-1/2" />
            <Skeleton shape="text" class="w-full" />
            <Skeleton shape="text" class="w-3/4" />
          </div>
          <div class="flex gap-6">
            <Skeleton shape="text" class="w-12" />
            <Skeleton shape="text" class="w-16" />
            <Skeleton shape="text" class="w-16" />
          </div>
        </div>
      </div>
    {:else}
      <header class="mx-auto flex w-fit max-w-lg flex-col gap-6 @md:flex-row @md:gap-8">
        {#if hasAvatar}
          <Avatar.Root size="lg">
            <Avatar.Fallback>{initials}</Avatar.Fallback>
            {#if avatarUrl}
              <Avatar.Image src={avatarUrl} alt="" />
            {/if}
          </Avatar.Root>
        {/if}

        <div class="grid min-w-0 flex-1 gap-6 @lg:gap-8">
          {#if availability}
            <Indicator variant="success" class="justify-self-start">{availability}</Indicator>
          {/if}

          <div class="grid gap-3">
            <h1 class="font-serif text-heading text-balance @md:text-heading-lg">{name}</h1>
            {#if role}
              <p class="text-body font-medium @sm:text-body-lg">{role}</p>
            {/if}
            {#if bio}
              <p class="text-body text-pretty text-muted-foreground @sm:text-body-lg">{bio}</p>
            {/if}
          </div>

          {#if links.length > 0}
            <nav aria-label="Links">
              <ul class="flex flex-wrap gap-x-6 gap-y-2">
                {#each links as link (link.id)}
                  <li>
                    <a
                      class="rounded-sm text-ui-md font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                      href={disabled ? undefined : link.href}
                      role={disabled ? "link" : undefined}
                      aria-disabled={disabled || undefined}>{link.label}</a
                    >
                  </li>
                {/each}
              </ul>
            </nav>
          {/if}
        </div>
      </header>
    {/if}
  </div>
</section>
