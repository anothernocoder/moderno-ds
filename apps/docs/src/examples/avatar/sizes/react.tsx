import { Avatar } from "@moderno-ui/react";

export function AvatarSizesDemo() {
  return (
    <div className="demo-row">
      <Avatar.Root size="sm">
        <Avatar.Fallback>AL</Avatar.Fallback>
        <Avatar.Image
          src="https://api.dicebear.com/9.x/notionists/svg?seed=Ada"
          alt="Ada Lovelace"
        />
      </Avatar.Root>
      <Avatar.Root size="md">
        <Avatar.Fallback>AL</Avatar.Fallback>
        <Avatar.Image
          src="https://api.dicebear.com/9.x/notionists/svg?seed=Ada"
          alt="Ada Lovelace"
        />
      </Avatar.Root>
      <Avatar.Root size="lg">
        <Avatar.Fallback>AL</Avatar.Fallback>
        <Avatar.Image
          src="https://api.dicebear.com/9.x/notionists/svg?seed=Ada"
          alt="Ada Lovelace"
        />
      </Avatar.Root>
    </div>
  );
}
