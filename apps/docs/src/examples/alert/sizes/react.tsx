import { Alert } from "@moderno-ui/react";

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

export function AlertSizesDemo() {
  return (
    <div className="demo-stack">
      <Alert.Root variant="info" size="md">
        <Alert.Icon>
          <CircleIcon path="M12 16v-4M12 8h.01" />
        </Alert.Icon>
        <Alert.Content>
          <Alert.Title>Medium</Alert.Title>
          <Alert.Description>The default padding and gap.</Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <Alert.Root variant="info" size="sm">
        <Alert.Icon>
          <CircleIcon path="M12 16v-4M12 8h.01" />
        </Alert.Icon>
        <Alert.Content>
          <Alert.Title>Small</Alert.Title>
          <Alert.Description>Tighter padding for dense layouts.</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    </div>
  );
}
