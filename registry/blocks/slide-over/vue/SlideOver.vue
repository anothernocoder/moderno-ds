<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { Alert, Button, Drawer, Field, Portal } from "@moderno-ui/vue";

interface SlideOverRecord {
  name: string;
  email: string;
  role: string;
  notes: string;
}

type RequiredField = "name" | "email";

const requiredFields: RequiredField[] = ["name", "email"];

const props = withDefaults(
  defineProps<{
    record?: SlideOverRecord;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    record: () => ({
      name: "Ada Lovelace",
      email: "ada@example.com",
      role: "Engineering lead",
      notes: "Leads the payments team. Prefers email to calls.",
    }),
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{ save: [record: SlideOverRecord] }>();

const missing = ref<RequiredField[]>([]);
const draft = reactive<SlideOverRecord>({ ...props.record });

const details = computed(() => [
  { term: "Role", value: props.record.role },
  { term: "Notes", value: props.record.notes },
]);

watch(open, (isOpen) => {
  if (!isOpen) return;
  missing.value = [];
  Object.assign(draft, props.record);
});

function submit(event: Event) {
  const form = event.currentTarget as HTMLFormElement;
  const next: SlideOverRecord = {
    name: draft.name.trim(),
    email: draft.email.trim(),
    role: draft.role.trim(),
    notes: draft.notes.trim(),
  };
  const empty = requiredFields.filter((name) => !next[name]);
  missing.value = empty;
  if (empty.length > 0) {
    form.querySelector<HTMLElement>(`[name="${empty[0]}"]`)?.focus();
    return;
  }
  emit("save", next);
}
</script>

<template>
  <section class="@container moderno-block-slide-over text-foreground">
    <div class="px-4 py-12 @lg:py-16">
      <div class="mx-auto grid w-full max-w-lg gap-6 rounded-lg border border-border p-6 @sm:p-8">
        <div class="grid gap-4 @lg:grid-cols-[minmax(0,1fr)_auto] @lg:items-center @lg:gap-10">
          <div class="grid gap-1">
            <h2 class="font-serif text-heading-sm text-balance @md:text-heading">
              {{ record.name }}
            </h2>
            <p class="text-body break-words text-muted-foreground">{{ record.email }}</p>
          </div>

          <Drawer.Root v-model:open="open" lazy-mount unmount-on-exit>
            <Drawer.Trigger as-child>
              <Button
                type="button"
                variant="outline"
                class="@sm:justify-self-start"
                :disabled="disabled"
              >
                Edit details
              </Button>
            </Drawer.Trigger>
            <Portal>
              <Drawer.Backdrop />
              <Drawer.Positioner>
                <Drawer.Content>
                  <Drawer.Title>Edit details</Drawer.Title>
                  <Drawer.Description>
                    Update this person's profile. Nothing changes until you save.
                  </Drawer.Description>
                  <Drawer.CloseTrigger aria-label="Close">
                    <span aria-hidden="true">×</span>
                  </Drawer.CloseTrigger>

                  <form novalidate class="flex flex-1 flex-col gap-4" @submit.prevent="submit">
                    <Alert.Root v-if="error" variant="error" size="sm">
                      <Alert.Content>
                        <Alert.Title>{{ error }}</Alert.Title>
                        <Alert.Description>
                          Nothing you entered is lost. Check it and save again.
                        </Alert.Description>
                      </Alert.Content>
                    </Alert.Root>

                    <Field.Root required :invalid="missing.includes('name')" :disabled="loading">
                      <Field.Label>Name</Field.Label>
                      <Field.Input v-model="draft.name" name="name" autocomplete="name" />
                      <Field.ErrorText>Enter a name.</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required :invalid="missing.includes('email')" :disabled="loading">
                      <Field.Label>Email</Field.Label>
                      <Field.Input
                        v-model="draft.email"
                        name="email"
                        type="email"
                        autocomplete="email"
                      />
                      <Field.ErrorText>Enter an email.</Field.ErrorText>
                    </Field.Root>

                    <Field.Root :disabled="loading">
                      <Field.Label>Role</Field.Label>
                      <Field.Input
                        v-model="draft.role"
                        name="role"
                        autocomplete="organization-title"
                      />
                    </Field.Root>

                    <Field.Root :disabled="loading">
                      <Field.Label>Notes</Field.Label>
                      <Field.Textarea v-model="draft.notes" name="notes" />
                    </Field.Root>

                    <div class="mt-auto flex justify-end gap-2 border-t border-border pt-4">
                      <Drawer.CloseTrigger as-child>
                        <Button type="button" variant="outline">Cancel</Button>
                      </Drawer.CloseTrigger>
                      <Button type="submit" :disabled="loading" :aria-busy="loading">
                        <template v-if="loading">
                          <span
                            aria-hidden="true"
                            class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                          />
                          Saving
                        </template>
                        <template v-else>Save changes</template>
                      </Button>
                    </div>
                  </form>
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>
        </div>

        <dl
          class="grid gap-4 border-t border-border pt-6 @sm:grid-cols-[auto_minmax(0,1fr)] @sm:gap-x-8"
        >
          <div
            v-for="{ term, value } in details"
            :key="term"
            class="grid gap-y-1 @sm:col-span-2 @sm:grid-cols-subgrid @sm:items-baseline"
          >
            <dt class="text-ui-md text-muted-foreground">{{ term }}</dt>
            <dd :class="value ? 'text-body break-words' : 'text-body text-muted-foreground'">
              {{ value || "Not added" }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>
