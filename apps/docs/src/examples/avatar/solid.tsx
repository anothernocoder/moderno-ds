/** @jsxImportSource solid-js */
import { Avatar } from "@moderno-ui/solid";

export function AvatarDemo() {
  return (
    <Avatar.Root>
      <Avatar.Fallback>AL</Avatar.Fallback>
      <Avatar.Image src="https://api.dicebear.com/9.x/notionists/svg?seed=Ada" alt="Ada Lovelace" />
    </Avatar.Root>
  );
}
