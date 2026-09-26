/**
 * Avatar — Ark's image-loading machine: ids from `useId`, and the fallback
 * shown / image hidden while loading must match both ways.
 */
import { Avatar } from "../../src/avatar.js";
import type { Section } from "../section.js";

const AvatarSection: Section = () => (
  <section aria-label="avatars">
    <Avatar.Root>
      <Avatar.Fallback>AL</Avatar.Fallback>
      <Avatar.Image src="/ada.png" alt="Ada Lovelace" />
    </Avatar.Root>
    <Avatar.Root size="sm" shape="square">
      <Avatar.Fallback>MD</Avatar.Fallback>
    </Avatar.Root>
  </section>
);

export default AvatarSection;
