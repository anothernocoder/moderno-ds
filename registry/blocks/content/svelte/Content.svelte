<script lang="ts">
  import { Alert, Button, Skeleton } from "@moderno-ui/svelte";

  interface ContentSection {
    id: string;
    heading: string;
    paragraphs: string[];
  }

  interface ContentQuote {
    text: string;
    author: string;
  }

  interface Props {
    kicker?: string;
    heading?: string;
    lead?: string;
    sections?: ContentSection[];
    quote?: ContentQuote | null;
    action?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onaction?: () => void;
    onretry?: () => void;
  }

  const sampleSections: ContentSection[] = [
    {
      id: "inbox",
      heading: "Start with one inbox",
      paragraphs: [
        "Forward every receipt and invoice to a single address. Each one is read, dated and filed against the payment it belongs to, so nothing waits in a folder on someone's desk.",
        "When a match is unclear, it is set aside for a person to confirm, with the likely payments already listed next to it.",
      ],
    },
    {
      id: "books",
      heading: "Let the books keep themselves",
      paragraphs: [
        "Categories are learned from the choices you have already made. After a few weeks most payments arrive sorted, and the rest take one click.",
        "At the end of the month there is nothing left to chase. You review the few items that need a person, and the books are closed.",
      ],
    },
  ];

  const sampleQuote: ContentQuote = {
    text: "Month-end used to take us three days. Now it is one afternoon, and most of it is coffee.",
    author: "Finance lead at a twelve-person studio",
  };

  const placeholders = ["first", "second"];

  let {
    kicker = "Field notes",
    heading = "Close the month without the spreadsheet",
    lead = "Most small teams lose the last days of every month to chasing receipts and matching payments by hand. It does not have to work that way.",
    sections = sampleSections,
    quote = sampleQuote,
    action = "Read the full guide",
    error,
    loading = false,
    disabled = false,
    onaction,
    onretry,
  }: Props = $props();

  const showArticle = $derived(!error && !loading && sections.length > 0);
</script>

<section class="@container moderno-block-content text-foreground">
  <div class="px-4 py-12 @lg:py-16">
    <article class="mx-auto grid max-w-md gap-8">
      <header class="grid gap-3">
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
        <div role="status" aria-busy="true" class="grid gap-8">
          <span class="sr-only">Loading the article…</span>
          {#each placeholders as key (key)}
            <div aria-hidden="true" class="grid gap-3">
              <Skeleton shape="text" class="w-1/2" />
              <Skeleton shape="text" class="w-full" />
              <Skeleton shape="text" class="w-full" />
              <Skeleton shape="text" class="w-2/3" />
            </div>
          {/each}
        </div>
      {:else if sections.length === 0}
        <p
          class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
        >
          Nothing to read here yet.
        </p>
      {:else}
        <div class="grid gap-8">
          {#each sections as section (section.id)}
            <div class="grid gap-3">
              <h3 class="text-body font-semibold">{section.heading}</h3>
              {#each section.paragraphs as paragraph (paragraph)}
                <p class="text-body text-muted-foreground">{paragraph}</p>
              {/each}
            </div>
          {/each}
          {#if quote}
            <figure class="grid gap-3 border-l-2 border-border pl-4 @sm:pl-6">
              <blockquote class="font-serif text-body-lg">{quote.text}</blockquote>
              <figcaption class="text-ui-md text-muted-foreground">{quote.author}</figcaption>
            </figure>
          {/if}
        </div>
      {/if}

      {#if showArticle && action}
        <div>
          <Button type="button" variant="outline" {disabled} onclick={onaction}>{action}</Button>
        </div>
      {/if}
    </article>
  </div>
</section>
