<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import { Alert, Button, Divider, Field, RadioGroup, Switch } from "@moderno-ui/svelte";

  type CheckoutStep = "shipping" | "payment";

  interface DeliveryOption {
    id: string;
    label: string;
    description: string;
    price: string;
  }

  interface CheckoutField {
    name: string;
    label: string;
    autocomplete: HTMLInputAttributes["autocomplete"];
    placeholder: string;
    type?: "email" | "text";
    inputmode?: HTMLInputAttributes["inputmode"];
    wide?: boolean;
  }

  interface Props {
    step?: CheckoutStep;
    heading?: string;
    description?: string;
    headingLevel?: 1 | 2;
    deliveryOptions?: DeliveryOption[];
    error?: string;
    errors?: Record<string, string>;
    loading?: boolean;
    disabled?: boolean;
    onsubmit?: (event: SubmitEvent) => void;
    onback?: () => void;
  }

  const contactFields: CheckoutField[] = [
    {
      name: "email",
      label: "Email",
      autocomplete: "email",
      placeholder: "you@example.com",
      type: "email",
      wide: true,
    },
  ];

  const addressFields: CheckoutField[] = [
    {
      name: "fullName",
      label: "Full name",
      autocomplete: "name",
      placeholder: "Ada Lovelace",
      wide: true,
    },
    {
      name: "address",
      label: "Address",
      autocomplete: "street-address",
      placeholder: "100 Market Street",
      wide: true,
    },
    { name: "city", label: "City", autocomplete: "address-level2", placeholder: "San Francisco" },
    { name: "region", label: "State / Province", autocomplete: "address-level1", placeholder: "CA" },
    { name: "postalCode", label: "Postal code", autocomplete: "postal-code", placeholder: "94103" },
    { name: "country", label: "Country", autocomplete: "country-name", placeholder: "United States" },
  ];

  const cardFields: CheckoutField[] = [
    {
      name: "cardName",
      label: "Name on card",
      autocomplete: "cc-name",
      placeholder: "Ada Lovelace",
      wide: true,
    },
    {
      name: "cardNumber",
      label: "Card number",
      autocomplete: "cc-number",
      placeholder: "1234 1234 1234 1234",
      inputmode: "numeric",
      wide: true,
    },
    { name: "expiry", label: "Expiry", autocomplete: "cc-exp", placeholder: "MM / YY" },
    {
      name: "cvc",
      label: "CVC",
      autocomplete: "cc-csc",
      placeholder: "123",
      inputmode: "numeric",
    },
  ];

  const sampleDeliveryOptions: DeliveryOption[] = [
    { id: "standard", label: "Standard", description: "4–10 business days", price: "$5.00" },
    { id: "express", label: "Express", description: "2–5 business days", price: "$16.00" },
  ];

  const copy = {
    shipping: {
      heading: "Shipping details",
      description: "Where should we send your order? You can review everything before you pay.",
      back: "Back to cart",
      submit: "Continue to payment",
      busy: "Saving",
    },
    payment: {
      heading: "Payment",
      description: "Your card is charged only once your order ships.",
      back: "Back to shipping",
      submit: "Place order",
      busy: "Placing order",
    },
  };

  let {
    step = "shipping",
    heading,
    description,
    headingLevel = 2,
    deliveryOptions = sampleDeliveryOptions,
    error,
    errors,
    loading = false,
    disabled = false,
    onsubmit,
    onback,
  }: Props = $props();

  const uid = $props.id();
  const text = $derived(copy[step]);
  const intro = $derived(description ?? text.description);
  const inert = $derived(loading || disabled);
</script>

{#snippet fields(list: CheckoutField[])}
  {#each list as field (field.name)}
    <Field.Root
      class={field.wide ? "@sm:col-span-2" : undefined}
      required
      invalid={Boolean(errors?.[field.name])}
      disabled={inert}
    >
      <Field.Label>{field.label}</Field.Label>
      <Field.Input
        name={field.name}
        type={field.type ?? "text"}
        inputmode={field.inputmode}
        autocomplete={field.autocomplete}
        placeholder={field.placeholder}
      />
      <Field.ErrorText>{errors?.[field.name]}</Field.ErrorText>
    </Field.Root>
  {/each}
{/snippet}

{#snippet group(id: string, title: string, summary: string, content: Snippet)}
  <div role="group" aria-labelledby="{uid}-{id}" class="grid gap-6 @lg:grid-cols-3">
    <div class="grid content-start gap-1">
      <svelte:element
        this={headingLevel === 1 ? "h2" : "h3"}
        id="{uid}-{id}"
        class="text-ui-md font-medium"
      >
        {title}
      </svelte:element>
      <p class="text-ui-sm text-muted-foreground">{summary}</p>
    </div>
    {@render content()}
  </div>
{/snippet}

{#snippet contactContent()}
  <div class="grid gap-5 @sm:grid-cols-2 @lg:col-span-2">
    {@render fields(contactFields)}
  </div>
{/snippet}

{#snippet addressContent()}
  <div class="grid gap-5 @sm:grid-cols-2 @lg:col-span-2">
    {@render fields(addressFields)}
  </div>
{/snippet}

{#snippet deliveryContent()}
  <RadioGroup.Root
    name="delivery"
    defaultValue={deliveryOptions[0]!.id}
    disabled={inert}
    class="@lg:col-span-2"
  >
    <RadioGroup.Label class="sr-only">Delivery method</RadioGroup.Label>
    <div class="grid gap-3 @md:grid-cols-2">
      {#each deliveryOptions as option (option.id)}
        <RadioGroup.Item
          value={option.id}
          class="rounded-lg border border-border p-4 transition-colors hover:border-muted-foreground data-[state=checked]:border-primary"
        >
          <RadioGroup.ItemControl />
          <RadioGroup.ItemText class="grid gap-1">
            <span class="font-medium">{option.label}</span>
            <RadioGroup.ItemDescription>{option.description}</RadioGroup.ItemDescription>
            <span class="font-medium">{option.price}</span>
          </RadioGroup.ItemText>
          <RadioGroup.ItemHiddenInput />
        </RadioGroup.Item>
      {/each}
    </div>
  </RadioGroup.Root>
{/snippet}

{#snippet cardContent()}
  <div class="grid gap-5 @sm:grid-cols-2 @lg:col-span-2">
    {@render fields(cardFields)}
    <Switch.Root name="saveCard" disabled={inert} class="@sm:col-span-2">
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>Save this card for next time</Switch.Label>
      <Switch.HiddenInput />
    </Switch.Root>
  </div>
{/snippet}

<section class="@container moderno-block-checkout-form text-foreground">
  <div class="grid gap-10 px-4 py-12 @lg:py-16">
    <div class="mx-auto grid max-w-md gap-3 text-center">
      <svelte:element
        this={headingLevel === 1 ? "h1" : "h2"}
        class="font-serif text-heading-sm text-balance @md:text-heading"
      >
        {heading ?? text.heading}
      </svelte:element>
      {#if intro}
        <p class="text-body text-muted-foreground">{intro}</p>
      {/if}
    </div>

    <form
      class="mx-auto grid w-full max-w-lg gap-8 rounded-lg border border-border p-4 @sm:p-6"
      {onsubmit}
      novalidate
    >
      {#if error}
        <Alert.Root variant="error" size="sm">
          <Alert.Content>
            <Alert.Title>{error}</Alert.Title>
            <Alert.Description>Nothing you entered is lost. Check it and try again.</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      {/if}

      {#if step === "shipping"}
        {@render group("contact", "Contact", "We send your receipt and tracking here.", contactContent)}
        <Divider />
        {@render group("address", "Shipping address", "Where the parcel goes.", addressContent)}
        {#if deliveryOptions.length > 0}
          <Divider />
          {@render group("delivery", "Delivery method", "How fast it gets to you.", deliveryContent)}
        {/if}
      {:else}
        {@render group("card", "Card details", "Credit or debit card.", cardContent)}
      {/if}

      <Divider />

      <div class="flex flex-col-reverse gap-3 @sm:flex-row @sm:items-center @sm:justify-between">
        <Button type="button" variant="outline" disabled={inert} onclick={onback}>
          {text.back}
        </Button>
        <Button type="submit" disabled={inert} aria-busy={loading}>
          {#if loading}
            <span
              aria-hidden="true"
              class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
            ></span>
            {text.busy}
          {:else}
            {text.submit}
          {/if}
        </Button>
      </div>
    </form>
  </div>
</section>
