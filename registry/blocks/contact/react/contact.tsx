import type { FormEvent } from "react";
import { Alert, Button, Field } from "@moderno-ui/react";

export interface ContactChannel {
  id: string;
  kind: "email" | "phone" | "office";
  label: string;
  value: string;
  href?: string;
}

const sampleChannels: ContactChannel[] = [
  {
    id: "email",
    kind: "email",
    label: "Email",
    value: "hello@example.com",
    href: "mailto:hello@example.com",
  },
  {
    id: "phone",
    kind: "phone",
    label: "Phone",
    value: "+1 (555) 010-2030",
    href: "tel:+15550102030",
  },
  {
    id: "office",
    kind: "office",
    label: "Office",
    value: "100 Market Street, San Francisco",
  },
];

function ChannelGlyph({ kind }: { kind: ContactChannel["kind"] }) {
  return (
    <svg
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "email" ? (
        <>
          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="m22 6-10 7L2 6" />
        </>
      ) : kind === "phone" ? (
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      ) : (
        <>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
          <circle cx="12" cy="10" r="3" />
        </>
      )}
    </svg>
  );
}

export interface ContactProps {
  heading?: string;
  description?: string;
  channels?: ContactChannel[];
  error?: string;
  errors?: Record<string, string>;
  loading?: boolean;
  disabled?: boolean;
  sent?: boolean;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

export function Contact({
  heading = "Get in touch",
  description = "Questions about pricing, a demo or your account? Send us a note and a person will write back.",
  channels = sampleChannels,
  error,
  errors,
  loading = false,
  disabled = false,
  sent = false,
  onSubmit,
}: ContactProps) {
  const inert = loading || disabled;

  return (
    <section className="@container moderno-block-contact text-foreground">
      <div className="grid gap-10 px-4 py-12 @lg:py-16">
        <div className="mx-auto grid max-w-md gap-3 text-center">
          <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
          {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
        </div>

        <div
          className={
            channels.length > 0
              ? "mx-auto grid w-full max-w-lg gap-10 @lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
              : "mx-auto grid w-full max-w-md"
          }
        >
          {channels.length > 0 ? (
            <ul className="grid content-start gap-6">
              {channels.map((channel) => (
                <li key={channel.id} className="flex items-start gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border">
                    <ChannelGlyph kind={channel.kind} />
                  </span>
                  <div className="grid min-w-0 gap-1">
                    <p className="text-ui-sm text-muted-foreground">{channel.label}</p>
                    {channel.href ? (
                      <a
                        className="justify-self-start rounded-sm text-ui-md font-medium text-foreground wrap-break-word underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        href={channel.href}
                      >
                        {channel.value}
                      </a>
                    ) : (
                      <p className="text-ui-md font-medium wrap-break-word">{channel.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {sent ? (
            <Alert.Root variant="success" className="self-start">
              <Alert.Content>
                <Alert.Title>Message sent</Alert.Title>
                <Alert.Description>
                  Thanks for writing. We reply within one business day.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          ) : (
            <form
              className="grid content-start gap-5 rounded-lg border border-border p-4 @sm:p-6"
              onSubmit={onSubmit}
              noValidate
            >
              {error ? (
                <Alert.Root variant="error" size="sm">
                  <Alert.Content>
                    <Alert.Title>{error}</Alert.Title>
                    <Alert.Description>
                      Nothing you wrote is lost. Check it and send it again.
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              ) : null}

              <div className="grid gap-5 @md:grid-cols-2">
                <Field.Root required invalid={Boolean(errors?.name)} disabled={inert}>
                  <Field.Label>Name</Field.Label>
                  <Field.Input name="name" autoComplete="name" placeholder="Ada Lovelace" />
                  <Field.ErrorText>{errors?.name}</Field.ErrorText>
                </Field.Root>

                <Field.Root required invalid={Boolean(errors?.email)} disabled={inert}>
                  <Field.Label>Email</Field.Label>
                  <Field.Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                  <Field.ErrorText>{errors?.email}</Field.ErrorText>
                </Field.Root>
              </div>

              <Field.Root required invalid={Boolean(errors?.message)} disabled={inert}>
                <Field.Label>Message</Field.Label>
                <Field.Textarea name="message" placeholder="How can we help?" />
                <Field.ErrorText>{errors?.message}</Field.ErrorText>
              </Field.Root>

              <div className="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
                <p className="text-ui-sm text-muted-foreground">
                  We reply within one business day.
                </p>
                <Button type="submit" disabled={inert} aria-busy={loading}>
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
        </div>
      </div>
    </section>
  );
}
