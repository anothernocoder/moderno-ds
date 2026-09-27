import { createSignal, createUniqueId, For, Show } from "solid-js";
import { Alert, Badge, Button, Card, Dialog, Field, Portal, Skeleton } from "@moderno-ui/solid";

export type ModalActionTone = "default" | "destructive";

export interface ModalActionField {
  label: string;
  defaultValue?: string;
  placeholder?: string;
}

export interface ModalAction {
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

export interface ModalActionsProps {
  actions?: ModalAction[];
  heading?: string;
  description?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onConfirm?: (id: string, value?: string) => void;
  onRetry?: () => void;
}

export function ModalActions(props: ModalActionsProps) {
  const uid = createUniqueId();
  const [openId, setOpenId] = createSignal<string | null>(null);
  const [invalid, setInvalid] = createSignal(false);
  const actions = () => props.actions ?? sampleActions;
  const heading = () => props.heading ?? "Workspace";
  const description = () =>
    props.description ?? "Each action asks you to confirm before anything changes.";
  const inert = () => Boolean(props.loading) || Boolean(props.disabled);
  const showRows = () => !props.error && !props.loading && actions().length > 0;
  const descriptionId = (id: string) => `${uid}-${id}-description`;

  function openChange(id: string, open: boolean) {
    setInvalid(false);
    setOpenId(open ? id : null);
  }

  function confirm(id: string, value?: string) {
    props.onConfirm?.(id, value);
    setOpenId(null);
  }

  function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }, id: string) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("value") ?? "").trim();
    if (!value) {
      setInvalid(true);
      event.currentTarget.querySelector("input")?.focus();
      return;
    }
    confirm(id, value);
  }

  return (
    <section class="@container moderno-block-modal-actions text-foreground">
      <div class="grid gap-4 @lg:grid-cols-3 @lg:gap-8">
        <div class="grid content-start gap-1">
          <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading()}</h2>
          <Show when={description()}>
            <p class="text-ui-md text-muted-foreground">{description()}</p>
          </Show>
        </div>

        <Card.Root class="@lg:col-span-2">
          <Card.Content class="gap-0 p-4 @sm:p-6">
            <Show when={props.error}>
              {(message) => (
                <Alert.Root variant="error">
                  <Alert.Content>
                    <Alert.Title>{message()}</Alert.Title>
                    <Alert.Description>
                      Nothing was changed. Try loading them again.
                    </Alert.Description>
                    <Alert.Action>
                      <Button type="button" variant="outline" size="sm" onClick={props.onRetry}>
                        Try again
                      </Button>
                    </Alert.Action>
                  </Alert.Content>
                </Alert.Root>
              )}
            </Show>

            <Show when={props.loading}>
              <div role="status" aria-busy="true" class="grid">
                <For each={placeholders}>
                  {() => (
                    <div
                      aria-hidden="true"
                      class="grid justify-items-start gap-3 py-4 first:pt-0 last:pb-0 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6"
                    >
                      <div class="grid w-full gap-2">
                        <Skeleton shape="text" class="w-1/3" />
                        <Skeleton shape="text" class="w-2/3" />
                      </div>
                      <Skeleton shape="rect" class="h-8 w-20 shrink-0" />
                    </div>
                  )}
                </For>
                <span class="sr-only">Loading actions…</span>
              </div>
            </Show>

            <Show when={!props.error && !props.loading && actions().length === 0}>
              <div class="grid gap-1 py-4 text-center">
                <p class="text-ui-md font-medium">No actions yet</p>
                <p class="text-ui-md text-muted-foreground">
                  Actions added to this list show up here.
                </p>
              </div>
            </Show>

            <Show when={showRows()}>
              <ul class="divide-y divide-border">
                <For each={actions()}>
                  {(action) => {
                    const destructive = () => action.tone === "destructive";
                    return (
                      <li class="py-4 first:pt-0 last:pb-0">
                        <div class="grid justify-items-start gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6">
                          <div class="grid gap-1">
                            <div class="flex flex-wrap items-center gap-2">
                              <p class="text-ui-md font-medium">{action.title}</p>
                              <Show when={destructive()}>
                                <Badge variant="error" size="sm">
                                  Irreversible
                                </Badge>
                              </Show>
                            </div>
                            <p
                              id={descriptionId(action.id)}
                              class="text-ui-md text-muted-foreground"
                            >
                              {action.description}
                            </p>
                          </div>

                          <Dialog.Root
                            lazyMount
                            unmountOnExit
                            role={destructive() ? "alertdialog" : "dialog"}
                            open={openId() === action.id}
                            onOpenChange={({ open }) => openChange(action.id, open)}
                          >
                            <Dialog.Trigger
                              asChild={(triggerProps) => (
                                <Button
                                  {...triggerProps()}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  class="shrink-0"
                                  disabled={inert()}
                                  aria-describedby={descriptionId(action.id)}
                                >
                                  {action.trigger}
                                </Button>
                              )}
                            />
                            <Portal>
                              <Dialog.Backdrop />
                              <Dialog.Positioner>
                                <Dialog.Content class="@container">
                                  <Dialog.Title>{action.dialogTitle}</Dialog.Title>
                                  <Dialog.Description>
                                    {action.dialogDescription}
                                  </Dialog.Description>
                                  <Show
                                    when={action.field}
                                    fallback={
                                      <div class="flex flex-col-reverse gap-2 @sm:flex-row @sm:justify-end">
                                        <Dialog.CloseTrigger
                                          asChild={(closeProps) => (
                                            <Button
                                              {...closeProps()}
                                              type="button"
                                              variant="outline"
                                            >
                                              Cancel
                                            </Button>
                                          )}
                                        />
                                        <Button
                                          type="button"
                                          variant={destructive() ? "destructive" : "primary"}
                                          onClick={() => confirm(action.id)}
                                        >
                                          {action.confirm}
                                        </Button>
                                      </div>
                                    }
                                  >
                                    {(field) => (
                                      <form
                                        novalidate
                                        class="grid gap-4"
                                        onSubmit={(event) => submit(event, action.id)}
                                      >
                                        <Field.Root required invalid={invalid()}>
                                          <Field.Label>{field().label}</Field.Label>
                                          <Field.Input
                                            name="value"
                                            value={field().defaultValue ?? ""}
                                            placeholder={field().placeholder}
                                          />
                                          <Field.ErrorText>
                                            Enter a value to continue.
                                          </Field.ErrorText>
                                        </Field.Root>
                                        <div class="flex flex-col-reverse gap-2 @sm:flex-row @sm:justify-end">
                                          <Dialog.CloseTrigger
                                            asChild={(closeProps) => (
                                              <Button
                                                {...closeProps()}
                                                type="button"
                                                variant="outline"
                                              >
                                                Cancel
                                              </Button>
                                            )}
                                          />
                                          <Button
                                            type="submit"
                                            variant={destructive() ? "destructive" : "primary"}
                                          >
                                            {action.confirm}
                                          </Button>
                                        </div>
                                      </form>
                                    )}
                                  </Show>
                                </Dialog.Content>
                              </Dialog.Positioner>
                            </Portal>
                          </Dialog.Root>
                        </div>
                      </li>
                    );
                  }}
                </For>
              </ul>
            </Show>
          </Card.Content>
        </Card.Root>
      </div>
    </section>
  );
}
