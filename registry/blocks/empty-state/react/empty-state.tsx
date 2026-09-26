import { Button, Skeleton } from "@moderno-ui/react";

export type EmptyStateIcon = "folder" | "search" | "inbox";

const iconPaths: Record<EmptyStateIcon | "error", string[]> = {
  folder: [
    "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
    "M12 10v6",
    "M9 13h6",
  ],
  search: ["M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z", "m21 21-4.3-4.3"],
  inbox: [
    "M22 12h-6l-2 3h-4l-2-3H2",
    "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z",
  ],
  error: ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z", "M12 8v4", "M12 16h.01"],
};

function Glyph({ icon }: { icon: EmptyStateIcon | "error" }) {
  return (
    <svg
      className="size-5 @md:size-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[icon].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export interface EmptyStateProps {
  icon?: EmptyStateIcon;
  title?: string;
  description?: string;
  primaryAction?: string;
  secondaryAction?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onRetry?: () => void;
}

export function EmptyState({
  icon = "folder",
  title = "No projects yet",
  description = "Projects keep your documents, tasks and teammates in one place. Create one to get started.",
  primaryAction = "New project",
  secondaryAction = "Import",
  error,
  loading = false,
  disabled = false,
  onPrimaryAction,
  onSecondaryAction,
  onRetry,
}: EmptyStateProps) {
  const hasActions = Boolean(error || primaryAction || secondaryAction);

  return (
    <section className="@container moderno-block-empty-state text-foreground">
      {loading ? (
        <div
          role="status"
          aria-busy="true"
          className="grid justify-items-center gap-4 px-4 py-8 @lg:py-16"
        >
          <Skeleton aria-hidden="true" shape="rect" className="size-10 @md:size-12" />
          <div aria-hidden="true" className="grid w-full max-w-sm justify-items-center gap-2">
            <Skeleton shape="text" className="w-1/2" />
            <Skeleton shape="text" className="w-3/4" />
          </div>
          <Skeleton aria-hidden="true" shape="rect" className="h-9 w-32" />
          <span className="sr-only">Loading…</span>
        </div>
      ) : (
        <div className="grid justify-items-center gap-4 px-4 py-8 text-center @lg:py-16">
          <div
            className={
              error
                ? "grid size-10 place-items-center rounded-lg border border-border bg-muted text-destructive @md:size-12"
                : "grid size-10 place-items-center rounded-lg border border-border bg-muted text-muted-foreground @md:size-12"
            }
          >
            <Glyph icon={error ? "error" : icon} />
          </div>

          <div role={error ? "alert" : undefined} className="grid max-w-sm gap-1">
            <h2 className="text-body-lg font-semibold @md:text-heading-sm">{error || title}</h2>
            {error ? (
              <p className="text-ui-md text-muted-foreground">
                Nothing was lost. Check your connection, then try again.
              </p>
            ) : description ? (
              <p className="text-ui-md text-muted-foreground">{description}</p>
            ) : null}
          </div>

          {hasActions ? (
            <div className="mt-2 grid w-full gap-2 @sm:flex @sm:w-auto @sm:justify-center @sm:gap-3">
              {error ? (
                <Button type="button" disabled={disabled} onClick={onRetry}>
                  Try again
                </Button>
              ) : (
                <>
                  {primaryAction ? (
                    <Button type="button" disabled={disabled} onClick={onPrimaryAction}>
                      {primaryAction}
                    </Button>
                  ) : null}
                  {secondaryAction ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={disabled}
                      onClick={onSecondaryAction}
                    >
                      {secondaryAction}
                    </Button>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
