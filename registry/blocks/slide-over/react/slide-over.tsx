import { useState, type FormEvent } from "react";
import { Alert, Button, Drawer, Field, Portal } from "@moderno-ui/react";

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

export function SlideOver({
  record = sampleRecord,
  open,
  error,
  loading = false,
  disabled = false,
  onOpenChange,
  onSave,
}: SlideOverProps) {
  const [ownOpen, setOwnOpen] = useState(false);
  const [missing, setMissing] = useState<RequiredField[]>([]);
  const details = [
    { term: "Role", value: record.role },
    { term: "Notes", value: record.notes },
  ];

  function openChange(next: boolean) {
    setMissing([]);
    setOwnOpen(next);
    onOpenChange?.(next);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
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
    onSave?.(next);
  }

  return (
    <section className="@container moderno-block-slide-over text-foreground">
      <div className="px-4 py-12 @lg:py-16">
        <div className="mx-auto grid w-full max-w-lg gap-6 rounded-lg border border-border p-6 @sm:p-8">
          <div className="grid gap-4 @lg:grid-cols-[minmax(0,1fr)_auto] @lg:items-center @lg:gap-10">
            <div className="grid gap-1">
              <h2 className="font-serif text-heading-sm text-balance @md:text-heading">
                {record.name}
              </h2>
              <p className="text-body break-words text-muted-foreground">{record.email}</p>
            </div>

            <Drawer.Root
              lazyMount
              unmountOnExit
              open={open ?? ownOpen}
              onOpenChange={(e) => openChange(e.open)}
            >
              <Drawer.Trigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="@sm:justify-self-start"
                  disabled={disabled}
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
                      Update this person&apos;s profile. Nothing changes until you save.
                    </Drawer.Description>
                    <Drawer.CloseTrigger aria-label="Close">
                      <span aria-hidden="true">×</span>
                    </Drawer.CloseTrigger>

                    <form noValidate className="flex flex-1 flex-col gap-4" onSubmit={submit}>
                      {error ? (
                        <Alert.Root variant="error" size="sm">
                          <Alert.Content>
                            <Alert.Title>{error}</Alert.Title>
                            <Alert.Description>
                              Nothing you entered is lost. Check it and save again.
                            </Alert.Description>
                          </Alert.Content>
                        </Alert.Root>
                      ) : null}

                      <Field.Root required invalid={missing.includes("name")} disabled={loading}>
                        <Field.Label>Name</Field.Label>
                        <Field.Input name="name" autoComplete="name" defaultValue={record.name} />
                        <Field.ErrorText>Enter a name.</Field.ErrorText>
                      </Field.Root>

                      <Field.Root required invalid={missing.includes("email")} disabled={loading}>
                        <Field.Label>Email</Field.Label>
                        <Field.Input
                          name="email"
                          type="email"
                          autoComplete="email"
                          defaultValue={record.email}
                        />
                        <Field.ErrorText>Enter an email.</Field.ErrorText>
                      </Field.Root>

                      <Field.Root disabled={loading}>
                        <Field.Label>Role</Field.Label>
                        <Field.Input
                          name="role"
                          autoComplete="organization-title"
                          defaultValue={record.role}
                        />
                      </Field.Root>

                      <Field.Root disabled={loading}>
                        <Field.Label>Notes</Field.Label>
                        <Field.Textarea name="notes" defaultValue={record.notes} />
                      </Field.Root>

                      <div className="mt-auto flex justify-end gap-2 border-t border-border pt-4">
                        <Drawer.CloseTrigger asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </Drawer.CloseTrigger>
                        <Button type="submit" disabled={loading} aria-busy={loading}>
                          {loading ? (
                            <>
                              <span
                                aria-hidden="true"
                                className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                              />
                              Saving
                            </>
                          ) : (
                            "Save changes"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>
          </div>

          <dl className="grid gap-4 border-t border-border pt-6 @sm:grid-cols-[auto_minmax(0,1fr)] @sm:gap-x-8">
            {details.map(({ term, value }) => (
              <div
                key={term}
                className="grid gap-y-1 @sm:col-span-2 @sm:grid-cols-subgrid @sm:items-baseline"
              >
                <dt className="text-ui-md text-muted-foreground">{term}</dt>
                <dd className={value ? "text-body break-words" : "text-body text-muted-foreground"}>
                  {value || "Not added"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
