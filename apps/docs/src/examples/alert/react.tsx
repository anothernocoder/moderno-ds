import { Alert } from "@moderno-ui/react";

export function AlertDemo() {
  return (
    <Alert.Root variant="info">
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
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </Alert.Icon>
      <Alert.Content>
        <Alert.Title>Trial ending soon</Alert.Title>
        <Alert.Description>Your workspace switches to the free plan in three days.</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
