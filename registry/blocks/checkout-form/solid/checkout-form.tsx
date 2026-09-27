import { createUniqueId, For, Show, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Alert, Button, Divider, Field, RadioGroup, Switch } from "@moderno-ui/solid";

export type CheckoutStep = "shipping" | "payment";

export interface DeliveryOption {
  id: string;
  label: string;
  description: string;
  price: string;
}

interface CheckoutField {
  name: string;
  label: string;
  autocomplete: string;
  placeholder: string;
  type?: "email" | "text";
  inputmode?: "numeric";
  wide?: boolean;
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

export interface CheckoutFormProps {
  step?: CheckoutStep;
  heading?: string;
  description?: string;
  headingLevel?: 1 | 2;
  deliveryOptions?: DeliveryOption[];
  error?: string;
  errors?: Record<string, string>;
  loading?: boolean;
  disabled?: boolean;
  onSubmit?: (event: SubmitEvent) => void;
  onBack?: () => void;
}

export function CheckoutForm(props: CheckoutFormProps) {
  const uid = createUniqueId();
  const step = () => props.step ?? "shipping";
  const text = () => copy[step()];
  const intro = () => props.description ?? text().description;
  const deliveryOptions = () => props.deliveryOptions ?? sampleDeliveryOptions;
  const groupHeading = () => (props.headingLevel === 1 ? "h2" : "h3");
  const inert = () => Boolean(props.loading) || Boolean(props.disabled);

  const fields = (list: CheckoutField[]) => (
    <For each={list}>
      {(field) => (
        <Field.Root
          class={field.wide ? "@sm:col-span-2" : undefined}
          required
          invalid={Boolean(props.errors?.[field.name])}
          disabled={inert()}
        >
          <Field.Label>{field.label}</Field.Label>
          <Field.Input
            name={field.name}
            type={field.type ?? "text"}
            inputmode={field.inputmode}
            autocomplete={field.autocomplete}
            placeholder={field.placeholder}
          />
          <Field.ErrorText>{props.errors?.[field.name]}</Field.ErrorText>
        </Field.Root>
      )}
    </For>
  );

  const group = (id: string, title: string, summary: string, content: JSX.Element) => (
    <div role="group" aria-labelledby={`${uid}-${id}`} class="grid gap-6 @lg:grid-cols-3">
      <div class="grid content-start gap-1">
        <Dynamic component={groupHeading()} id={`${uid}-${id}`} class="text-ui-md font-medium">
          {title}
        </Dynamic>
        <p class="text-ui-sm text-muted-foreground">{summary}</p>
      </div>
      {content}
    </div>
  );

  return (
    <section class="@container moderno-block-checkout-form text-foreground">
      <div class="grid gap-10 px-4 py-12 @lg:py-16">
        <div class="mx-auto grid max-w-md gap-3 text-center">
          <Dynamic
            component={props.headingLevel === 1 ? "h1" : "h2"}
            class="font-serif text-heading-sm text-balance @md:text-heading"
          >
            {props.heading ?? text().heading}
          </Dynamic>
          <Show when={intro()}>
            <p class="text-body text-muted-foreground">{intro()}</p>
          </Show>
        </div>

        <form
          class="mx-auto grid w-full max-w-lg gap-8 rounded-lg border border-border p-4 @sm:p-6"
          onSubmit={props.onSubmit}
          noValidate
        >
          <Show when={props.error}>
            <Alert.Root variant="error" size="sm">
              <Alert.Content>
                <Alert.Title>{props.error}</Alert.Title>
                <Alert.Description>
                  Nothing you entered is lost. Check it and try again.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          </Show>

          <Show
            when={step() === "shipping"}
            fallback={group(
              "card",
              "Card details",
              "Credit or debit card.",
              <div class="grid gap-5 @sm:grid-cols-2 @lg:col-span-2">
                {fields(cardFields)}
                <Switch.Root name="saveCard" disabled={inert()} class="@sm:col-span-2">
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Switch.Label>Save this card for next time</Switch.Label>
                  <Switch.HiddenInput />
                </Switch.Root>
              </div>,
            )}
          >
            {group(
              "contact",
              "Contact",
              "We send your receipt and tracking here.",
              <div class="grid gap-5 @sm:grid-cols-2 @lg:col-span-2">{fields(contactFields)}</div>,
            )}
            <Divider />
            {group(
              "address",
              "Shipping address",
              "Where the parcel goes.",
              <div class="grid gap-5 @sm:grid-cols-2 @lg:col-span-2">{fields(addressFields)}</div>,
            )}
            <Show when={deliveryOptions().length > 0}>
              <Divider />
              {group(
                "delivery",
                "Delivery method",
                "How fast it gets to you.",
                <RadioGroup.Root
                  name="delivery"
                  defaultValue={deliveryOptions()[0]!.id}
                  disabled={inert()}
                  class="@lg:col-span-2"
                >
                  <RadioGroup.Label class="sr-only">Delivery method</RadioGroup.Label>
                  <div class="grid gap-3 @md:grid-cols-2">
                    <For each={deliveryOptions()}>
                      {(option) => (
                        <RadioGroup.Item
                          value={option.id}
                          class="rounded-lg border border-border p-4 transition-colors hover:border-muted-foreground data-[state=checked]:border-primary"
                        >
                          <RadioGroup.ItemControl />
                          <RadioGroup.ItemText class="grid gap-1">
                            <span class="font-medium">{option.label}</span>
                            <RadioGroup.ItemDescription>
                              {option.description}
                            </RadioGroup.ItemDescription>
                            <span class="font-medium">{option.price}</span>
                          </RadioGroup.ItemText>
                          <RadioGroup.ItemHiddenInput />
                        </RadioGroup.Item>
                      )}
                    </For>
                  </div>
                </RadioGroup.Root>,
              )}
            </Show>
          </Show>

          <Divider />

          <div class="flex flex-col-reverse gap-3 @sm:flex-row @sm:items-center @sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={inert()}
              onClick={() => props.onBack?.()}
            >
              {text().back}
            </Button>
            <Button type="submit" disabled={inert()} aria-busy={props.loading}>
              <Show when={props.loading} fallback={text().submit}>
                <span
                  aria-hidden="true"
                  class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                />
                {text().busy}
              </Show>
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
