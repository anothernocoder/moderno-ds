import { createSignal, onMount, Show } from "solid-js";
import { Alert, Button, Dialog, Field, Portal } from "@moderno-ui/solid";

export interface ContactLead {
  name: string;
  email: string;
  company: string;
  message: string;
}

type RequiredField = "name" | "email";

const requiredFields: RequiredField[] = ["name", "email"];

// The sent message replaces the focused form, so focus moves to its Close button.
function focusOnMount(element: HTMLElement) {
  onMount(() => element.focus());
}

export interface ContactModalProps {
  heading?: string;
  description?: string;
  trigger?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  sent?: boolean;
  onSubmit?: (lead: ContactLead) => void;
}

export function ContactModal(props: ContactModalProps) {
  const [open, setOpen] = createSignal(false);
  const [missing, setMissing] = createSignal<RequiredField[]>([]);
  const heading = () => props.heading ?? "Talk to our team";
  const description = () =>
    props.description ??
    "Tell us what you are building. A person from our team writes back within one business day.";
  const trigger = () => props.trigger ?? "Contact sales";
  const loading = () => Boolean(props.loading);

  function openChange(next: boolean) {
    setMissing([]);
    setOpen(next);
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
    setMissing(empty);
    if (empty.length > 0) {
      form.querySelector<HTMLElement>(`[name="${empty[0]}"]`)?.focus();
      return;
    }
    props.onSubmit?.(lead);
  }

  return (
    <section class="@container moderno-block-contact-modal text-foreground">
      <div class="px-4 py-12 @lg:py-16">
        <div class="mx-auto grid w-full max-w-lg gap-6 rounded-lg border border-border p-6 text-center @sm:p-8 @lg:grid-cols-[minmax(0,1fr)_auto] @lg:items-center @lg:gap-10 @lg:text-start">
          <div class="grid gap-3">
            <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading()}</h2>
            <Show when={description()}>
              <p class="text-body text-muted-foreground">{description()}</p>
            </Show>
          </div>

          <Dialog.Root
            lazyMount
            unmountOnExit
            open={open()}
            onOpenChange={(details) => openChange(details.open)}
          >
            <Dialog.Trigger
              asChild={(triggerProps) => (
                <Button
                  {...triggerProps()}
                  type="button"
                  size="lg"
                  class="@sm:justify-self-center"
                  disabled={props.disabled}
                >
                  {trigger()}
                </Button>
              )}
            />
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content class="@container">
                  <Dialog.Title>Contact sales</Dialog.Title>
                  <Dialog.Description>
                    Share a few details and we will reply within one business day.
                  </Dialog.Description>

                  <Show
                    when={!props.sent}
                    fallback={
                      <>
                        <Alert.Root variant="success">
                          <Alert.Content>
                            <Alert.Title>Message sent</Alert.Title>
                            <Alert.Description>
                              Thanks for reaching out. Look for our reply in your inbox.
                            </Alert.Description>
                          </Alert.Content>
                        </Alert.Root>
                        <div class="flex flex-col gap-2 @sm:flex-row @sm:justify-end">
                          <Dialog.CloseTrigger
                            asChild={(closeProps) => (
                              <Button
                                {...closeProps()}
                                ref={focusOnMount}
                                type="button"
                                variant="outline"
                              >
                                Close
                              </Button>
                            )}
                          />
                        </div>
                      </>
                    }
                  >
                    <form novalidate class="grid gap-4" onSubmit={submit}>
                      <Show when={props.error}>
                        {(message) => (
                          <Alert.Root variant="error" size="sm">
                            <Alert.Content>
                              <Alert.Title>{message()}</Alert.Title>
                              <Alert.Description>
                                Nothing you entered is lost. Check it and send it again.
                              </Alert.Description>
                            </Alert.Content>
                          </Alert.Root>
                        )}
                      </Show>

                      <div class="grid gap-4 @sm:grid-cols-2">
                        <Field.Root
                          required
                          invalid={missing().includes("name")}
                          disabled={loading()}
                        >
                          <Field.Label>Name</Field.Label>
                          <Field.Input name="name" autocomplete="name" placeholder="Ada Lovelace" />
                          <Field.ErrorText>Enter your name.</Field.ErrorText>
                        </Field.Root>

                        <Field.Root
                          required
                          invalid={missing().includes("email")}
                          disabled={loading()}
                        >
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

                      <Field.Root disabled={loading()}>
                        <Field.Label>Company</Field.Label>
                        <Field.Input
                          name="company"
                          autocomplete="organization"
                          placeholder="Acme"
                        />
                      </Field.Root>

                      <Field.Root disabled={loading()}>
                        <Field.Label>Message</Field.Label>
                        <Field.Textarea
                          name="message"
                          placeholder="What would you like to talk about?"
                        />
                      </Field.Root>

                      <div class="flex flex-col-reverse gap-2 @sm:flex-row @sm:justify-end">
                        <Dialog.CloseTrigger
                          asChild={(closeProps) => (
                            <Button {...closeProps()} type="button" variant="outline">
                              Cancel
                            </Button>
                          )}
                        />
                        <Button type="submit" disabled={loading()} aria-busy={loading()}>
                          <Show when={loading()} fallback="Send message">
                            <span
                              aria-hidden="true"
                              class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                            />
                            Sending
                          </Show>
                        </Button>
                      </div>
                    </form>
                  </Show>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </div>
      </div>
    </section>
  );
}
