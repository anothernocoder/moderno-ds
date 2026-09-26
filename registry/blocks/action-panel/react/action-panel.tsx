import { useId } from "react";
import { Alert, Button, Card, Skeleton, Switch } from "@moderno-ui/react";

export type ActionPanelVariant = "default" | "destructive";

export interface ActionPanelItem {
  id: string;
  title: string;
  description: string;
  defaultChecked?: boolean;
  action?: string;
}

const sampleItems: ActionPanelItem[] = [
  {
    id: "comments",
    title: "Comments",
    description: "Email me when someone comments on a document I own.",
    defaultChecked: true,
  },
  {
    id: "mentions",
    title: "Mentions",
    description: "Email me when a teammate mentions me.",
    defaultChecked: true,
  },
  {
    id: "digest",
    title: "Weekly digest",
    description: "A Monday summary of what changed in the workspace.",
  },
  {
    id: "export",
    title: "Export data",
    description: "Download every document and comment as one archive.",
    action: "Export",
  },
];

const placeholders = ["first", "second", "third"];

export interface ActionPanelProps {
  items?: ActionPanelItem[];
  heading?: string;
  description?: string;
  variant?: ActionPanelVariant;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onCheckedChange?: (id: string, checked: boolean) => void;
  onAction?: (id: string) => void;
  onRetry?: () => void;
}

export function ActionPanel({
  items = sampleItems,
  heading = "Workspace settings",
  description = "Changes apply as soon as you make them.",
  variant = "default",
  error,
  loading = false,
  disabled = false,
  onCheckedChange,
  onAction,
  onRetry,
}: ActionPanelProps) {
  const uid = useId();
  const destructive = variant === "destructive";
  const inert = loading || disabled;
  const showRows = !error && !loading && items.length > 0;

  return (
    <section className="@container moderno-block-action-panel text-foreground">
      <div className="grid gap-4 @lg:grid-cols-3 @lg:gap-8">
        <div className="grid content-start gap-1">
          <h2
            className={
              destructive
                ? "text-body-lg font-semibold text-destructive @md:text-heading-sm"
                : "text-body-lg font-semibold @md:text-heading-sm"
            }
          >
            {heading}
          </h2>
          {description ? <p className="text-ui-md text-muted-foreground">{description}</p> : null}
        </div>

        <Card.Root className={destructive ? "border-destructive @lg:col-span-2" : "@lg:col-span-2"}>
          <Card.Content className="gap-0 p-4 @sm:p-6">
            {error ? (
              <Alert.Root variant="error">
                <Alert.Content>
                  <Alert.Title>{error}</Alert.Title>
                  <Alert.Description>
                    Nothing was changed. Your settings are still saved.
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
                    <Skeleton shape="rect" className="h-5 w-9 shrink-0" />
                  </div>
                ))}
                <span className="sr-only">Loading settings…</span>
              </div>
            ) : null}

            {!error && !loading && items.length === 0 ? (
              <div className="grid gap-1 py-4 text-center">
                <p className="text-ui-md font-medium">No settings yet</p>
                <p className="text-ui-md text-muted-foreground">
                  Settings added to this panel show up here.
                </p>
              </div>
            ) : null}

            {showRows ? (
              <ul className="divide-y divide-border">
                {items.map((item) => {
                  const descriptionId = `${uid}-${item.id}-description`;
                  return (
                    <li key={item.id} className="py-4 first:pt-0 last:pb-0">
                      {item.action ? (
                        <div className="grid justify-items-start gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6">
                          <div className="grid gap-1">
                            <p className="text-ui-md font-medium">{item.title}</p>
                            <p id={descriptionId} className="text-ui-md text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant={destructive ? "destructive" : "outline"}
                            size="sm"
                            className="shrink-0"
                            disabled={inert}
                            aria-describedby={descriptionId}
                            onClick={() => onAction?.(item.id)}
                          >
                            {item.action}
                          </Button>
                        </div>
                      ) : (
                        <Switch.Root
                          defaultChecked={item.defaultChecked}
                          disabled={inert}
                          className="grid justify-items-start gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6"
                          onCheckedChange={({ checked }) => onCheckedChange?.(item.id, checked)}
                        >
                          <span className="grid gap-1">
                            <Switch.Label className="font-medium">{item.title}</Switch.Label>
                            <span id={descriptionId} className="text-ui-md text-muted-foreground">
                              {item.description}
                            </span>
                          </span>
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                          <Switch.HiddenInput aria-describedby={descriptionId} />
                        </Switch.Root>
                      )}
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
