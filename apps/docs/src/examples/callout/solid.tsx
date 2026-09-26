/** @jsxImportSource solid-js */
import { Callout } from "@moderno-ui/solid";

export function CalloutDemo() {
  return (
    <Callout.Root>
      <Callout.Icon>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </Callout.Icon>
      <Callout.Content>
        <Callout.Title>Good to know</Callout.Title>
        <Callout.Description>
          Exports run overnight, so today's changes show up tomorrow.
        </Callout.Description>
      </Callout.Content>
    </Callout.Root>
  );
}
