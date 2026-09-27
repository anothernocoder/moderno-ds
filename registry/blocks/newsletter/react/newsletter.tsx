import type { FormEvent } from "react";
import { Alert, Button, Field } from "@moderno-ui/react";

export interface NewsletterProps {
  heading?: string;
  description?: string;
  note?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  subscribed?: boolean;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

export function Newsletter({
  heading = "One calm email a month",
  description = "Product news, closing tips and the odd template, from the team that builds it.",
  note = "No spam. Unsubscribe with one click.",
  error,
  loading = false,
  disabled = false,
  subscribed = false,
  onSubmit,
}: NewsletterProps) {
  const inert = loading || disabled;

  return (
    <section className="@container moderno-block-newsletter">
      <div className="rounded-lg border border-border bg-card px-6 py-10 text-card-foreground @lg:px-10">
        <div className="grid justify-items-center gap-6 text-center @lg:grid-cols-2 @lg:items-center @lg:justify-items-stretch @lg:gap-10 @lg:text-start">
          <div className="grid max-w-md gap-2">
            <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
            {description ? (
              <p className="text-body text-pretty text-muted-foreground">{description}</p>
            ) : null}
          </div>

          {subscribed ? (
            <Alert.Root variant="success" className="w-full max-w-md text-start">
              <Alert.Content>
                <Alert.Title>You are subscribed</Alert.Title>
                <Alert.Description>Check your inbox to confirm your email.</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          ) : (
            <form className="grid w-full max-w-md gap-3" onSubmit={onSubmit} noValidate>
              <div className="grid gap-3 text-start @sm:flex @sm:items-start">
                <Field.Root
                  required
                  invalid={Boolean(error)}
                  disabled={inert}
                  className="relative min-w-0 @sm:flex-1"
                >
                  <Field.Label className="sr-only">Email address</Field.Label>
                  <Field.Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                  <Field.ErrorText>{error}</Field.ErrorText>
                </Field.Root>
                <Button type="submit" disabled={inert} aria-busy={loading} className="@sm:shrink-0">
                  {loading ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                      />
                      Subscribing
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </div>
              {note ? <p className="text-ui-sm text-muted-foreground">{note}</p> : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
