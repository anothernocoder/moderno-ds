/**
 * Avatar — Ark's image-loading machine: on the server the image has not
 * loaded, so the initials show and the image is hidden.
 */
import { h } from "vue";
import { Avatar } from "../../src/avatar.js";
import type { Section } from "../section.js";

const AvatarSection: Section = () =>
  h("section", { "aria-label": "avatars" }, [
    h(Avatar.Root, {}, () => [
      h(Avatar.Fallback, {}, () => "AL"),
      h(Avatar.Image, { src: "/ada.png", alt: "Ada Lovelace" }),
    ]),
    h(Avatar.Root, { size: "sm", shape: "square" }, () => [h(Avatar.Fallback, {}, () => "MD")]),
  ]);

export default AvatarSection;
