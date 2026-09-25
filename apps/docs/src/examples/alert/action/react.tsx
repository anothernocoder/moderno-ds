/**
 * An Alert with an action — a Button in Alert.Action, under the
 * description — @moderno-ui/react. The icon is inline SVG: primitives stay
 * icon-agnostic, and the glyph strokes `currentColor`, which the `icon`
 * part sets from the status hue.
 */
import { Alert, Button } from "@moderno-ui/react";

export function AlertActionDemo() {
  return (
    <Alert.Root variant="warning">
      <Alert.Icon>
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
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </Alert.Icon>
      <Alert.Content>
        <Alert.Title>Card expiring</Alert.Title>
        <Alert.Description>The card ending 4242 expires next month.</Alert.Description>
        <Alert.Action>
          <Button size="sm" variant="outline">Update card</Button>
        </Alert.Action>
      </Alert.Content>
    </Alert.Root>
  );
}
