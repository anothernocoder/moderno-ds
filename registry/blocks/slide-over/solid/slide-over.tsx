import { createSignal, For, Show } from "solid-js";
import { Alert, Button, Drawer, Field, Portal } from "@moderno-ui/solid";

export interface SlideOverRecord {
  name: string;
  email: string;
  role: string;
  notes: string;
}

type RequiredField = "name" | "email";

const requiredFields: RequiredField[] = ["name", "email"];

const sampleRecord: SlideOverRecord = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  role: "Engineering lead",
  notes: "Leads the payments team. Prefers email to calls.",
};

export interface SlideOverProps {
  record?: SlideOverRecord;
  open?: boolean;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (record: SlideOverRecord) => void;
}

export function SlideOver(props: SlideOverProps) {
  const [ownOpen, setOwnOpen] = createSignal(false);
  const [missing, setMissing] = createSignal<RequiredField[]>([]);
  const record = () => props.record ?? sampleRecord;
  const loading = () => Boolean(props.loading);
  const details = () => [
    { term: "Role", value: record().role },
    { term: "Notes", value: record().notes },
  ];

  function openChange(next: boolean) {
    setMissing([]);
    setOwnOpen(next);
    props.onOpenChange?.(next);
  }

  function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (name: keyof SlideOverRecord) => String(data.get(name) ?? "").trim();
    const next: SlideOverRecord = {
      name: read("name"),
      email: read("email"),
      role: read("role"),
      notes: read("notes"),
    };
    const empty = requiredFields.filter((name) => !next[name]);
    setMissing(empty);
    if (empty.length > 0) {
      form.querySelector<HTMLElement>(`[name="${empty[0]}"]`)?.focus();
      return;
    }
    props.onSave?.(next);
  }

  return (
    <section class="@container moderno-block-slide-over text-foreground">
      <div class="px-4 py-12 @lg:py-16">
        <div class="mx-auto grid w-full max-w-lg gap-6 rounded-lg border border-border p-6 @sm:p-8">
          <div class="grid gap-4 @lg:grid-cols-[minmax(0,1fr)_auto] @lg:items-center @lg:gap-10">
            <div class="grid gap-1">
              <h2 class="font-serif text-heading-sm text-balance @md:text-heading">
                {record().name}
              </h2>
              <p class="text-body break-words text-muted-foreground">{record().email}</p>
            </div>

            <Drawer.Root
              lazyMount
              unmountOnExit
              open={props.open ?? ownOpen()}
              onOpenChange={(details) => openChange(details.open)}
            >
              <Drawer.Trigger
                asChild={(triggerProps) => (
                  <Button
                    {...triggerProps()}
                    type="button"
                    variant="outline"
                    class="@sm:justify-self-start"
                    disabled={props.disabled}
                  >
                    Edit details
                  </Button>
                )}
              />
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

                    <form novalidate class="flex flex-1 flex-col gap-4" onSubmit={submit}>
                      <Show when={props.error}>
                        {(message) => (
                          <Alert.Root variant="error" size="sm">
                            <Alert.Content>
                              <Alert.Title>{message()}</Alert.Title>
                              <Alert.Description>
                                Nothing you entered is lost. Check it and save again.
                              </Alert.Description>
                            </Alert.Content>
                          </Alert.Root>
                        )}
                      </Show>

                      <Field.Root
                        required
                        invalid={missing().includes("name")}
                        disabled={loading()}
                      >
                        <Field.Label>Name</Field.Label>
                        <Field.Input name="name" autocomplete="name" value={record().name} />
                        <Field.ErrorText>Enter a name.</Field.ErrorText>
                      </Field.Root>

                      <Field.Root
                        required
                        invalid={missing().includes("email")}
                        disabled={loading()}
                      >
                        <Field.Label>Email</Field.Label>
                        <Field.Input
                          name="email"
                          type="email"
                          autocomplete="email"
                          value={record().email}
                        />
                        <Field.ErrorText>Enter an email.</Field.ErrorText>
                      </Field.Root>

                      <Field.Root disabled={loading()}>
                        <Field.Label>Role</Field.Label>
                        <Field.Input
                          name="role"
                          autocomplete="organization-title"
                          value={record().role}
                        />
                      </Field.Root>

                      <Field.Root disabled={loading()}>
                        <Field.Label>Notes</Field.Label>
                        <Field.Textarea name="notes" value={record().notes} />
                      </Field.Root>

                      <div class="mt-auto flex justify-end gap-2 border-t border-border pt-4">
                        <Drawer.CloseTrigger
                          asChild={(closeProps) => (
                            <Button {...closeProps()} type="button" variant="outline">
                              Cancel
                            </Button>
                          )}
                        />
                        <Button type="submit" disabled={loading()} aria-busy={loading()}>
                          <Show when={loading()} fallback="Save changes">
                            <span
                              aria-hidden="true"
                              class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                            />
                            Saving
                          </Show>
                        </Button>
                      </div>
                    </form>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>
          </div>

          <dl class="grid gap-4 border-t border-border pt-6 @sm:grid-cols-[auto_minmax(0,1fr)] @sm:gap-x-8">
            <For each={details()}>
              {(detail) => (
                <div class="grid gap-y-1 @sm:col-span-2 @sm:grid-cols-subgrid @sm:items-baseline">
                  <dt class="text-ui-md text-muted-foreground">{detail.term}</dt>
                  <dd
                    class={
                      detail.value ? "text-body break-words" : "text-body text-muted-foreground"
                    }
                  >
                    {detail.value || "Not added"}
                  </dd>
                </div>
              )}
            </For>
          </dl>
        </div>
      </div>
    </section>
  );
}
