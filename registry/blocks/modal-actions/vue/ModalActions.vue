<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { Alert, Badge, Button, Card, Dialog, Field, Portal, Skeleton } from "@moderno-ui/vue";

type ModalActionTone = "default" | "destructive";

interface ModalActionField {
  label: string;
  defaultValue?: string;
  placeholder?: string;
}

interface ModalAction {
  id: string;
  title: string;
  description: string;
  trigger: string;
  dialogTitle: string;
  dialogDescription: string;
  confirm: string;
  tone?: ModalActionTone;
  field?: ModalActionField;
}

const sampleActions: ModalAction[] = [
  {
    id: "rename",
    title: "Workspace name",
    description: "Shown in the sidebar and on every invite.",
    trigger: "Rename",
    dialogTitle: "Rename workspace",
    dialogDescription: "The new name shows for everyone in the workspace at once.",
    confirm: "Save",
    field: { label: "Workspace name", defaultValue: "Acme" },
  },
  {
    id: "export",
    title: "Export data",
    description: "Download every document and comment as one archive.",
    trigger: "Export",
    dialogTitle: "Export your data?",
    dialogDescription: "We will email you a link to the archive when it is ready.",
    confirm: "Export",
  },
  {
    id: "delete",
    title: "Delete workspace",
    description: "Remove the workspace, its documents and its members for good.",
    trigger: "Delete",
    dialogTitle: "Delete this workspace?",
    dialogDescription: "Every document, comment and member goes with it. This cannot be undone.",
    confirm: "Delete workspace",
    tone: "destructive",
  },
];

const placeholders = ["first", "second", "third"];

const props = withDefaults(
  defineProps<{
    actions?: ModalAction[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    actions: undefined,
    heading: "Workspace",
    description: "Each action asks you to confirm before anything changes.",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  confirm: [id: string, value?: string];
  retry: [];
}>();

const uid = useId();

const openId = ref<string | null>(null);
const invalid = ref(false);

// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const resolvedActions = computed(() => props.actions ?? sampleActions);

const inert = computed(() => props.loading || props.disabled);
const showRows = computed(() => !props.error && !props.loading && resolvedActions.value.length > 0);

const descriptionId = (id: string) => `${uid}-${id}-description`;

function openChange(id: string, open: boolean) {
  invalid.value = false;
  openId.value = open ? id : null;
}

function confirm(id: string, value?: string) {
  emit("confirm", id, value);
  openId.value = null;
}

function submit(event: Event, id: string) {
  const form = event.currentTarget as HTMLFormElement;
  const value = String(new FormData(form).get("value") ?? "").trim();
  if (!value) {
    invalid.value = true;
    form.querySelector("input")?.focus();
    return;
  }
  confirm(id, value);
}
</script>

<template>
  <section class="@container moderno-block-modal-actions text-foreground">
    <div class="grid gap-4 @lg:grid-cols-3 @lg:gap-8">
      <div class="grid content-start gap-1">
        <h2 class="text-body-lg font-semibold @md:text-heading-sm">{{ heading }}</h2>
        <p v-if="description" class="text-ui-md text-muted-foreground">{{ description }}</p>
      </div>

      <Card.Root class="@lg:col-span-2">
        <Card.Content class="gap-0 p-4 @sm:p-6">
          <Alert.Root v-if="error" variant="error">
            <Alert.Content>
              <Alert.Title>{{ error }}</Alert.Title>
              <Alert.Description>Nothing was changed. Try loading them again.</Alert.Description>
              <Alert.Action>
                <Button type="button" variant="outline" size="sm" @click="emit('retry')">
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>

          <div v-if="loading" role="status" aria-busy="true" class="grid">
            <div
              v-for="key in placeholders"
              :key="key"
              aria-hidden="true"
              class="grid justify-items-start gap-3 py-4 first:pt-0 last:pb-0 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6"
            >
              <div class="grid w-full gap-2">
                <Skeleton shape="text" class="w-1/3" />
                <Skeleton shape="text" class="w-2/3" />
              </div>
              <Skeleton shape="rect" class="h-8 w-20 shrink-0" />
            </div>
            <span class="sr-only">Loading actions…</span>
          </div>

          <div
            v-if="!error && !loading && resolvedActions.length === 0"
            class="grid gap-1 py-4 text-center"
          >
            <p class="text-ui-md font-medium">No actions yet</p>
            <p class="text-ui-md text-muted-foreground">Actions added to this list show up here.</p>
          </div>

          <ul v-if="showRows" class="divide-y divide-border">
            <li
              v-for="action in resolvedActions"
              :key="action.id"
              class="py-4 first:pt-0 last:pb-0"
            >
              <div
                class="grid justify-items-start gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6"
              >
                <div class="grid gap-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-ui-md font-medium">{{ action.title }}</p>
                    <Badge v-if="action.tone === 'destructive'" variant="error" size="sm">
                      Irreversible
                    </Badge>
                  </div>
                  <p :id="descriptionId(action.id)" class="text-ui-md text-muted-foreground">
                    {{ action.description }}
                  </p>
                </div>

                <Dialog.Root
                  lazy-mount
                  unmount-on-exit
                  :role="action.tone === 'destructive' ? 'alertdialog' : 'dialog'"
                  :open="openId === action.id"
                  @open-change="({ open }) => openChange(action.id, open)"
                >
                  <Dialog.Trigger as-child>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      class="shrink-0"
                      :disabled="inert"
                      :aria-describedby="descriptionId(action.id)"
                    >
                      {{ action.trigger }}
                    </Button>
                  </Dialog.Trigger>
                  <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                      <Dialog.Content class="@container">
                        <Dialog.Title>{{ action.dialogTitle }}</Dialog.Title>
                        <Dialog.Description>{{ action.dialogDescription }}</Dialog.Description>
                        <form
                          v-if="action.field"
                          novalidate
                          class="grid gap-4"
                          @submit.prevent="submit($event, action.id)"
                        >
                          <Field.Root required :invalid="invalid">
                            <Field.Label>{{ action.field.label }}</Field.Label>
                            <Field.Input
                              name="value"
                              :value="action.field.defaultValue"
                              :placeholder="action.field.placeholder"
                            />
                            <Field.ErrorText>Enter a value to continue.</Field.ErrorText>
                          </Field.Root>
                          <div class="flex flex-col-reverse gap-2 @sm:flex-row @sm:justify-end">
                            <Dialog.CloseTrigger as-child>
                              <Button type="button" variant="outline">Cancel</Button>
                            </Dialog.CloseTrigger>
                            <Button
                              type="submit"
                              :variant="action.tone === 'destructive' ? 'destructive' : 'primary'"
                            >
                              {{ action.confirm }}
                            </Button>
                          </div>
                        </form>
                        <div
                          v-else
                          class="flex flex-col-reverse gap-2 @sm:flex-row @sm:justify-end"
                        >
                          <Dialog.CloseTrigger as-child>
                            <Button type="button" variant="outline">Cancel</Button>
                          </Dialog.CloseTrigger>
                          <Button
                            type="button"
                            :variant="action.tone === 'destructive' ? 'destructive' : 'primary'"
                            @click="confirm(action.id)"
                          >
                            {{ action.confirm }}
                          </Button>
                        </div>
                      </Dialog.Content>
                    </Dialog.Positioner>
                  </Portal>
                </Dialog.Root>
              </div>
            </li>
          </ul>
        </Card.Content>
      </Card.Root>
    </div>
  </section>
</template>
