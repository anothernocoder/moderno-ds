/**
 * Alert across its four statuses plus the compact size — @moderno-ui/react,
 * the same demo every framework's example shows. The icons are inline SVG:
 * primitives stay icon-agnostic, and every glyph strokes `currentColor`,
 * which the `icon` part sets from the status hue.
 */
import { Alert, Button } from "@moderno-ui/react";

function CircleIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d={path} />
    </svg>
  );
}

export function AlertDemo() {
  return (
    <div className="demo-stack">
      <Alert.Root variant="info">
        <Alert.Icon>
          <CircleIcon path="M12 16v-4M12 8h.01" />
        </Alert.Icon>
        <Alert.Content>
          <Alert.Title>Trial ending soon</Alert.Title>
          <Alert.Description>
            Your workspace switches to the free plan in three days.
          </Alert.Description>
          <Alert.Action>
            <Button size="sm" variant="outline">
              Manage plan
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>

      <Alert.Root variant="success">
        <Alert.Icon>
          <CircleIcon path="m8 12 2.5 2.5L16 9" />
        </Alert.Icon>
        <Alert.Content>
          <Alert.Title>Invoice sent</Alert.Title>
          <Alert.Description>Acme Inc. was notified by email.</Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <Alert.Root variant="warning">
        <Alert.Icon>
          <CircleIcon path="M12 8v4M12 16h.01" />
        </Alert.Icon>
        <Alert.Content>
          <Alert.Title>Card expiring</Alert.Title>
          <Alert.Description>The card ending 4242 expires next month.</Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <Alert.Root variant="error" size="sm">
        <Alert.Icon>
          <CircleIcon path="m15 9-6 6M9 9l6 6" />
        </Alert.Icon>
        <Alert.Content>
          <Alert.Title>Payment failed</Alert.Title>
          <Alert.Description>We could not charge your card. (size sm)</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    </div>
  );
}
