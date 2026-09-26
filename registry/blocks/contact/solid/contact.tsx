import { For, Match, Show, Switch } from "solid-js";
import { Alert, Button, Field } from "@moderno-ui/solid";

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

function ChannelGlyph(props: { kind: ContactChannel["kind"] }) {
  return (
    <svg
      class="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <Switch
        fallback={
          <>
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
          </>
        }
      >
        <Match when={props.kind === "email"}>
          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="m22 6-10 7L2 6" />
        </Match>
        <Match when={props.kind === "phone"}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </Match>
      </Switch>
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
  onSubmit?: (event: SubmitEvent) => void;
}

export function Contact(props: ContactProps) {
  const heading = () => props.heading ?? "Get in touch";
  const description = () =>
    props.description ??
    "Questions about pricing, a demo or your account? Send us a note and a person will write back.";
  const channels = () => props.channels ?? sampleChannels;
  const inert = () => Boolean(props.loading) || Boolean(props.disabled);

  return (
    <section class="@container moderno-block-contact text-foreground">
      <div class="grid gap-10 px-4 py-12 @lg:py-16">
        <div class="mx-auto grid max-w-md gap-3 text-center">
          <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading()}</h2>
          <Show when={description()}>
            <p class="text-body text-muted-foreground">{description()}</p>
          </Show>
        </div>

        <div
          class={
            channels().length > 0
              ? "mx-auto grid w-full max-w-lg gap-10 @lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
              : "mx-auto grid w-full max-w-md"
          }
        >
          <Show when={channels().length > 0}>
            <ul class="grid content-start gap-6">
              <For each={channels()}>
                {(channel) => (
                  <li class="flex items-start gap-3">
                    <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border">
                      <ChannelGlyph kind={channel.kind} />
                    </span>
                    <div class="grid min-w-0 gap-1">
                      <p class="text-ui-sm text-muted-foreground">{channel.label}</p>
                      <Show
                        when={channel.href}
                        fallback={
                          <p class="text-ui-md font-medium wrap-break-word">{channel.value}</p>
                        }
                      >
                        {(href) => (
                          <a
                            class="justify-self-start rounded-sm text-ui-md font-medium text-foreground wrap-break-word underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            href={href()}
                          >
                            {channel.value}
                          </a>
                        )}
                      </Show>
                    </div>
                  </li>
                )}
              </For>
            </ul>
          </Show>

          <Show
            when={!props.sent}
            fallback={
              <Alert.Root variant="success" class="self-start">
                <Alert.Content>
                  <Alert.Title>Message sent</Alert.Title>
                  <Alert.Description>
                    Thanks for writing. We reply within one business day.
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            }
          >
            <form
              class="grid content-start gap-5 rounded-lg border border-border p-4 @sm:p-6"
              onSubmit={props.onSubmit}
              noValidate
            >
              <Show when={props.error}>
                {(message) => (
                  <Alert.Root variant="error" size="sm">
                    <Alert.Content>
                      <Alert.Title>{message()}</Alert.Title>
                      <Alert.Description>
                        Nothing you wrote is lost. Check it and send it again.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}
              </Show>

              <div class="grid gap-5 @md:grid-cols-2">
                <Field.Root required invalid={Boolean(props.errors?.name)} disabled={inert()}>
                  <Field.Label>Name</Field.Label>
                  <Field.Input name="name" autocomplete="name" placeholder="Ada Lovelace" />
                  <Field.ErrorText>{props.errors?.name}</Field.ErrorText>
                </Field.Root>

                <Field.Root required invalid={Boolean(props.errors?.email)} disabled={inert()}>
                  <Field.Label>Email</Field.Label>
                  <Field.Input
                    name="email"
                    type="email"
                    autocomplete="email"
                    placeholder="you@example.com"
                  />
                  <Field.ErrorText>{props.errors?.email}</Field.ErrorText>
                </Field.Root>
              </div>

              <Field.Root required invalid={Boolean(props.errors?.message)} disabled={inert()}>
                <Field.Label>Message</Field.Label>
                <Field.Textarea name="message" placeholder="How can we help?" />
                <Field.ErrorText>{props.errors?.message}</Field.ErrorText>
              </Field.Root>

              <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
                <p class="text-ui-sm text-muted-foreground">We reply within one business day.</p>
                <Button type="submit" disabled={inert()} aria-busy={props.loading}>
                  <Show when={props.loading} fallback="Send message">
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
        </div>
      </div>
    </section>
  );
}
