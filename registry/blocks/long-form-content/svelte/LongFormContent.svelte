<script lang="ts">
  import { Alert, Avatar, Button, Skeleton } from "@moderno-ui/svelte";

  interface LongFormFact {
    id: string;
    label: string;
    value: string;
  }

  interface LongFormSection {
    id: string;
    heading: string;
    paragraphs: string[];
  }

  interface LongFormQuote {
    text: string;
    author: string;
    role: string;
    initials: string;
    avatarUrl?: string;
  }

  interface Props {
    kicker?: string;
    heading?: string;
    lead?: string;
    facts?: LongFormFact[];
    sections?: LongFormSection[];
    quote?: LongFormQuote | null;
    action?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onaction?: () => void;
    onretry?: () => void;
  }

  const sampleFacts: LongFormFact[] = [
    { id: "client", label: "Client", value: "Northwind Studio" },
    { id: "industry", label: "Industry", value: "Architecture" },
    { id: "team", label: "Team", value: "12 people" },
    { id: "timeline", label: "Timeline", value: "Six weeks" },
  ];

  const sampleSections: LongFormSection[] = [
    {
      id: "challenge",
      heading: "The challenge",
      paragraphs: [
        "Northwind ran its books from three spreadsheets and a shared inbox. Every month-end, two people spent three days matching receipts to payments by hand.",
        "Nobody trusted the numbers until the last invoice was found, so every decision about hiring or new projects waited for the books to close.",
      ],
    },
    {
      id: "approach",
      heading: "Our approach",
      paragraphs: [
        "We moved every receipt into one inbox and let each payment find its match. Anything unclear was set aside for a person, with the likely matches listed next to it.",
        "Categories were learned from the choices the team had already made, so there were no rules to write and no new habits to learn.",
      ],
    },
    {
      id: "outcome",
      heading: "The outcome",
      paragraphs: [
        "The books now close on the first working day of the month. The team reviews a handful of items, not hundreds, and the numbers are ready when a decision is.",
      ],
    },
  ];

  const sampleQuote: LongFormQuote = {
    text: "We stopped dreading the last week of the month. The books close themselves now, and we get the afternoon back.",
    author: "Maya Lindqvist",
    role: "Operations lead, Northwind Studio",
    initials: "ML",
  };

  const factPlaceholders = ["client", "industry", "team", "timeline"];
  const sectionPlaceholders = ["first", "second"];

  let {
    kicker = "Case study",
    heading = "How Northwind closes its books in a day",
    lead = "A twelve-person architecture studio replaced three spreadsheets and a shared inbox, and got the last week of every month back.",
    facts = sampleFacts,
    sections = sampleSections,
    quote = sampleQuote,
    action = "Read the next case study",
    error,
    loading = false,
    disabled = false,
    onaction,
    onretry,
  }: Props = $props();
</script>

<section class="@container moderno-block-long-form-content text-foreground">
  <div class="px-4 py-12 @lg:py-20">
    <article class="mx-auto grid max-w-lg gap-10">
      <header class="grid max-w-md gap-3">
        {#if kicker}
          <p class="text-ui-sm font-medium text-muted-foreground">{kicker}</p>
        {/if}
        <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
        {#if lead}
          <p class="text-body text-muted-foreground @sm:text-body-lg">{lead}</p>
        {/if}
      </header>

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
        <div role="status" aria-busy="true" class="grid gap-10 @lg:grid-cols-3 @lg:gap-12">
          <span class="sr-only">Loading the case study…</span>
          <div
            aria-hidden="true"
            class="grid grid-cols-2 gap-x-6 gap-y-4 py-6 @md:grid-cols-4 @lg:grid-cols-1 @lg:self-start"
          >
            {#each factPlaceholders as key (key)}
              <Skeleton shape="text" class="w-2/3" />
            {/each}
          </div>
          <div aria-hidden="true" class="grid gap-8 @lg:col-span-2">
            {#each sectionPlaceholders as key (key)}
              <div class="grid gap-3">
                <Skeleton shape="text" class="w-1/2" />
                <Skeleton shape="text" class="w-full" />
                <Skeleton shape="text" class="w-full" />
                <Skeleton shape="text" class="w-2/3" />
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <div class="grid gap-10 @lg:grid-cols-3 @lg:gap-12">
          {#if facts.length > 0}
            <dl
              class="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-6 @md:grid-cols-4 @lg:grid-cols-1 @lg:self-start @lg:border-b-0"
            >
              {#each facts as fact (fact.id)}
                <div class="grid gap-1">
                  <dt class="text-ui-sm text-muted-foreground">{fact.label}</dt>
                  <dd class="text-ui-md font-medium">{fact.value}</dd>
                </div>
              {/each}
            </dl>
          {/if}

          <div class="grid gap-8 @lg:col-span-2">
            {#if sections.length === 0}
              <p
                class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
              >
                This case study has no story yet.
              </p>
            {:else}
              {#each sections as section, index (section.id)}
                <div class="grid gap-3">
                  <h3 class="text-body font-semibold">{section.heading}</h3>
                  {#each section.paragraphs as paragraph (paragraph)}
                    <p class="text-body text-muted-foreground">{paragraph}</p>
                  {/each}
                </div>
                {#if index === 0 && quote}
                  <figure class="grid gap-4 border-l-2 border-primary pl-4 @sm:pl-6">
                    <blockquote class="font-serif text-body-lg text-balance @md:text-heading-sm">
                      <p>{quote.text}</p>
                    </blockquote>
                    <figcaption class="flex items-center gap-3">
                      <Avatar.Root>
                        <Avatar.Fallback>{quote.initials}</Avatar.Fallback>
                        {#if quote.avatarUrl}
                          <Avatar.Image src={quote.avatarUrl} alt="" />
                        {/if}
                      </Avatar.Root>
                      <div class="grid min-w-0 gap-0.5">
                        <p class="text-ui-md font-semibold">{quote.author}</p>
                        <p class="text-ui-sm text-muted-foreground">{quote.role}</p>
                      </div>
                    </figcaption>
                  </figure>
                {/if}
              {/each}
            {/if}

            {#if sections.length > 0 && action}
              <div>
                <Button type="button" variant="outline" {disabled} onclick={onaction}>{action}</Button>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </article>
  </div>
</section>
