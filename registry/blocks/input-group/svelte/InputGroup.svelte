<script lang="ts">
  import { Button, Field, Spinner } from "@moderno-ui/svelte";

  type InputGroupField = "website" | "price" | "query";

  interface Props {
    website?: string;
    price?: string;
    apiKey?: string;
    query?: string;
    errors?: Partial<Record<InputGroupField, string>>;
    loading?: boolean;
    disabled?: boolean;
    oncopy?: (apiKey: string) => void;
    onsearch?: (query: string) => void;
  }

  let {
    website = "acme.shop",
    price = "49.00",
    apiKey = "mdn_pub_5c1e8a93d0b74f2a",
    query = "",
    errors,
    loading = false,
    disabled = false,
    oncopy,
    onsearch,
  }: Props = $props();

  const inert = $derived(loading || disabled);

  function handleSearch(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    onsearch?.(String(new FormData(event.currentTarget).get("query") ?? ""));
  }
</script>

<section class="@container moderno-block-input-group text-foreground">
  <div class="grid gap-6 @sm:gap-8 @lg:grid-cols-3">
    <header class="grid content-start gap-1">
      <h2 class="text-body-lg font-semibold @md:text-heading-sm">Storefront</h2>
      <p class="text-ui-md text-muted-foreground">
        Where customers find your shop, what they pay, and how your apps connect.
      </p>
    </header>

    <div class="grid gap-5 @sm:gap-6 @md:grid-cols-2 @lg:col-span-2">
      <Field.Root invalid={Boolean(errors?.website)} disabled={inert}>
        <Field.Label>Store address</Field.Label>
        <div class="flex">
          <span class="flex shrink-0 items-center rounded-s-lg border border-e-0 border-input bg-muted px-3 text-ui-md text-muted-foreground in-data-invalid:border-destructive">https://</span>
          <Field.Input
            name="website"
            inputmode="url"
            autocomplete="url"
            placeholder="your-shop.com"
            value={website}
            class="min-w-0 flex-1 rounded-s-none"
          />
        </div>
        <Field.HelperText>Your own domain, or the one we gave you.</Field.HelperText>
        <Field.ErrorText>{errors?.website}</Field.ErrorText>
      </Field.Root>

      <Field.Root invalid={Boolean(errors?.price)} disabled={inert}>
        <Field.Label>Price</Field.Label>
        <div class="flex">
          <span class="flex shrink-0 items-center rounded-s-lg border border-e-0 border-input bg-muted px-3 text-ui-md text-muted-foreground in-data-invalid:border-destructive">$</span>
          <Field.Input
            name="price"
            inputmode="decimal"
            placeholder="0.00"
            value={price}
            class="min-w-0 flex-1 rounded-none"
          />
          <span class="flex shrink-0 items-center rounded-e-lg border border-s-0 border-input bg-muted px-3 text-ui-md text-muted-foreground in-data-invalid:border-destructive">USD</span>
        </div>
        <Field.HelperText>Before tax.</Field.HelperText>
        <Field.ErrorText>{errors?.price}</Field.ErrorText>
      </Field.Root>

      <Field.Root readOnly disabled={inert}>
        <Field.Label>API key</Field.Label>
        <div class="flex">
          <Field.Input
            name="apiKey"
            placeholder="No key yet"
            value={apiKey}
            class="min-w-0 flex-1 rounded-e-none font-mono"
          />
          <Button
            type="button"
            variant="outline"
            aria-label="Copy API key"
            class="shrink-0 rounded-s-none border-s-0"
            disabled={inert || !apiKey}
            onclick={() => oncopy?.(apiKey)}
          >
            Copy
          </Button>
        </div>
        <Field.HelperText>Anyone with this key can read your catalogue.</Field.HelperText>
      </Field.Root>

      <form role="search" class="grid" onsubmit={handleSearch} novalidate>
        <Field.Root invalid={Boolean(errors?.query)} disabled={inert}>
          <Field.Label>Find a product</Field.Label>
          <div class="flex">
            <Field.Input
              name="query"
              type="search"
              placeholder="Name or SKU"
              value={query}
              class="min-w-0 flex-1 rounded-e-none"
            />
            <Button
              type="submit"
              class="shrink-0 rounded-s-none border-s-0"
              disabled={inert}
              aria-busy={loading}
            >
              {#if loading}
                <Spinner size="sm" aria-hidden="true" />
                Searching
              {:else}
                Search
              {/if}
            </Button>
          </div>
          <Field.ErrorText>{errors?.query}</Field.ErrorText>
        </Field.Root>
      </form>
    </div>
  </div>
</section>
