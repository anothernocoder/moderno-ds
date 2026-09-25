<script lang="ts">
  import { Alert, Button, Checkbox, Divider, Field } from "@moderno-ui/svelte";

  interface Props {
    error?: string;
    errors?: Record<string, string>;
    loading?: boolean;
    disabled?: boolean;
    onsubmit?: (event: SubmitEvent) => void;
    oncancel?: () => void;
  }

  let { error, errors, loading = false, disabled = false, onsubmit, oncancel }: Props = $props();

  const inert = $derived(loading || disabled);
</script>

<section class="@container moderno-block-form-layout text-foreground">
  <form class="grid gap-8" {onsubmit} novalidate>
    <header class="grid gap-1">
      <h2 class="text-lg font-semibold @md:text-xl">Account settings</h2>
      <p class="text-sm text-muted-foreground">
        Update how you appear to your workspace and choose what we email you about.
      </p>
    </header>

    {#if error}
      <Alert.Root variant="error" size="sm">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
        </Alert.Content>
      </Alert.Root>
    {/if}

    <div class="grid gap-6 @lg:grid-cols-3">
      <header class="grid gap-1">
        <h3 class="text-sm font-medium">Profile</h3>
        <p class="text-sm text-muted-foreground">How you appear to the rest of your workspace.</p>
      </header>

      <div class="grid gap-5 @md:grid-cols-2 @lg:col-span-2">
        <Field.Root required invalid={Boolean(errors?.fullName)} disabled={inert}>
          <Field.Label>Full name</Field.Label>
          <Field.Input name="fullName" autocomplete="name" placeholder="Ada Lovelace" />
          <Field.ErrorText>{errors?.fullName}</Field.ErrorText>
        </Field.Root>

        <Field.Root required invalid={Boolean(errors?.email)} disabled={inert}>
          <Field.Label>Email</Field.Label>
          <Field.Input
            name="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          />
          <Field.ErrorText>{errors?.email}</Field.ErrorText>
        </Field.Root>

        <Field.Root class="@md:col-span-2" invalid={Boolean(errors?.about)} disabled={inert}>
          <Field.Label>About</Field.Label>
          <Field.Textarea name="about" placeholder="A sentence your teammates will read." />
          <Field.HelperText>Shown on your profile. Plain text, 280 characters.</Field.HelperText>
          <Field.ErrorText>{errors?.about}</Field.ErrorText>
        </Field.Root>
      </div>
    </div>

    <Divider />

    <div class="grid gap-6 @lg:grid-cols-3">
      <header class="grid gap-1">
        <h3 class="text-sm font-medium">Notifications</h3>
        <p class="text-sm text-muted-foreground">
          We only email you about the things you keep switched on here.
        </p>
      </header>

      <div class="grid gap-4 @lg:col-span-2">
        <Checkbox.Root name="productUpdates" size="sm" disabled={inert}>
          <Checkbox.Control>
            <Checkbox.Indicator>✓</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>Product updates — what shipped, roughly monthly</Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>

        <Checkbox.Root name="securityAlerts" size="sm" disabled={inert}>
          <Checkbox.Control>
            <Checkbox.Indicator>✓</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>Security alerts — new sign-ins and password changes</Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
      </div>
    </div>

    <Divider />

    <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-end">
      <Button type="button" variant="secondary" disabled={inert} onclick={oncancel}>Cancel</Button>
      <Button type="submit" disabled={inert} aria-busy={loading}>
        {#if loading}
          <span
            aria-hidden="true"
            class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
          ></span>
          Saving
        {:else}
          Save changes
        {/if}
      </Button>
    </div>
  </form>
</section>
