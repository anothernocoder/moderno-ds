import { Alert, Badge, Button, Card, Indicator, Skeleton } from "@moderno-ui/react";

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

export function StatusMonitoring({
  services = sampleServices,
  heading = "System status",
  description = "Live status and daily uptime for each service.",
  actionLabel = "Subscribe to updates",
  error,
  loading = false,
  disabled = false,
  onAction,
  onRetry,
}: StatusMonitoringProps) {
  const showServices = !error && !loading && services.length > 0;
  const overall = statusDisplay[overallStatus(services)];

  return (
    <section className="@container moderno-block-status-monitoring text-foreground">
      <div className="grid gap-4">
        <div className="grid gap-3 @sm:flex @sm:items-end @sm:justify-between">
          <div className="grid justify-items-start gap-2">
            <div className="grid gap-1">
              <h2 className="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
              {description ? (
                <p className="text-ui-md text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {showServices ? (
              <Badge variant={overall.tone} dot>
                {overall.summary}
              </Badge>
            ) : null}
          </div>
          {actionLabel ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-self-start"
              disabled={disabled}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          ) : null}
        </div>

        {error ? (
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>
                Your services are still checked; only this view failed to load.
              </Alert.Description>
              <Alert.Action>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={onRetry}
                >
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        ) : null}

        {!error && loading ? (
          <div role="status" aria-busy="true" className="grid gap-3 @lg:grid-cols-2">
            <span className="sr-only">Loading status…</span>
            {placeholders.map((key) => (
              <Card.Root key={key} size="sm" aria-hidden="true">
                <Card.Content className="gap-3">
                  <Skeleton shape="text" className="w-1/3" />
                  <Skeleton shape="rect" className="h-6 @md:h-8" />
                  <Skeleton shape="text" className="w-2/3" />
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        ) : null}

        {!error && !loading && services.length === 0 ? (
          <Card.Root>
            <Card.Header className="items-center text-center">
              <Card.Title>No services yet</Card.Title>
              <Card.Description>
                Add a service to start tracking its status and uptime.
              </Card.Description>
            </Card.Header>
          </Card.Root>
        ) : null}

        {showServices ? (
          <ul className="grid gap-3 @lg:grid-cols-2">
            {services.map((service) => (
              <li key={service.id} className="flex">
                <Card.Root size="sm">
                  <Card.Content className="gap-3">
                    <div className="grid justify-items-start gap-1 @sm:flex @sm:items-center @sm:justify-between @sm:gap-4">
                      <h3 className="text-body font-medium">{service.name}</h3>
                      <Indicator variant={statusDisplay[service.status].tone}>
                        {statusDisplay[service.status].label}
                      </Indicator>
                    </div>
                    <div
                      role="img"
                      aria-label={describeHistory(service.history)}
                      className="flex h-6 gap-0.5 @md:h-8"
                    >
                      {service.history.map((day, index) => (
                        <span
                          key={index}
                          data-day={day}
                          className="flex-1 rounded-sm bg-success data-[day=degraded]:bg-warning data-[day=outage]:bg-destructive data-[day=maintenance]:bg-info data-[day=no-data]:bg-muted"
                        />
                      ))}
                    </div>
                    <p className="flex justify-between gap-2 text-ui-xs text-muted-foreground">
                      <span>{service.history.length} days ago</span>
                      <span>{service.uptime} uptime</span>
                      <span>Today</span>
                    </p>
                  </Card.Content>
                </Card.Root>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
