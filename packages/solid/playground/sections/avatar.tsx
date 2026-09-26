/**
 * Avatar — Ark's image-loading machine: on the server the image has not
 * loaded, so the fallback shows and the image is hidden.
 */
import { Avatar } from "../../src/avatar.jsx";
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
