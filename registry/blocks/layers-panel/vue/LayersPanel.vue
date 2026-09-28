<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Button, Editable, Menu, Portal, SortableList, Toggle, Tooltip } from "@moderno-ui/vue";

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  /** An image URL, drawn small before the name. Wins over `icon`. */
  thumbnail?: string;
  /** The kind of layer, drawn as an icon when there is no thumbnail: `frame`, `group`, `text`, `image` or `shape`. */
  icon?: string;
}

/** What `change` carries: the one field that changed. */
type LayerChange = { name: string } | { visible: boolean } | { locked: boolean };

/**
 * Where the focus goes once the app has written back `layers`: after a
 * delete, to the row beside the one removed; after an add from the empty
 * state, to the list.
 */
interface PendingFocus {
  /** Wait until this layer has left `layers` (a delete), or until `layers` has rows (an add). */
  removedId: string | null;
  /** The row to focus then; `null` focuses the list's Tab stop, or Add layer when no rows are left. */
  focusId: string | null;
}

const props = withDefaults(
  defineProps<{
    /** The layers, top row first: the top row is the front-most layer. */
    layers?: Layer[];
    /** The selected layer's `id`. */
    selectedId?: string | null;
  }>(),
  {
    layers: () => [
      { id: "title", name: "Title", visible: true, locked: false, icon: "text" },
      { id: "logo", name: "Logo", visible: true, locked: true, icon: "image" },
      { id: "button", name: "Call to action", visible: true, locked: false, icon: "shape" },
      { id: "guides", name: "Guides", visible: false, locked: false, icon: "frame" },
      { id: "background", name: "Background", visible: true, locked: true, icon: "shape" },
    ],
    selectedId: null,
  },
);

const emit = defineEmits<{
  select: [id: string];
  /** Every layer's `id` in the new order, top row first. */
  reorder: [ids: string[]];
  change: [id: string, change: LayerChange];
  duplicate: [id: string];
  delete: [id: string];
  add: [];
}>();

/** Icons, as the paths of a 24×24 stroked SVG. */
const icons = {
  layer: [
    "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
    "m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",
    "m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",
  ],
  frame: ["M22 6H2", "M22 18H2", "M6 2v20", "M18 2v20"],
  group: [
    "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
  ],
  text: ["M4 7V4h16v3", "M9 20h6", "M12 4v16"],
  image: [
    "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
    "M7 9a2 2 0 1 0 4 0a2 2 0 1 0-4 0",
    "m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21",
  ],
  shape: ["M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"],
  visible: [
    "M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0",
    "M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
  ],
  hidden: [
    "M10.73 5.08a10.74 10.74 0 0 1 11.2 6.57 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-1.44 2.49",
    "M14.08 14.16a3 3 0 0 1-4.24-4.24",
    "M17.48 17.5a10.75 10.75 0 0 1-15.42-5.15 1 1 0 0 1 0-.7 10.75 10.75 0 0 1 4.45-5.14",
    "m2 2 20 20",
  ],
  locked: [
    "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z",
    "M7 11V7a5 5 0 0 1 10 0v4",
  ],
  unlocked: [
    "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z",
    "M7 11V7a5 5 0 0 1 9.9-1",
  ],
  actions: [
    "M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
    "M18 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
    "M4 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
  ],
  add: ["M5 12h14", "M12 5v14"],
};

/** The icon of a layer kind; an unknown kind gets the generic layer icon. */
function kindIcon(kind: string | undefined) {
  const known: Record<string, string[]> = {
    frame: icons.frame,
    group: icons.group,
    text: icons.text,
    image: icons.image,
    shape: icons.shape,
  };
  return (kind && known[kind]) || icons.layer;
}

/** The name cut short with an ellipsis: its box is narrower than its text. */
function isTruncated(element: HTMLElement) {
  return element.scrollWidth > element.clientWidth;
}

/** The name button's name carries the row's state: "Logo, hidden, locked". */
function nameWithState(layer: Layer) {
  return `${layer.name}${layer.visible ? "" : ", hidden"}${layer.locked ? ", locked" : ""}`;
}

const ids = computed(() => props.layers.map((layer) => layer.id));
// The row the focus is in; once it leaves the list, the Tab stop goes back to the selected row.
const focusedId = ref<string | null>(null);
const editingId = ref<string | null>(null);
// The row whose name is cut short under the pointer: only its Tooltip opens.
const truncatedId = ref<string | null>(null);
const tabStopId = computed(
  () =>
    [focusedId.value, props.selectedId].find((id) => id != null && ids.value.includes(id)) ??
    ids.value[0],
);

const section = ref<HTMLElement>();
let pendingFocus: PendingFocus | null = null;

function nameButton(id: string) {
  const buttons = section.value?.querySelectorAll<HTMLElement>("[data-layer-name]") ?? [];
  return [...buttons].find((button) => button.dataset.layerName === id) ?? null;
}

function select(id: string) {
  if (id !== props.selectedId) emit("select", id);
}

function add() {
  if (props.layers.length === 0) pendingFocus = { removedId: null, focusId: null };
  emit("add");
}

// The app confirms and removes the layer; the focus then moves to the row below (or above).
function remove(id: string) {
  const index = ids.value.indexOf(id);
  pendingFocus = {
    removedId: id,
    focusId: ids.value[index + 1] ?? ids.value[index - 1] ?? null,
  };
  emit("delete", id);
}

function rename(layer: Layer, value: string) {
  const name = value.trim();
  if (name && name !== layer.name) emit("change", layer.id, { name });
}

function handleAction(layer: Layer, action: string) {
  if (action === "duplicate") emit("duplicate", layer.id);
  // Rename starts on the next frame, once the menu has closed and handed the focus back
  // to its trigger: an edit started before would take that focus for a click away.
  if (action === "rename") requestAnimationFrame(() => (editingId.value = layer.id));
  if (action === "delete") remove(layer.id);
}

// A click anywhere on a row selects it, except on its toggles, its menu or the rename input.
function selectFromRow(event: MouseEvent, id: string) {
  const control = (event.target as HTMLElement).closest("button, input");
  if (control && !control.hasAttribute("data-layer-name")) return;
  select(id);
}

// Enter selects (the button's own click), F2 renames, Delete (or Backspace) deletes.
function handleNameKeyDown(event: KeyboardEvent, layer: Layer) {
  const button = event.currentTarget as HTMLElement;
  if (event.defaultPrevented || button.hasAttribute("data-dragging")) return;
  if (event.key === "F2") {
    event.preventDefault();
    editingId.value = layer.id;
  } else if (event.key === "Delete" || event.key === "Backspace") {
    event.preventDefault();
    remove(layer.id);
  }
}

function handleListFocusOut(event: FocusEvent) {
  const list = event.currentTarget as HTMLElement;
  if (!list.contains(event.relatedTarget as Node | null)) focusedId.value = null;
}

function handleEditChange(details: { edit: boolean }) {
  if (!details.edit) editingId.value = null;
}

// Runs once the app has written back `layers` after a delete, or an add from the empty state.
function focusPendingTarget() {
  const pending = pendingFocus;
  const root = section.value;
  if (!pending || !root) return;
  const settled =
    pending.removedId === null ? ids.value.length > 0 : !ids.value.includes(pending.removedId);
  if (!settled) return;
  pendingFocus = null;
  // Leave a focus the app has moved elsewhere (a confirm dialog, the canvas).
  const active = document.activeElement;
  if (active && active !== document.body && !root.contains(active)) return;
  const target = pending.focusId ?? tabStopId.value;
  if (target) nameButton(target)?.focus();
  else root.querySelector<HTMLElement>("[data-layers-add]")?.focus();
}

watch(ids, focusPendingTarget, { flush: "post" });

// Any key or press in the panel first forgets the focus an earlier add or delete was
// waiting for, so a change the app refused never pulls the focus later.
function forgetPendingFocus() {
  pendingFocus = null;
}
</script>

<template>
  <section
    ref="section"
    aria-label="Layers panel"
    class="@container moderno-block-layers-panel flex min-h-0 flex-col bg-background text-foreground"
    @keydown.capture="forgetPendingFocus"
    @pointerdown.capture="forgetPendingFocus"
  >
    <div
      class="flex min-h-10 items-center justify-between gap-2 border-b border-border px-3 py-1.5"
    >
      <h2 class="m-0 text-ui-sm font-semibold">Layers</h2>
      <Button
        v-if="layers.length > 0"
        variant="ghost"
        size="sm"
        class="px-1.5 @sm:px-2"
        aria-label="Add layer"
        @click="add"
      >
        <svg
          class="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path v-for="path in icons.add" :key="path" :d="path" />
        </svg>
        <span class="hidden @sm:inline">Add layer</span>
      </Button>
    </div>

    <div v-if="layers.length === 0" class="grid justify-items-center gap-2 px-4 py-8 text-center">
      <svg
        class="size-6 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path v-for="path in icons.layer" :key="path" :d="path" />
      </svg>
      <p class="m-0 text-ui-sm font-medium">No layers yet</p>
      <p class="m-0 text-ui-sm text-muted-foreground">Add a layer to start your design.</p>
      <Button size="sm" class="mt-1" data-layers-add="" @click="add">
        <svg
          class="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path v-for="path in icons.add" :key="path" :d="path" />
        </svg>
        Add layer
      </Button>
    </div>

    <div v-else class="min-h-0 flex-1 overflow-y-auto p-1">
      <SortableList.Root
        aria-label="Layers"
        size="sm"
        class="gap-0.5"
        :items="ids"
        @reorder="emit('reorder', $event.items)"
        @focusout="handleListFocusOut"
      >
        <SortableList.Item
          v-for="layer in layers"
          :key="layer.id"
          :value="layer.id"
          :label="layer.name"
          class="p-0"
          @focusin="focusedId = layer.id"
        >
          <div
            :data-selected="layer.id === selectedId ? '' : undefined"
            :data-hidden="layer.visible ? undefined : ''"
            :data-locked="layer.locked ? '' : undefined"
            class="group relative flex min-w-0 flex-1 items-center gap-1 self-stretch rounded-lg px-1 transition-colors before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:rounded-full hover:bg-muted data-[selected]:bg-primary/15 data-[selected]:before:bg-primary"
            @click="selectFromRow($event, layer.id)"
          >
            <span
              aria-hidden="true"
              class="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-muted text-muted-foreground group-data-[hidden]:opacity-50 @sm:size-8"
            >
              <img
                v-if="layer.thumbnail"
                :src="layer.thumbnail"
                alt=""
                draggable="false"
                class="size-full object-cover"
              />
              <svg
                v-else
                class="size-3.5 @sm:size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path v-for="path in kindIcon(layer.icon)" :key="path" :d="path" />
              </svg>
            </span>

            <div class="relative flex min-w-0 flex-1 self-stretch">
              <SortableList.ItemTrigger
                :data-layer-name="layer.id"
                :aria-label="nameWithState(layer)"
                :aria-current="layer.id === selectedId ? 'true' : undefined"
                :tabindex="layer.id === tabStopId ? 0 : -1"
                class="min-w-0 flex-1 px-1 hover:bg-transparent group-data-[selected]:font-medium"
                @dblclick="editingId = layer.id"
                @keydown="handleNameKeyDown($event, layer)"
              >
                <Tooltip.Root :disabled="truncatedId !== layer.id">
                  <Tooltip.Trigger as-child>
                    <span
                      class="truncate group-data-[hidden]:text-muted-foreground"
                      @pointerenter="
                        truncatedId = isTruncated($event.currentTarget as HTMLElement)
                          ? layer.id
                          : null
                      "
                    >
                      {{ layer.name }}
                    </span>
                  </Tooltip.Trigger>
                  <Portal>
                    <Tooltip.Positioner>
                      <Tooltip.Content>{{ layer.name }}</Tooltip.Content>
                    </Tooltip.Positioner>
                  </Portal>
                </Tooltip.Root>
              </SortableList.ItemTrigger>
              <Editable.Root
                v-if="editingId === layer.id"
                size="sm"
                class="absolute inset-0"
                :default-value="layer.name"
                default-edit
                :final-focus-el="() => nameButton(layer.id)"
                @value-commit="rename(layer, $event.value)"
                @edit-change="handleEditChange"
              >
                <Editable.Label class="sr-only">Layer name</Editable.Label>
                <Editable.Area>
                  <Editable.Input class="cursor-text select-text" />
                </Editable.Area>
              </Editable.Root>
            </div>

            <!-- The toggles and the menu fade in while the pointer is on the row or the focus is in it; a pressed toggle and an open menu stay, and a touch screen (no hover) always shows them. -->
            <Toggle.Root
              size="sm"
              class="w-7 px-0 data-[state=on]:bg-transparent data-[state=on]:text-foreground data-[state=on]:opacity-100 hover:data-[state=on]:bg-muted opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100"
              :tabindex="layer.id === tabStopId ? 0 : -1"
              :aria-label="`${layer.visible ? 'Hide' : 'Show'} ${layer.name}`"
              :pressed="!layer.visible"
              @pressed-change="emit('change', layer.id, { visible: !$event })"
            >
              <svg
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path
                  v-for="path in layer.visible ? icons.visible : icons.hidden"
                  :key="path"
                  :d="path"
                />
              </svg>
            </Toggle.Root>
            <Toggle.Root
              size="sm"
              class="w-7 px-0 data-[state=on]:bg-transparent data-[state=on]:text-foreground data-[state=on]:opacity-100 hover:data-[state=on]:bg-muted opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100"
              :tabindex="layer.id === tabStopId ? 0 : -1"
              :aria-label="`${layer.locked ? 'Unlock' : 'Lock'} ${layer.name}`"
              :pressed="layer.locked"
              @pressed-change="emit('change', layer.id, { locked: $event })"
            >
              <svg
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path
                  v-for="path in layer.locked ? icons.locked : icons.unlocked"
                  :key="path"
                  :d="path"
                />
              </svg>
            </Toggle.Root>
            <Menu.Root size="sm" @select="handleAction(layer, $event.value)">
              <Menu.Trigger as-child>
                <Button
                  variant="ghost"
                  size="sm"
                  class="w-7 px-0 data-[state=open]:opacity-100 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100"
                  :tabindex="layer.id === tabStopId ? 0 : -1"
                  :aria-label="`Actions for ${layer.name}`"
                >
                  <svg
                    class="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path v-for="path in icons.actions" :key="path" :d="path" />
                  </svg>
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item value="duplicate">Duplicate</Menu.Item>
                    <Menu.Item value="rename">Rename</Menu.Item>
                    <Menu.Item value="delete">Delete</Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </div>
        </SortableList.Item>
      </SortableList.Root>
    </div>
  </section>
</template>
