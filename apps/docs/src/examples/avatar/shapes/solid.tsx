/** @jsxImportSource solid-js */
import { Avatar } from "@moderno-ui/solid";

export function AvatarShapesDemo() {
  return (
    <div class="demo-row">
      <Avatar.Root shape="circle">
        <Avatar.Fallback>AL</Avatar.Fallback>
        <Avatar.Image
          src="https://api.dicebear.com/9.x/notionists/svg?seed=Ada"
          alt="Ada Lovelace"
        />
      </Avatar.Root>
      <Avatar.Root shape="square">
        <Avatar.Fallback>MD</Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
}
