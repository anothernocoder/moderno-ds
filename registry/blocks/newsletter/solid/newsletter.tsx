import { Show } from "solid-js";
import { Alert, Button, Field } from "@moderno-ui/solid";

export interface NewsletterProps {
  heading?: string;
  description?: string;
  note?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  subscribed?: boolean;
  onSubmit?: (event: SubmitEvent) => void;
}

export function Newsletter(props: NewsletterProps) {
  const heading = () => props.heading ?? "One calm email a month";
  const description = () =>
    props.description ??
    "Product news, closing tips and the odd template, from the team that builds it.";
  const note = () => props.note ?? "No spam. Unsubscribe with one click.";
  const inert = () => Boolean(props.loading) || Boolean(props.disabled);

  return (
    <section class="@container moderno-block-newsletter">
      <div class="rounded-lg border border-border bg-card px-6 py-10 text-card-foreground @lg:px-10">
        <div class="grid justify-items-center gap-6 text-center @lg:grid-cols-2 @lg:items-center @lg:justify-items-stretch @lg:gap-10 @lg:text-start">
          <div class="grid max-w-md gap-2">
            <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading()}</h2>
            <Show when={description()}>
              <p class="text-body text-pretty text-muted-foreground">{description()}</p>
            </Show>
          </div>

          <Show
            when={!props.subscribed}
            fallback={
              <Alert.Root variant="success" class="w-full max-w-md text-start">
                <Alert.Content>
                  <Alert.Title>You are subscribed</Alert.Title>
                  <Alert.Description>Check your inbox to confirm your email.</Alert.Description>
                </Alert.Content>
              </Alert.Root>
            }
          >
            <form class="grid w-full max-w-md gap-3" onSubmit={props.onSubmit} noValidate>
              <div class="grid gap-3 text-start @sm:flex @sm:items-start">
                <Field.Root
                  required
                  invalid={Boolean(props.error)}
                  disabled={inert()}
                  class="relative min-w-0 @sm:flex-1"
                >
                  <Field.Label class="sr-only">Email address</Field.Label>
                  <Field.Input
                    name="email"
                    type="email"
                    autocomplete="email"
                    placeholder="you@example.com"
                  />
                  <Field.ErrorText>{props.error}</Field.ErrorText>
                </Field.Root>
                <Button
                  type="submit"
                  disabled={inert()}
                  aria-busy={props.loading}
                  class="@sm:shrink-0"
                >
                  <Show when={props.loading} fallback="Subscribe">
                    <span
                      aria-hidden="true"
                      class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                    />
                    Subscribing
                  </Show>
                </Button>
              </div>
              <Show when={note()}>
                <p class="text-ui-sm text-muted-foreground">{note()}</p>
              </Show>
            </form>
          </Show>
        </div>
      </div>
    </section>
  );
}
