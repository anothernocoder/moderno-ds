<script lang="ts">
  import { Accordion, Alert, Button, Skeleton } from "@moderno-ui/svelte";

  interface FaqItem {
    id: string;
    question: string;
    answer: string;
  }

  interface Props {
    heading?: string;
    description?: string;
    items?: FaqItem[];
    contactText?: string;
    contactLabel?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    oncontact?: () => void;
    onretry?: () => void;
  }

  const sampleItems: FaqItem[] = [
    {
      id: "trial",
      question: "Is there a free trial?",
      answer:
        "Yes. Every plan starts with 14 days free, and you add a card only when you decide to stay.",
    },
    {
      id: "cancel",
      question: "Can I cancel at any time?",
      answer:
        "Yes. Cancel from your account settings and you keep access until the end of the billing period.",
    },
    {
      id: "currencies",
      question: "Which currencies can I invoice in?",
      answer:
        "More than 30. Your clients pay in their currency, and the money arrives in the currency of your account.",
    },
    {
      id: "accountant",
      question: "Can I invite my accountant?",
      answer: "Yes. Invite them as a member who can read your invoices, receipts and reports.",
    },
    {
      id: "data",
      question: "Where is my data stored?",
      answer: "In data centres in the European Union, encrypted at rest and in transit.",
    },
  ];

  const placeholders = ["first", "second", "third", "fourth", "fifth"];

  let {
    heading = "Frequently asked questions",
    description = "Answers to the questions we hear most about plans, billing and your account.",
    items = sampleItems,
    contactText = "Still have questions? We answer within one working day.",
    contactLabel = "Contact support",
    error,
    loading = false,
    disabled = false,
    oncontact,
    onretry,
  }: Props = $props();
</script>

<section class="@container moderno-block-faq text-foreground">
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
          <Alert.Description>The answers are still here. Try again in a moment.</Alert.Description>
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
        <span class="sr-only">Loading questions…</span>
        {#each placeholders as key (key)}
          <div aria-hidden="true" class="py-4">
            <Skeleton shape="text" class="w-2/3" />
          </div>
        {/each}
      </div>
    {:else if items.length === 0}
      <p
        class="mx-auto w-full max-w-lg rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        No questions here yet.
      </p>
    {:else}
      <Accordion.Root collapsible {disabled} class="mx-auto max-w-lg border-y border-border">
        {#each items as item (item.id)}
          <Accordion.Item value={item.id}>
            <h3>
              <Accordion.ItemTrigger>
                {item.question}
                <Accordion.ItemIndicator>
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
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Accordion.ItemIndicator>
              </Accordion.ItemTrigger>
            </h3>
            <Accordion.ItemContent class="text-muted-foreground">
              {item.answer}
            </Accordion.ItemContent>
          </Accordion.Item>
        {/each}
      </Accordion.Root>
    {/if}

    {#if contactLabel}
      <div
        class="mx-auto grid w-full max-w-lg justify-items-center gap-3 rounded-lg border border-border p-4 text-center @sm:flex @sm:items-center @sm:justify-between @sm:gap-6 @sm:text-start"
      >
        <p class="text-ui-md text-muted-foreground">{contactText}</p>
        <Button type="button" variant="outline" size="sm" {disabled} onclick={oncontact}>
          {contactLabel}
        </Button>
      </div>
    {/if}
  </div>
</section>
