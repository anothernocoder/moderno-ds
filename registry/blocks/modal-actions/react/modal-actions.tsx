import { useId, useState, type FormEvent } from "react";
import { Alert, Badge, Button, Card, Dialog, Field, Portal, Skeleton } from "@moderno-ui/react";

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

export function ModalActions({
  actions = sampleActions,
  heading = "Workspace",
  description = "Each action asks you to confirm before anything changes.",
  error,
  loading = false,
  disabled = false,
  onConfirm,
  onRetry,
}: ModalActionsProps) {
  const uid = useId();
  const [openId, setOpenId] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const inert = loading || disabled;
  const showRows = !error && !loading && actions.length > 0;

  function openChange(id: string, open: boolean) {
    setInvalid(false);
    setOpenId(open ? id : null);
  }

  function confirm(id: string, value?: string) {
    onConfirm?.(id, value);
    setOpenId(null);
  }

  function submit(event: FormEvent<HTMLFormElement>, id: string) {
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
    <section className="@container moderno-block-modal-actions text-foreground">
      <div className="grid gap-4 @lg:grid-cols-3 @lg:gap-8">
        <div className="grid content-start gap-1">
          <h2 className="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
          {description ? <p className="text-ui-md text-muted-foreground">{description}</p> : null}
        </div>

        <Card.Root className="@lg:col-span-2">
          <Card.Content className="gap-0 p-4 @sm:p-6">
            {error ? (
              <Alert.Root variant="error">
                <Alert.Content>
                  <Alert.Title>{error}</Alert.Title>
                  <Alert.Description>
                    Nothing was changed. Try loading them again.
                  </Alert.Description>
                  <Alert.Action>
                    <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                      Try again
                    </Button>
                  </Alert.Action>
                </Alert.Content>
              </Alert.Root>
            ) : null}

            {loading ? (
              <div role="status" aria-busy="true" className="grid">
                {placeholders.map((key) => (
                  <div
                    key={key}
                    aria-hidden="true"
                    className="grid justify-items-start gap-3 py-4 first:pt-0 last:pb-0 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6"
                  >
                    <div className="grid w-full gap-2">
                      <Skeleton shape="text" className="w-1/3" />
                      <Skeleton shape="text" className="w-2/3" />
                    </div>
                    <Skeleton shape="rect" className="h-8 w-20 shrink-0" />
                  </div>
                ))}
                <span className="sr-only">Loading actions…</span>
              </div>
            ) : null}

            {!error && !loading && actions.length === 0 ? (
              <div className="grid gap-1 py-4 text-center">
                <p className="text-ui-md font-medium">No actions yet</p>
                <p className="text-ui-md text-muted-foreground">
                  Actions added to this list show up here.
                </p>
              </div>
            ) : null}

            {showRows ? (
              <ul className="divide-y divide-border">
                {actions.map((action) => {
                  const descriptionId = `${uid}-${action.id}-description`;
                  const destructive = action.tone === "destructive";
                  return (
                    <li key={action.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="grid justify-items-start gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6">
                        <div className="grid gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-ui-md font-medium">{action.title}</p>
                            {destructive ? (
                              <Badge variant="error" size="sm">
                                Irreversible
                              </Badge>
                            ) : null}
                          </div>
                          <p id={descriptionId} className="text-ui-md text-muted-foreground">
                            {action.description}
                          </p>
                        </div>

                        <Dialog.Root
                          lazyMount
                          unmountOnExit
                          role={destructive ? "alertdialog" : "dialog"}
                          open={openId === action.id}
                          onOpenChange={({ open }) => openChange(action.id, open)}
                        >
                          <Dialog.Trigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                              disabled={inert}
                              aria-describedby={descriptionId}
                            >
                              {action.trigger}
                            </Button>
                          </Dialog.Trigger>
                          <Portal>
                            <Dialog.Backdrop />
                            <Dialog.Positioner>
                              <Dialog.Content className="@container">
                                <Dialog.Title>{action.dialogTitle}</Dialog.Title>
                                <Dialog.Description>{action.dialogDescription}</Dialog.Description>
                                {action.field ? (
                                  <form
                                    noValidate
                                    className="grid gap-4"
                                    onSubmit={(event) => submit(event, action.id)}
                                  >
                                    <Field.Root required invalid={invalid}>
                                      <Field.Label>{action.field.label}</Field.Label>
                                      <Field.Input
                                        name="value"
                                        defaultValue={action.field.defaultValue}
                                        placeholder={action.field.placeholder}
                                      />
                                      <Field.ErrorText>Enter a value to continue.</Field.ErrorText>
                                    </Field.Root>
                                    <div className="flex flex-col-reverse gap-2 @sm:flex-row @sm:justify-end">
                                      <Dialog.CloseTrigger asChild>
                                        <Button type="button" variant="outline">
                                          Cancel
                                        </Button>
                                      </Dialog.CloseTrigger>
                                      <Button
                                        type="submit"
                                        variant={destructive ? "destructive" : "primary"}
                                      >
                                        {action.confirm}
                                      </Button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="flex flex-col-reverse gap-2 @sm:flex-row @sm:justify-end">
                                    <Dialog.CloseTrigger asChild>
                                      <Button type="button" variant="outline">
                                        Cancel
                                      </Button>
                                    </Dialog.CloseTrigger>
                                    <Button
                                      type="button"
                                      variant={destructive ? "destructive" : "primary"}
                                      onClick={() => confirm(action.id)}
                                    >
                                      {action.confirm}
                                    </Button>
                                  </div>
                                )}
                              </Dialog.Content>
                            </Dialog.Positioner>
                          </Portal>
                        </Dialog.Root>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </Card.Content>
        </Card.Root>
      </div>
    </section>
  );
}
