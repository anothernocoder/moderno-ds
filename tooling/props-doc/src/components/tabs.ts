import { tabsRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "Tabs",
  slug: "tabs",
  scope: "tabs",
  props: { file: "src/tabs.tsx", type: "ModernoTabsRootProps" },
  parts: [
    { name: "root", description: "Carries variant and size for the list and its triggers." },
    { name: "list", description: "The tablist that holds the triggers and the indicator." },
    { name: "trigger", description: 'One native <button role="tab">; selects its panel.' },
    { name: "indicator", description: "Optional; the mark Ark slides to the selected tab." },
    { name: "content", description: "One tabpanel; hidden unless its tab is selected." },
  ],
  variants: tabsRecipe.variants,
  examples: {
    react: [
      {
        title: "Tabs with an indicator, one panel per tab",
        code: [
          'import { Tabs } from "@moderno-ui/react";',
          "",
          '<Tabs.Root defaultValue="account" onValueChange={save}>',
          '  <Tabs.List aria-label="Settings">',
          '    <Tabs.Trigger value="account">Account</Tabs.Trigger>',
          '    <Tabs.Trigger value="password">Password</Tabs.Trigger>',
          "    <Tabs.Indicator />",
          "  </Tabs.List>",
          '  <Tabs.Content value="account">Account settings</Tabs.Content>',
          '  <Tabs.Content value="password">Password settings</Tabs.Content>',
          "</Tabs.Root>",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "Tabs with an indicator, one panel per tab",
        code: [
          '<script setup lang="ts">',
          'import { Tabs } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          '  <Tabs.Root default-value="account" @value-change="save">',
          '    <Tabs.List aria-label="Settings">',
          '      <Tabs.Trigger value="account">Account</Tabs.Trigger>',
          '      <Tabs.Trigger value="password">Password</Tabs.Trigger>',
          "      <Tabs.Indicator />",
          "    </Tabs.List>",
          '    <Tabs.Content value="account">Account settings</Tabs.Content>',
          '    <Tabs.Content value="password">Password settings</Tabs.Content>',
          "  </Tabs.Root>",
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "Tabs with an indicator, one panel per tab",
        code: [
          '<script lang="ts">',
          '  import { Tabs } from "@moderno-ui/svelte";',
          "</script>",
          "",
          '<Tabs.Root defaultValue="account" onValueChange={save}>',
          '  <Tabs.List aria-label="Settings">',
          '    <Tabs.Trigger value="account">Account</Tabs.Trigger>',
          '    <Tabs.Trigger value="password">Password</Tabs.Trigger>',
          "    <Tabs.Indicator />",
          "  </Tabs.List>",
          '  <Tabs.Content value="account">Account settings</Tabs.Content>',
          '  <Tabs.Content value="password">Password settings</Tabs.Content>',
          "</Tabs.Root>",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "Tabs with an indicator, one panel per tab",
        code: [
          'import { Tabs } from "@moderno-ui/solid";',
          "",
          '<Tabs.Root defaultValue="account" onValueChange={save}>',
          '  <Tabs.List aria-label="Settings">',
          '    <Tabs.Trigger value="account">Account</Tabs.Trigger>',
          '    <Tabs.Trigger value="password">Password</Tabs.Trigger>',
          "    <Tabs.Indicator />",
          "  </Tabs.List>",
          '  <Tabs.Content value="account">Account settings</Tabs.Content>',
          '  <Tabs.Content value="password">Password settings</Tabs.Content>',
          "</Tabs.Root>",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
