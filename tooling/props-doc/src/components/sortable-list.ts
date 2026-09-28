import { sortableListRecipe } from "@moderno-ui/core";
import type { ComponentDefinition } from "../component-definition.ts";

export default {
  name: "SortableList",
  slug: "sortable-list",
  scope: "sortable-list",
  props: { file: "src/sortable-list.tsx", type: "SortableListRootProps" },
  parts: [
    { name: "root", description: "The <ul>; carries size, and data-dragging while an item moves." },
    { name: "item", description: "One <li>; any content. Needs a value from items." },
    {
      name: "item-handle",
      description:
        'Optional grip button, named "Reorder <label>". Without it the whole item drags.',
    },
    {
      name: "item-trigger",
      description: "The item's one focus target (its name button); Up and Down move between them.",
    },
  ],
  variants: sortableListRecipe.variants,
  examples: {
    react: [
      {
        title: "Slides the user reorders by dragging a handle or with the keyboard",
        code: [
          'import { SortableList } from "@moderno-ui/react";',
          "",
          '<SortableList.Root items={order} onReorder={(e) => setOrder(e.items)} aria-label="Slides">',
          "  {order.map((id) => (",
          "    <SortableList.Item key={id} value={id} label={slides[id].name}>",
          "      <SortableList.ItemHandle />",
          "      <SortableList.ItemTrigger onClick={() => select(id)}>",
          "        {slides[id].name}",
          "      </SortableList.ItemTrigger>",
          "    </SortableList.Item>",
          "  ))}",
          "</SortableList.Root>",
        ].join("\n"),
      },
    ],
    vue: [
      {
        title: "Slides the user reorders by dragging a handle or with the keyboard",
        code: [
          '<script setup lang="ts">',
          'import { SortableList } from "@moderno-ui/vue";',
          "</script>",
          "",
          "<template>",
          '  <SortableList.Root v-model:items="order" aria-label="Slides">',
          '    <SortableList.Item v-for="id in order" :key="id" :value="id" :label="slides[id].name">',
          "      <SortableList.ItemHandle />",
          '      <SortableList.ItemTrigger @click="select(id)">',
          "        {{ slides[id].name }}",
          "      </SortableList.ItemTrigger>",
          "    </SortableList.Item>",
          "  </SortableList.Root>",
          "</template>",
        ].join("\n"),
      },
    ],
    svelte: [
      {
        title: "Slides the user reorders by dragging a handle or with the keyboard",
        code: [
          '<script lang="ts">',
          '  import { SortableList } from "@moderno-ui/svelte";',
          "</script>",
          "",
          '<SortableList.Root bind:items={order} aria-label="Slides">',
          "  {#each order as id (id)}",
          "    <SortableList.Item value={id} label={slides[id].name}>",
          "      <SortableList.ItemHandle />",
          "      <SortableList.ItemTrigger onclick={() => select(id)}>",
          "        {slides[id].name}",
          "      </SortableList.ItemTrigger>",
          "    </SortableList.Item>",
          "  {/each}",
          "</SortableList.Root>",
        ].join("\n"),
      },
    ],
    solid: [
      {
        title: "Slides the user reorders by dragging a handle or with the keyboard",
        code: [
          'import { For } from "solid-js";',
          'import { SortableList } from "@moderno-ui/solid";',
          "",
          '<SortableList.Root items={order()} onReorder={(e) => setOrder(e.items)} aria-label="Slides">',
          "  <For each={order()}>",
          "    {(id) => (",
          "      <SortableList.Item value={id} label={slides[id].name}>",
          "        <SortableList.ItemHandle />",
          "        <SortableList.ItemTrigger onClick={() => select(id)}>",
          "          {slides[id].name}",
          "        </SortableList.ItemTrigger>",
          "      </SortableList.Item>",
          "    )}",
          "  </For>",
          "</SortableList.Root>",
        ].join("\n"),
      },
    ],
  },
} satisfies ComponentDefinition;
