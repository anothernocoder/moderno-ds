import { For, Show } from "solid-js";
import { Alert, Badge, Button, Card, Indicator, Skeleton } from "@moderno-ui/solid";

export type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance";

export type UptimeDay = ServiceStatus | "no-data";

export interface StatusMonitoringService {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime: string;
  history: UptimeDay[];
}

function dailyHistory(incidents: Partial<Record<number, UptimeDay>> = {}): UptimeDay[] {
  return Array.from({ length: 30 }, (_, day) => incidents[day] ?? "operational");
}

const sampleServices: StatusMonitoringService[] = [
  {
    id: "api",
    name: "API",
    status: "operational",
    uptime: "99.98%",
    history: dailyHistory({ 11: "degraded" }),
  },
  {
    id: "dashboard",
    name: "Dashboard",
    status: "operational",
    uptime: "100%",
    history: dailyHistory(),
  },
  {
    id: "webhooks",
    name: "Webhooks",
    status: "degraded",
    uptime: "99.71%",
    history: dailyHistory({ 4: "outage", 28: "degraded", 29: "degraded" }),
  },
  {
    id: "email",
    name: "Email delivery",
    status: "maintenance",
    uptime: "99.95%",
    history: dailyHistory({ 17: "maintenance", 29: "maintenance" }),
  },
];

const statusDisplay: Record<
  ServiceStatus,
  { tone: "success" | "warning" | "error" | "info"; label: string; summary: string }
> = {
  operational: { tone: "success", label: "Operational", summary: "All systems operational" },
  degraded: { tone: "warning", label: "Degraded", summary: "Degraded performance" },
  outage: { tone: "error", label: "Outage", summary: "Service outage" },
  maintenance: { tone: "info", label: "Maintenance", summary: "Maintenance in progress" },
};

const statusBySeverity: ServiceStatus[] = ["outage", "degraded", "maintenance", "operational"];

const dayNames: Record<UptimeDay, string> = {
  operational: "operational",
  degraded: "degraded",
  outage: "outage",
  maintenance: "maintenance",
  "no-data": "no data",
};

function overallStatus(services: StatusMonitoringService[]): ServiceStatus {
  return (
    statusBySeverity.find((status) => services.some((service) => service.status === status)) ??
    "operational"
  );
}

function describeHistory(history: UptimeDay[]): string {
  const counts = (Object.keys(dayNames) as UptimeDay[])
    .map((day) => ({ day, count: history.filter((entry) => entry === day).length }))
    .filter(({ count }) => count > 0)
    .map(({ day, count }) => `${count} ${dayNames[day]}`);
  return `Last ${history.length} days: ${counts.join(", ")}`;
}

const placeholders = ["first", "second", "third", "fourth"];

export interface StatusMonitoringProps {
  services?: StatusMonitoringService[];
  heading?: string;
  description?: string;
  actionLabel?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: () => void;
  onRetry?: () => void;
}

export function StatusMonitoring(props: StatusMonitoringProps) {
  const services = () => props.services ?? sampleServices;
  const heading = () => props.heading ?? "System status";
  const description = () => props.description ?? "Live status and daily uptime for each service.";
  const actionLabel = () => props.actionLabel ?? "Subscribe to updates";
  const showServices = () => !props.error && !props.loading && services().length > 0;
  const overall = () => statusDisplay[overallStatus(services())];

  return (
    <section class="@container moderno-block-status-monitoring text-foreground">
      <div class="grid gap-4">
        <div class="grid gap-3 @sm:flex @sm:items-end @sm:justify-between">
          <div class="grid justify-items-start gap-2">
            <div class="grid gap-1">
              <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading()}</h2>
              <Show when={description()}>
                <p class="text-ui-md text-muted-foreground">{description()}</p>
              </Show>
            </div>
            <Show when={showServices()}>
              <Badge variant={overall().tone} dot>
                {overall().summary}
              </Badge>
            </Show>
          </div>
          <Show when={actionLabel()}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="justify-self-start"
              disabled={props.disabled}
              onClick={() => props.onAction?.()}
            >
              {actionLabel()}
            </Button>
          </Show>
        </div>

        <Show when={props.error}>
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{props.error}</Alert.Title>
              <Alert.Description>
                Your services are still checked; only this view failed to load.
              </Alert.Description>
              <Alert.Action>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={props.disabled}
                  onClick={() => props.onRetry?.()}
                >
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        </Show>

        <Show when={!props.error && props.loading}>
          <div role="status" aria-busy="true" class="grid gap-3 @lg:grid-cols-2">
            <span class="sr-only">Loading status…</span>
            <For each={placeholders}>
              {() => (
                <Card.Root size="sm" aria-hidden="true">
                  <Card.Content class="gap-3">
                    <Skeleton shape="text" class="w-1/3" />
                    <Skeleton shape="rect" class="h-6 @md:h-8" />
                    <Skeleton shape="text" class="w-2/3" />
                  </Card.Content>
                </Card.Root>
              )}
            </For>
          </div>
        </Show>

        <Show when={!props.error && !props.loading && services().length === 0}>
          <Card.Root>
            <Card.Header class="items-center text-center">
              <Card.Title>No services yet</Card.Title>
              <Card.Description>
                Add a service to start tracking its status and uptime.
              </Card.Description>
            </Card.Header>
          </Card.Root>
        </Show>

        <Show when={showServices()}>
          <ul class="grid gap-3 @lg:grid-cols-2">
            <For each={services()}>
              {(service) => (
                <li class="flex">
                  <Card.Root size="sm">
                    <Card.Content class="gap-3">
                      <div class="grid justify-items-start gap-1 @sm:flex @sm:items-center @sm:justify-between @sm:gap-4">
                        <h3 class="text-body font-medium">{service.name}</h3>
                        <Indicator variant={statusDisplay[service.status].tone}>
                          {statusDisplay[service.status].label}
                        </Indicator>
                      </div>
                      <div
                        role="img"
                        aria-label={describeHistory(service.history)}
                        class="flex h-6 gap-0.5 @md:h-8"
                      >
                        <For each={service.history}>
                          {(day) => (
                            <span
                              data-day={day}
                              class="flex-1 rounded-sm bg-success data-[day=degraded]:bg-warning data-[day=outage]:bg-destructive data-[day=maintenance]:bg-info data-[day=no-data]:bg-muted"
                            />
                          )}
                        </For>
                      </div>
                      <p class="flex justify-between gap-2 text-ui-xs text-muted-foreground">
                        <span>{service.history.length} days ago</span>
                        <span>{service.uptime} uptime</span>
                        <span>Today</span>
                      </p>
                    </Card.Content>
                  </Card.Root>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </section>
  );
}
