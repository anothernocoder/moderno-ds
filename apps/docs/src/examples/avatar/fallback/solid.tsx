/** @jsxImportSource solid-js */
import { Avatar } from "@moderno-ui/solid";

export function AvatarFallbackDemo() {
  return (
    <div class="demo-row">
      <Avatar.Root>
        <Avatar.Fallback>AL</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root>
        <Avatar.Fallback>GH</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root>
        <Avatar.Fallback>MD</Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
}
