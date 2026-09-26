import { avatarRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "Avatar",
  slug: "avatar",
  scope: "avatar",
  props: { file: "src/avatar.tsx", type: "ModernoAvatarRootProps" },
  parts: [
    { name: "root" },
    { name: "image", description: "The picture; shown once it has loaded." },
    {
      name: "fallback",
      description: "The initials; shown while the image loads, when it fails, or with no image.",
    },
  ],
  variants: avatarRecipe.variants,
  examples: {
    react: [
      {
        title: "A person's picture with initials as the fallback",
        code: [
          'import { Avatar } from "@moderno-ui/react";',
          "",
          '<Avatar.Root size="lg">',
          "  <Avatar.Fallback>AL</Avatar.Fallback>",
          '  <Avatar.Image src="/ada.png" alt="Ada Lovelace" />',
          "</Avatar.Root>",
          '<Avatar.Root shape="square">',
          "  <Avatar.Fallback>MD</Avatar.Fallback>",
          "</Avatar.Root>",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "A person's picture with initials as the fallback",
        code: [
          '<script setup lang="ts">',
          'import { Avatar } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          '  <Avatar.Root size="lg">',
          "    <Avatar.Fallback>AL</Avatar.Fallback>",
          '    <Avatar.Image src="/ada.png" alt="Ada Lovelace" />',
          "  </Avatar.Root>",
          '  <Avatar.Root shape="square">',
          "    <Avatar.Fallback>MD</Avatar.Fallback>",
          "  </Avatar.Root>",
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "A person's picture with initials as the fallback",
        code: [
          '<script lang="ts">',
          '  import { Avatar } from "@moderno-ui/svelte";',
          "</script>",
          "",
          '<Avatar.Root size="lg">',
          "  <Avatar.Fallback>AL</Avatar.Fallback>",
          '  <Avatar.Image src="/ada.png" alt="Ada Lovelace" />',
          "</Avatar.Root>",
          '<Avatar.Root shape="square">',
          "  <Avatar.Fallback>MD</Avatar.Fallback>",
          "</Avatar.Root>",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "A person's picture with initials as the fallback",
        code: [
          'import { Avatar } from "@moderno-ui/solid";',
          "",
          '<Avatar.Root size="lg">',
          "  <Avatar.Fallback>AL</Avatar.Fallback>",
          '  <Avatar.Image src="/ada.png" alt="Ada Lovelace" />',
          "</Avatar.Root>",
          '<Avatar.Root shape="square">',
          "  <Avatar.Fallback>MD</Avatar.Fallback>",
          "</Avatar.Root>",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
