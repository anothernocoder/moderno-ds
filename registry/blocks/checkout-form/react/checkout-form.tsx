import { useId, type FormEvent, type HTMLAttributes, type ReactNode } from "react";
import { Alert, Button, Divider, Field, RadioGroup, Switch } from "@moderno-ui/react";

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
  autoComplete: string;
  placeholder: string;
  type?: "email" | "text";
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  wide?: boolean;
}

const contactFields: CheckoutField[] = [
  {
    name: "email",
    label: "Email",
    autoComplete: "email",
    placeholder: "you@example.com",
    type: "email",
    wide: true,
  },
];

const addressFields: CheckoutField[] = [
  {
    name: "fullName",
    label: "Full name",
    autoComplete: "name",
    placeholder: "Ada Lovelace",
    wide: true,
  },
  {
    name: "address",
    label: "Address",
    autoComplete: "street-address",
    placeholder: "100 Market Street",
    wide: true,
  },
  { name: "city", label: "City", autoComplete: "address-level2", placeholder: "San Francisco" },
  { name: "region", label: "State / Province", autoComplete: "address-level1", placeholder: "CA" },
  { name: "postalCode", label: "Postal code", autoComplete: "postal-code", placeholder: "94103" },
  { name: "country", label: "Country", autoComplete: "country-name", placeholder: "United States" },
];

const cardFields: CheckoutField[] = [
  {
    name: "cardName",
    label: "Name on card",
    autoComplete: "cc-name",
    placeholder: "Ada Lovelace",
    wide: true,
  },
  {
    name: "cardNumber",
    label: "Card number",
    autoComplete: "cc-number",
    placeholder: "1234 1234 1234 1234",
    inputMode: "numeric",
    wide: true,
  },
  { name: "expiry", label: "Expiry", autoComplete: "cc-exp", placeholder: "MM / YY" },
  {
    name: "cvc",
    label: "CVC",
    autoComplete: "cc-csc",
    placeholder: "123",
    inputMode: "numeric",
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
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onBack?: () => void;
}

export function CheckoutForm({
  step = "shipping",
  heading,
  description,
  headingLevel = 2,
  deliveryOptions = sampleDeliveryOptions,
  error,
  errors,
  loading = false,
  disabled = false,
  onSubmit,
  onBack,
}: CheckoutFormProps) {
  const uid = useId();
  const text = copy[step];
  const intro = description ?? text.description;
  const inert = loading || disabled;
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const GroupHeading = headingLevel === 1 ? "h2" : "h3";

  const renderFields = (fields: CheckoutField[]) =>
    fields.map((field) => (
      <Field.Root
        key={field.name}
        className={field.wide ? "@sm:col-span-2" : undefined}
        required
        invalid={Boolean(errors?.[field.name])}
        disabled={inert}
      >
        <Field.Label>{field.label}</Field.Label>
        <Field.Input
          name={field.name}
          type={field.type ?? "text"}
          inputMode={field.inputMode}
          autoComplete={field.autoComplete}
          placeholder={field.placeholder}
        />
        <Field.ErrorText>{errors?.[field.name]}</Field.ErrorText>
      </Field.Root>
    ));

  const renderGroup = (id: string, title: string, summary: string, content: ReactNode) => (
    <div role="group" aria-labelledby={`${uid}-${id}`} className="grid gap-6 @lg:grid-cols-3">
      <div className="grid content-start gap-1">
        <GroupHeading id={`${uid}-${id}`} className="text-ui-md font-medium">
          {title}
        </GroupHeading>
        <p className="text-ui-sm text-muted-foreground">{summary}</p>
      </div>
      {content}
    </div>
  );

  return (
    <section className="@container moderno-block-checkout-form text-foreground">
      <div className="grid gap-10 px-4 py-12 @lg:py-16">
        <div className="mx-auto grid max-w-md gap-3 text-center">
          <Heading className="font-serif text-heading-sm text-balance @md:text-heading">
            {heading ?? text.heading}
          </Heading>
          {intro ? <p className="text-body text-muted-foreground">{intro}</p> : null}
        </div>

        <form
          className="mx-auto grid w-full max-w-lg gap-8 rounded-lg border border-border p-4 @sm:p-6"
          onSubmit={onSubmit}
          noValidate
        >
          {error ? (
            <Alert.Root variant="error" size="sm">
              <Alert.Content>
                <Alert.Title>{error}</Alert.Title>
                <Alert.Description>
                  Nothing you entered is lost. Check it and try again.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          ) : null}

          {step === "shipping" ? (
            <>
              {renderGroup(
                "contact",
                "Contact",
                "We send your receipt and tracking here.",
                <div className="grid gap-5 @sm:grid-cols-2 @lg:col-span-2">
                  {renderFields(contactFields)}
                </div>,
              )}
              <Divider />
              {renderGroup(
                "address",
                "Shipping address",
                "Where the parcel goes.",
                <div className="grid gap-5 @sm:grid-cols-2 @lg:col-span-2">
                  {renderFields(addressFields)}
                </div>,
              )}
              {deliveryOptions.length > 0 ? (
                <>
                  <Divider />
                  {renderGroup(
                    "delivery",
                    "Delivery method",
                    "How fast it gets to you.",
                    <RadioGroup.Root
                      name="delivery"
                      defaultValue={deliveryOptions[0]!.id}
                      disabled={inert}
                      className="@lg:col-span-2"
                    >
                      <RadioGroup.Label className="sr-only">Delivery method</RadioGroup.Label>
                      <div className="grid gap-3 @md:grid-cols-2">
                        {deliveryOptions.map((option) => (
                          <RadioGroup.Item
                            key={option.id}
                            value={option.id}
                            className="rounded-lg border border-border p-4 transition-colors hover:border-muted-foreground data-[state=checked]:border-primary"
                          >
                            <RadioGroup.ItemControl />
                            <RadioGroup.ItemText className="grid gap-1">
                              <span className="font-medium">{option.label}</span>
                              <RadioGroup.ItemDescription>
                                {option.description}
                              </RadioGroup.ItemDescription>
                              <span className="font-medium">{option.price}</span>
                            </RadioGroup.ItemText>
                            <RadioGroup.ItemHiddenInput />
                          </RadioGroup.Item>
                        ))}
                      </div>
                    </RadioGroup.Root>,
                  )}
                </>
              ) : null}
            </>
          ) : (
            renderGroup(
              "card",
              "Card details",
              "Credit or debit card.",
              <div className="grid gap-5 @sm:grid-cols-2 @lg:col-span-2">
                {renderFields(cardFields)}
                <Switch.Root name="saveCard" disabled={inert} className="@sm:col-span-2">
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Switch.Label>Save this card for next time</Switch.Label>
                  <Switch.HiddenInput />
                </Switch.Root>
              </div>,
            )
          )}

          <Divider />

          <div className="flex flex-col-reverse gap-3 @sm:flex-row @sm:items-center @sm:justify-between">
            <Button type="button" variant="outline" disabled={inert} onClick={onBack}>
              {text.back}
            </Button>
            <Button type="submit" disabled={inert} aria-busy={loading}>
              {loading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                  />
                  {text.busy}
                </>
              ) : (
                text.submit
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
