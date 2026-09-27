<script lang="ts">
  import { Alert, Badge, Button, Card, Dialog, Field, Portal, Skeleton } from "@moderno-ui/svelte";

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

  interface Props {
    actions?: ModalAction[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onconfirm?: (id: string, value?: string) => void;
    onretry?: () => void;
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

  let {
    actions = sampleActions,
    heading = "Workspace",
    description = "Each action asks you to confirm before anything changes.",
    error,
    loading = false,
    disabled = false,
    onconfirm,
    onretry,
  }: Props = $props();

  const uid = $props.id();

  let openId = $state<string | null>(null);
  let invalid = $state(false);

  const inert = $derived(loading || disabled);
  const showRows = $derived(!error && !loading && actions.length > 0);

  const descriptionId = (id: string) => `${uid}-${id}-description`;

  function openChange(id: string, open: boolean) {
    invalid = false;
    openId = open ? id : null;
  }

  function confirm(id: string, value?: string) {
    onconfirm?.(id, value);
    openId = null;
  }

  function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }, id: string) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("value") ?? "").trim();
    if (!value) {
      invalid = true;
      event.currentTarget.querySelector("input")?.focus();
      return;
    }
    confirm(id, value);
  }
</script>

<section class="@container moderno-block-modal-actions text-foreground">
  <div class="grid gap-4 @lg:grid-cols-3 @lg:gap-8">
    <div class="grid content-start gap-1">
      <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
      {#if description}
        <p class="text-ui-md text-muted-foreground">{description}</p>
      {/if}
    </div>

    <Card.Root class="@lg:col-span-2">
      <Card.Content class="gap-0 p-4 @sm:p-6">
        {#if error}
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>Nothing was changed. Try loading them again.</Alert.Description>
              <Alert.Action>
                <Button type="button" variant="outline" size="sm" onclick={onretry}>Try again</Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        {/if}

        {#if loading}
          <div role="status" aria-busy="true" class="grid">
            {#each placeholders as key (key)}
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
            {/each}
            <span class="sr-only">Loading actions…</span>
          </div>
        {/if}

        {#if !error && !loading && actions.length === 0}
          <div class="grid gap-1 py-4 text-center">
            <p class="text-ui-md font-medium">No actions yet</p>
            <p class="text-ui-md text-muted-foreground">Actions added to this list show up here.</p>
          </div>
        {/if}

        {#if showRows}
          <ul class="divide-y divide-border">
            {#each actions as action (action.id)}
              {@const destructive = action.tone === "destructive"}
              <li class="py-4 first:pt-0 last:pb-0">
                <div
                  class="grid justify-items-start gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6"
                >
                  <div class="grid gap-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="text-ui-md font-medium">{action.title}</p>
                      {#if destructive}
                        <Badge variant="error" size="sm">Irreversible</Badge>
                      {/if}
                    </div>
                    <p id={descriptionId(action.id)} class="text-ui-md text-muted-foreground">
                      {action.description}
                    </p>
                  </div>

                  <Dialog.Root
                    lazyMount
                    unmountOnExit
                    role={destructive ? "alertdialog" : "dialog"}
                    bind:open={() => openId === action.id, (open) => openChange(action.id, open)}
                  >
                    <Dialog.Trigger>
                      {#snippet asChild(triggerProps)}
                        <Button
                          {...triggerProps()}
                          type="button"
                          variant="outline"
                          size="sm"
                          class="shrink-0"
                          disabled={inert}
                          aria-describedby={descriptionId(action.id)}
                        >
                          {action.trigger}
                        </Button>
                      {/snippet}
                    </Dialog.Trigger>
                    <Portal>
                      <Dialog.Backdrop />
                      <Dialog.Positioner>
                        <Dialog.Content class="@container">
                          <Dialog.Title>{action.dialogTitle}</Dialog.Title>
                          <Dialog.Description>{action.dialogDescription}</Dialog.Description>
                          {#if action.field}
                            <form
                              novalidate
                              class="grid gap-4"
                              onsubmit={(event) => submit(event, action.id)}
                            >
                              <Field.Root required {invalid}>
                                <Field.Label>{action.field.label}</Field.Label>
                                <Field.Input
                                  name="value"
                                  value={action.field.defaultValue}
                                  placeholder={action.field.placeholder}
                                />
                                <Field.ErrorText>Enter a value to continue.</Field.ErrorText>
                              </Field.Root>
                              <div class="flex flex-col-reverse gap-2 @sm:flex-row @sm:justify-end">
                                <Dialog.CloseTrigger>
                                  {#snippet asChild(closeProps)}
                                    <Button {...closeProps()} type="button" variant="outline">Cancel</Button>
                                  {/snippet}
                                </Dialog.CloseTrigger>
                                <Button type="submit" variant={destructive ? "destructive" : "primary"}>
                                  {action.confirm}
                                </Button>
                              </div>
                            </form>
                          {:else}
                            <div class="flex flex-col-reverse gap-2 @sm:flex-row @sm:justify-end">
                              <Dialog.CloseTrigger>
                                {#snippet asChild(closeProps)}
                                  <Button {...closeProps()} type="button" variant="outline">Cancel</Button>
                                {/snippet}
                              </Dialog.CloseTrigger>
                              <Button
                                type="button"
                                variant={destructive ? "destructive" : "primary"}
                                onclick={() => confirm(action.id)}
                              >
                                {action.confirm}
                              </Button>
                            </div>
                          {/if}
                        </Dialog.Content>
                      </Dialog.Positioner>
                    </Portal>
                  </Dialog.Root>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
</section>
