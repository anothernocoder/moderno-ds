<script lang="ts">
  import { Alert, Button, Dialog, Field, Portal } from "@moderno-ui/svelte";

  interface ContactLead {
    name: string;
    email: string;
    company: string;
    message: string;
  }

  type RequiredField = "name" | "email";

  interface Props {
    heading?: string;
    description?: string;
    trigger?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    sent?: boolean;
    onsubmit?: (lead: ContactLead) => void;
  }

  const requiredFields: RequiredField[] = ["name", "email"];

  let {
    heading = "Talk to our team",
    description = "Tell us what you are building. A person from our team writes back within one business day.",
    trigger = "Contact sales",
    error,
    loading = false,
    disabled = false,
    sent = false,
    onsubmit,
  }: Props = $props();

  let open = $state(false);
  let missing = $state<RequiredField[]>([]);

  function openChange(next: boolean) {
    missing = [];
    open = next;
  }

  function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (name: keyof ContactLead) => String(data.get(name) ?? "").trim();
    const lead: ContactLead = {
      name: read("name"),
      email: read("email"),
      company: read("company"),
      message: read("message"),
    };
    const empty = requiredFields.filter((name) => !lead[name]);
    missing = empty;
    if (empty.length > 0) {
      form.querySelector<HTMLElement>(`[name="${empty[0]}"]`)?.focus();
      return;
    }
    onsubmit?.(lead);
  }
</script>

<section class="@container moderno-block-contact-modal text-foreground">
  <div class="px-4 py-12 @lg:py-16">
    <div
      class="mx-auto grid w-full max-w-lg gap-6 rounded-lg border border-border p-6 text-center @sm:p-8 @lg:grid-cols-[minmax(0,1fr)_auto] @lg:items-center @lg:gap-10 @lg:text-start"
    >
      <div class="grid gap-3">
        <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
        {#if description}
          <p class="text-body text-muted-foreground">{description}</p>
        {/if}
      </div>

      <Dialog.Root lazyMount unmountOnExit bind:open={() => open, openChange}>
        <Dialog.Trigger>
          {#snippet asChild(triggerProps)}
            <Button
              {...triggerProps()}
              type="button"
              size="lg"
              class="@sm:justify-self-center"
              {disabled}
            >
              {trigger}
            </Button>
          {/snippet}
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content class="@container">
              <Dialog.Title>Contact sales</Dialog.Title>
              <Dialog.Description>
                Share a few details and we will reply within one business day.
              </Dialog.Description>

              {#if sent}
                <Alert.Root variant="success">
                  <Alert.Content>
                    <Alert.Title>Message sent</Alert.Title>
                    <Alert.Description>
                      Thanks for reaching out. Look for our reply in your inbox.
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
                <div class="flex flex-col gap-2 @sm:flex-row @sm:justify-end">
                  <Dialog.CloseTrigger>
                    {#snippet asChild(closeProps)}
                      <Button {...closeProps()} type="button" variant="outline" autofocus>Close</Button>
                    {/snippet}
                  </Dialog.CloseTrigger>
                </div>
              {:else}
                <form novalidate class="grid gap-4" onsubmit={submit}>
                  {#if error}
                    <Alert.Root variant="error" size="sm">
                      <Alert.Content>
                        <Alert.Title>{error}</Alert.Title>
                        <Alert.Description>
                          Nothing you entered is lost. Check it and send it again.
                        </Alert.Description>
                      </Alert.Content>
                    </Alert.Root>
                  {/if}

                  <div class="grid gap-4 @sm:grid-cols-2">
                    <Field.Root required invalid={missing.includes("name")} disabled={loading}>
                      <Field.Label>Name</Field.Label>
                      <Field.Input name="name" autocomplete="name" placeholder="Ada Lovelace" />
                      <Field.ErrorText>Enter your name.</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={missing.includes("email")} disabled={loading}>
                      <Field.Label>Work email</Field.Label>
                      <Field.Input
                        name="email"
                        type="email"
                        autocomplete="email"
                        placeholder="you@company.com"
                      />
                      <Field.ErrorText>Enter your work email.</Field.ErrorText>
                    </Field.Root>
                  </div>

                  <Field.Root disabled={loading}>
                    <Field.Label>Company</Field.Label>
                    <Field.Input name="company" autocomplete="organization" placeholder="Acme" />
                  </Field.Root>

                  <Field.Root disabled={loading}>
                    <Field.Label>Message</Field.Label>
                    <Field.Textarea name="message" placeholder="What would you like to talk about?" />
                  </Field.Root>

                  <div class="flex flex-col-reverse gap-2 @sm:flex-row @sm:justify-end">
                    <Dialog.CloseTrigger>
                      {#snippet asChild(closeProps)}
                        <Button {...closeProps()} type="button" variant="outline">Cancel</Button>
                      {/snippet}
                    </Dialog.CloseTrigger>
                    <Button type="submit" disabled={loading} aria-busy={loading}>
                      {#if loading}
                        <span
                          aria-hidden="true"
                          class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                        ></span>
                        Sending
                      {:else}
                        Send message
                      {/if}
                    </Button>
                  </div>
                </form>
              {/if}
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </div>
  </div>
</section>
