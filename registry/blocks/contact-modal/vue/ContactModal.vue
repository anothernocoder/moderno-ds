<script setup lang="ts">
import { ref } from "vue";
import { Alert, Button, Dialog, Field, Portal } from "@moderno-ui/vue";

interface ContactLead {
  name: string;
  email: string;
  company: string;
  message: string;
}

type RequiredField = "name" | "email";

const requiredFields: RequiredField[] = ["name", "email"];

withDefaults(
  defineProps<{
    heading?: string;
    description?: string;
    trigger?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    sent?: boolean;
  }>(),
  {
    heading: "Talk to our team",
    description:
      "Tell us what you are building. A person from our team writes back within one business day.",
    trigger: "Contact sales",
    error: undefined,
    loading: false,
    disabled: false,
    sent: false,
  },
);

const emit = defineEmits<{ submit: [lead: ContactLead] }>();

const open = ref(false);
const missing = ref<RequiredField[]>([]);

// The sent message replaces the focused form, so focus moves to its Close button.
const vFocusOnMount = { mounted: (el: HTMLElement) => el.focus() };

function openChange(next: boolean) {
  missing.value = [];
  open.value = next;
}

function submit(event: Event) {
  const form = event.currentTarget as HTMLFormElement;
  const data = new FormData(form);
  const read = (name: keyof ContactLead) => String(data.get(name) ?? "").trim();
  const lead: ContactLead = {
    name: read("name"),
    email: read("email"),
    company: read("company"),
    message: read("message"),
  };
  const empty = requiredFields.filter((name) => !lead[name]);
  missing.value = empty;
  if (empty.length > 0) {
    form.querySelector<HTMLElement>(`[name="${empty[0]}"]`)?.focus();
    return;
  }
  emit("submit", lead);
}
</script>

<template>
  <section class="@container moderno-block-contact-modal text-foreground">
    <div class="px-4 py-12 @lg:py-16">
      <div
        class="mx-auto grid w-full max-w-lg gap-6 rounded-lg border border-border p-6 text-center @sm:p-8 @lg:grid-cols-[minmax(0,1fr)_auto] @lg:items-center @lg:gap-10 @lg:text-start"
      >
        <div class="grid gap-3">
          <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{{ heading }}</h2>
          <p v-if="description" class="text-body text-muted-foreground">{{ description }}</p>
        </div>

        <Dialog.Root
          lazy-mount
          unmount-on-exit
          :open="open"
          @open-change="({ open: next }) => openChange(next)"
        >
          <Dialog.Trigger as-child>
            <Button type="button" size="lg" class="@sm:justify-self-center" :disabled="disabled">
              {{ trigger }}
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content class="@container">
                <Dialog.Title>Contact sales</Dialog.Title>
                <Dialog.Description>
                  Share a few details and we will reply within one business day.
                </Dialog.Description>

                <template v-if="sent">
                  <Alert.Root variant="success">
                    <Alert.Content>
                      <Alert.Title>Message sent</Alert.Title>
                      <Alert.Description>
                        Thanks for reaching out. Look for our reply in your inbox.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                  <div class="flex flex-col gap-2 @sm:flex-row @sm:justify-end">
                    <Dialog.CloseTrigger as-child>
                      <Button v-focus-on-mount type="button" variant="outline">Close</Button>
                    </Dialog.CloseTrigger>
                  </div>
                </template>

                <form v-else novalidate class="grid gap-4" @submit.prevent="submit">
                  <Alert.Root v-if="error" variant="error" size="sm">
                    <Alert.Content>
                      <Alert.Title>{{ error }}</Alert.Title>
                      <Alert.Description>
                        Nothing you entered is lost. Check it and send it again.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>

                  <div class="grid gap-4 @sm:grid-cols-2">
                    <Field.Root required :invalid="missing.includes('name')" :disabled="loading">
                      <Field.Label>Name</Field.Label>
                      <Field.Input name="name" autocomplete="name" placeholder="Ada Lovelace" />
                      <Field.ErrorText>Enter your name.</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required :invalid="missing.includes('email')" :disabled="loading">
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

                  <Field.Root :disabled="loading">
                    <Field.Label>Company</Field.Label>
                    <Field.Input name="company" autocomplete="organization" placeholder="Acme" />
                  </Field.Root>

                  <Field.Root :disabled="loading">
                    <Field.Label>Message</Field.Label>
                    <Field.Textarea
                      name="message"
                      placeholder="What would you like to talk about?"
                    />
                  </Field.Root>

                  <div class="flex flex-col-reverse gap-2 @sm:flex-row @sm:justify-end">
                    <Dialog.CloseTrigger as-child>
                      <Button type="button" variant="outline">Cancel</Button>
                    </Dialog.CloseTrigger>
                    <Button type="submit" :disabled="loading" :aria-busy="loading">
                      <template v-if="loading">
                        <span
                          aria-hidden="true"
                          class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                        />
                        Sending
                      </template>
                      <template v-else>Send message</template>
                    </Button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </div>
    </div>
  </section>
</template>
