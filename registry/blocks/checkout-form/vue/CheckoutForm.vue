<script setup lang="ts">
import { computed, useId } from "vue";
import { Alert, Button, Divider, Field, RadioGroup, Switch } from "@moderno-ui/vue";

type CheckoutStep = "shipping" | "payment";

interface DeliveryOption {
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

interface FieldGroup {
  id: string;
  title: string;
  summary: string;
  fields: CheckoutField[];
}

const contactGroup: FieldGroup = {
  id: "contact",
  title: "Contact",
  summary: "We send your receipt and tracking here.",
  fields: [
    {
      name: "email",
      label: "Email",
      autocomplete: "email",
      placeholder: "you@example.com",
      type: "email",
      wide: true,
    },
  ],
};

const addressGroup: FieldGroup = {
  id: "address",
  title: "Shipping address",
  summary: "Where the parcel goes.",
  fields: [
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
    {
      name: "region",
      label: "State / Province",
      autocomplete: "address-level1",
      placeholder: "CA",
    },
    { name: "postalCode", label: "Postal code", autocomplete: "postal-code", placeholder: "94103" },
    {
      name: "country",
      label: "Country",
      autocomplete: "country-name",
      placeholder: "United States",
    },
  ],
};

const cardGroup: FieldGroup = {
  id: "card",
  title: "Card details",
  summary: "Credit or debit card.",
  fields: [
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
  ],
};

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

const props = withDefaults(
  defineProps<{
    step?: CheckoutStep;
    heading?: string;
    description?: string;
    headingLevel?: 1 | 2;
    deliveryOptions?: DeliveryOption[];
    error?: string;
    errors?: Record<string, string>;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    step: "shipping",
    heading: undefined,
    description: undefined,
    headingLevel: 2,
    deliveryOptions: undefined,
    error: undefined,
    errors: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{ submit: [event: Event]; back: [] }>();

const uid = useId();

const text = computed(() => copy[props.step]);
const intro = computed(() => props.description ?? text.value.description);
// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const options = computed(() => props.deliveryOptions ?? sampleDeliveryOptions);
const groups = computed(() =>
  props.step === "shipping" ? [contactGroup, addressGroup] : [cardGroup],
);
const groupHeading = computed(() => (props.headingLevel === 1 ? "h2" : "h3"));
const inert = computed(() => props.loading || props.disabled);
</script>

<template>
  <section class="@container moderno-block-checkout-form text-foreground">
    <div class="grid gap-10 px-4 py-12 @lg:py-16">
      <div class="mx-auto grid max-w-md gap-3 text-center">
        <component
          :is="headingLevel === 1 ? 'h1' : 'h2'"
          class="font-serif text-heading-sm text-balance @md:text-heading"
        >
          {{ heading ?? text.heading }}
        </component>
        <p v-if="intro" class="text-body text-muted-foreground">{{ intro }}</p>
      </div>

      <form
        class="mx-auto grid w-full max-w-lg gap-8 rounded-lg border border-border p-4 @sm:p-6"
        novalidate
        @submit="emit('submit', $event)"
      >
        <Alert.Root v-if="error" variant="error" size="sm">
          <Alert.Content>
            <Alert.Title>{{ error }}</Alert.Title>
            <Alert.Description>
              Nothing you entered is lost. Check it and try again.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>

        <template v-for="(group, index) in groups" :key="group.id">
          <Divider v-if="index > 0" />
          <div
            role="group"
            :aria-labelledby="`${uid}-${group.id}`"
            class="grid gap-6 @lg:grid-cols-3"
          >
            <div class="grid content-start gap-1">
              <component
                :is="groupHeading"
                :id="`${uid}-${group.id}`"
                class="text-ui-md font-medium"
              >
                {{ group.title }}
              </component>
              <p class="text-ui-sm text-muted-foreground">{{ group.summary }}</p>
            </div>
            <div class="grid gap-5 @sm:grid-cols-2 @lg:col-span-2">
              <Field.Root
                v-for="field in group.fields"
                :key="field.name"
                :class="field.wide ? '@sm:col-span-2' : undefined"
                required
                :invalid="Boolean(errors?.[field.name])"
                :disabled="inert"
              >
                <Field.Label>{{ field.label }}</Field.Label>
                <Field.Input
                  :name="field.name"
                  :type="field.type ?? 'text'"
                  :inputmode="field.inputmode"
                  :autocomplete="field.autocomplete"
                  :placeholder="field.placeholder"
                />
                <Field.ErrorText>{{ errors?.[field.name] }}</Field.ErrorText>
              </Field.Root>
              <Switch.Root
                v-if="group.id === 'card'"
                name="saveCard"
                :disabled="inert"
                class="@sm:col-span-2"
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>Save this card for next time</Switch.Label>
                <Switch.HiddenInput />
              </Switch.Root>
            </div>
          </div>
        </template>

        <template v-if="step === 'shipping' && options.length > 0">
          <Divider />
          <div role="group" :aria-labelledby="`${uid}-delivery`" class="grid gap-6 @lg:grid-cols-3">
            <div class="grid content-start gap-1">
              <component :is="groupHeading" :id="`${uid}-delivery`" class="text-ui-md font-medium">
                Delivery method
              </component>
              <p class="text-ui-sm text-muted-foreground">How fast it gets to you.</p>
            </div>
            <RadioGroup.Root
              name="delivery"
              :default-value="options[0]!.id"
              :disabled="inert"
              class="@lg:col-span-2"
            >
              <RadioGroup.Label class="sr-only">Delivery method</RadioGroup.Label>
              <div class="grid gap-3 @md:grid-cols-2">
                <RadioGroup.Item
                  v-for="option in options"
                  :key="option.id"
                  :value="option.id"
                  class="rounded-lg border border-border p-4 transition-colors hover:border-muted-foreground data-[state=checked]:border-primary"
                >
                  <RadioGroup.ItemControl />
                  <RadioGroup.ItemText class="grid gap-1">
                    <span class="font-medium">{{ option.label }}</span>
                    <RadioGroup.ItemDescription>{{
                      option.description
                    }}</RadioGroup.ItemDescription>
                    <span class="font-medium">{{ option.price }}</span>
                  </RadioGroup.ItemText>
                  <RadioGroup.ItemHiddenInput />
                </RadioGroup.Item>
              </div>
            </RadioGroup.Root>
          </div>
        </template>

        <Divider />

        <div class="flex flex-col-reverse gap-3 @sm:flex-row @sm:items-center @sm:justify-between">
          <Button type="button" variant="outline" :disabled="inert" @click="emit('back')">
            {{ text.back }}
          </Button>
          <Button type="submit" :disabled="inert" :aria-busy="loading">
            <template v-if="loading">
              <span
                aria-hidden="true"
                class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              />
              {{ text.busy }}
            </template>
            <template v-else>{{ text.submit }}</template>
          </Button>
        </div>
      </form>
    </div>
  </section>
</template>
