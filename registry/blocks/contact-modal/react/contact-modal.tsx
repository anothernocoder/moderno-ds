import { useState, type FormEvent } from "react";
import { Alert, Button, Dialog, Field, Portal } from "@moderno-ui/react";

export interface ContactLead {
  name: string;
  email: string;
  company: string;
  message: string;
}

type RequiredField = "name" | "email";

const requiredFields: RequiredField[] = ["name", "email"];

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

export function ContactModal({
  heading = "Talk to our team",
  description = "Tell us what you are building. A person from our team writes back within one business day.",
  trigger = "Contact sales",
  error,
  loading = false,
  disabled = false,
  sent = false,
  onSubmit,
}: ContactModalProps) {
  const [open, setOpen] = useState(false);
  const [missing, setMissing] = useState<RequiredField[]>([]);

  function openChange(next: boolean) {
    setMissing([]);
    setOpen(next);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
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
    onSubmit?.(lead);
  }

  return (
    <section className="@container moderno-block-contact-modal text-foreground">
      <div className="px-4 py-12 @lg:py-16">
        <div className="mx-auto grid w-full max-w-lg gap-6 rounded-lg border border-border p-6 text-center @sm:p-8 @lg:grid-cols-[minmax(0,1fr)_auto] @lg:items-center @lg:gap-10 @lg:text-start">
          <div className="grid gap-3">
            <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
            {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
          </div>

          <Dialog.Root lazyMount unmountOnExit open={open} onOpenChange={(e) => openChange(e.open)}>
            <Dialog.Trigger asChild>
              <Button
                type="button"
                size="lg"
                className="@sm:justify-self-center"
                disabled={disabled}
              >
                {trigger}
              </Button>
            </Dialog.Trigger>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content className="@container">
                  <Dialog.Title>Contact sales</Dialog.Title>
                  <Dialog.Description>
                    Share a few details and we will reply within one business day.
                  </Dialog.Description>

                  {sent ? (
                    <>
                      <Alert.Root variant="success">
                        <Alert.Content>
                          <Alert.Title>Message sent</Alert.Title>
                          <Alert.Description>
                            Thanks for reaching out. Look for our reply in your inbox.
                          </Alert.Description>
                        </Alert.Content>
                      </Alert.Root>
                      <div className="flex flex-col gap-2 @sm:flex-row @sm:justify-end">
                        <Dialog.CloseTrigger asChild>
                          <Button type="button" variant="outline" autoFocus>
                            Close
                          </Button>
                        </Dialog.CloseTrigger>
                      </div>
                    </>
                  ) : (
                    <form noValidate className="grid gap-4" onSubmit={submit}>
                      {error ? (
                        <Alert.Root variant="error" size="sm">
                          <Alert.Content>
                            <Alert.Title>{error}</Alert.Title>
                            <Alert.Description>
                              Nothing you entered is lost. Check it and send it again.
                            </Alert.Description>
                          </Alert.Content>
                        </Alert.Root>
                      ) : null}

                      <div className="grid gap-4 @sm:grid-cols-2">
                        <Field.Root required invalid={missing.includes("name")} disabled={loading}>
                          <Field.Label>Name</Field.Label>
                          <Field.Input name="name" autoComplete="name" placeholder="Ada Lovelace" />
                          <Field.ErrorText>Enter your name.</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={missing.includes("email")} disabled={loading}>
                          <Field.Label>Work email</Field.Label>
                          <Field.Input
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@company.com"
                          />
                          <Field.ErrorText>Enter your work email.</Field.ErrorText>
                        </Field.Root>
                      </div>

                      <Field.Root disabled={loading}>
                        <Field.Label>Company</Field.Label>
                        <Field.Input
                          name="company"
                          autoComplete="organization"
                          placeholder="Acme"
                        />
                      </Field.Root>

                      <Field.Root disabled={loading}>
                        <Field.Label>Message</Field.Label>
                        <Field.Textarea
                          name="message"
                          placeholder="What would you like to talk about?"
                        />
                      </Field.Root>

                      <div className="flex flex-col-reverse gap-2 @sm:flex-row @sm:justify-end">
                        <Dialog.CloseTrigger asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </Dialog.CloseTrigger>
                        <Button type="submit" disabled={loading} aria-busy={loading}>
                          {loading ? (
                            <>
                              <span
                                aria-hidden="true"
                                className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                              />
                              Sending
                            </>
                          ) : (
                            "Send message"
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </div>
      </div>
    </section>
  );
}
