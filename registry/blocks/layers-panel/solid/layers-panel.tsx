import { For, Show, createEffect, createSignal, on } from "solid-js";
import { Button, Editable, Menu, Portal, SortableList, Toggle, Tooltip } from "@moderno-ui/solid";

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  /** An image URL, drawn small before the name. Wins over `icon`. */
  thumbnail?: string;
  /** The kind of layer, drawn as an icon when there is no thumbnail: `frame`, `group`, `text`, `image` or `shape`. */
  icon?: string;
}

/** What `onChange` receives: the one field that changed. */
export type LayerChange = { name: string } | { visible: boolean } | { locked: boolean };

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

const sampleLayers: Layer[] = [
  { id: "title", name: "Title", visible: true, locked: false, icon: "text" },
  { id: "logo", name: "Logo", visible: true, locked: true, icon: "image" },
  { id: "button", name: "Call to action", visible: true, locked: false, icon: "shape" },
  { id: "guides", name: "Guides", visible: false, locked: false, icon: "frame" },
  { id: "background", name: "Background", visible: true, locked: true, icon: "shape" },
];

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

function Icon(props: { paths: string[]; class?: string }) {
  return (
    <svg
      class={props.class ?? "size-4"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <For each={props.paths}>{(path) => <path d={path} />}</For>
    </svg>
  );
}

/** The name cut short with an ellipsis: its box is narrower than its text. */
function isTruncated(element: HTMLElement) {
  return element.scrollWidth > element.clientWidth;
}

export interface LayersPanelProps {
  /** The layers, top row first: the top row is the front-most layer. */
  layers?: Layer[];
  /** The selected layer's `id`. */
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Every layer's `id` in the new order, top row first. */
  onReorder?: (ids: string[]) => void;
  onChange?: (id: string, change: LayerChange) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export function LayersPanel(props: LayersPanelProps) {
  const layers = () => props.layers ?? sampleLayers;
  const selectedId = () => props.selectedId ?? null;
  const ids = () => layers().map((layer) => layer.id);
  // The row the focus is in; once it leaves the list, the Tab stop goes back to the selected row.
  const [focusedId, setFocusedId] = createSignal<string | null>(null);
  const [editingId, setEditingId] = createSignal<string | null>(null);
  // The row whose name is cut short under the pointer: only its Tooltip opens.
  const [truncatedId, setTruncatedId] = createSignal<string | null>(null);
  const tabStopId = () =>
    [focusedId(), selectedId()].find((id) => id !== null && ids().includes(id)) ?? ids()[0];

  let section: HTMLElement | undefined;
  let pendingFocus: PendingFocus | null = null;

  function nameButton(id: string) {
    const buttons = section?.querySelectorAll<HTMLElement>("[data-layer-name]") ?? [];
    return [...buttons].find((button) => button.dataset.layerName === id) ?? null;
  }

  function select(id: string) {
    if (id !== selectedId()) props.onSelect?.(id);
  }

  function add() {
    if (layers().length === 0) pendingFocus = { removedId: null, focusId: null };
    props.onAdd?.();
  }

  // The app confirms and removes the layer; the focus then moves to the row below (or above).
  function remove(id: string) {
    const current = ids();
    const index = current.indexOf(id);
    pendingFocus = { removedId: id, focusId: current[index + 1] ?? current[index - 1] ?? null };
    props.onDelete?.(id);
  }

  function rename(layer: Layer, value: string) {
    const name = value.trim();
    if (name && name !== layer.name) props.onChange?.(layer.id, { name });
  }

  function handleAction(layer: Layer, action: string) {
    if (action === "duplicate") props.onDuplicate?.(layer.id);
    // Rename starts on the next frame, once the menu has closed and handed the focus back
    // to its trigger: an edit started before would take that focus for a click away.
    if (action === "rename") requestAnimationFrame(() => setEditingId(layer.id));
    if (action === "delete") remove(layer.id);
  }

  // A click anywhere on a row selects it, except on its toggles, its menu or the rename input.
  function selectFromRow(event: MouseEvent, id: string) {
    const control = (event.target as HTMLElement).closest("button, input");
    if (control && !control.hasAttribute("data-layer-name")) return;
    select(id);
  }

  // Enter selects (the button's own click), F2 renames, Delete (or Backspace) deletes.
  function handleNameKeyDown(event: KeyboardEvent & { currentTarget: HTMLElement }, layer: Layer) {
    if (event.defaultPrevented || event.currentTarget.hasAttribute("data-dragging")) return;
    if (event.key === "F2") {
      event.preventDefault();
      setEditingId(layer.id);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      remove(layer.id);
    }
  }

  function handleListFocusOut(event: FocusEvent & { currentTarget: HTMLElement }) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusedId(null);
  }

  // Runs once the app has written back `layers` after a delete, or an add from the empty state.
  function focusPendingTarget(currentIds: string[]) {
    const pending = pendingFocus;
    if (!pending || !section) return;
    const settled =
      pending.removedId === null ? currentIds.length > 0 : !currentIds.includes(pending.removedId);
    if (!settled) return;
    pendingFocus = null;
    // Leave a focus the app has moved elsewhere (a confirm dialog, the canvas).
    const active = document.activeElement;
    if (active && active !== document.body && !section.contains(active)) return;
    const target = pending.focusId ?? tabStopId();
    if (target) nameButton(target)?.focus();
    else section.querySelector<HTMLElement>("[data-layers-add]")?.focus();
  }

  createEffect(on(ids, focusPendingTarget, { defer: true }));

  // Any key or press in the panel first forgets the focus an earlier add or delete was
  // waiting for, so a change the app refused never pulls the focus later.
  function forgetPendingFocus() {
    pendingFocus = null;
  }

  return (
    <section
      ref={section}
      aria-label="Layers panel"
      class="@container moderno-block-layers-panel flex min-h-0 flex-col bg-background text-foreground"
      on:keydown={{ handleEvent: forgetPendingFocus, capture: true }}
      on:pointerdown={{ handleEvent: forgetPendingFocus, capture: true }}
    >
      <div class="flex min-h-10 items-center justify-between gap-2 border-b border-border px-3 py-1.5">
        <h2 class="m-0 text-ui-sm font-semibold">Layers</h2>
        <Show when={layers().length > 0}>
          <Button
            variant="ghost"
            size="sm"
            class="px-1.5 @sm:px-2"
            aria-label="Add layer"
            onClick={add}
          >
            <Icon paths={icons.add} />
            <span class="hidden @sm:inline">Add layer</span>
          </Button>
        </Show>
      </div>

      <Show
        when={layers().length > 0}
        fallback={
          <div class="grid justify-items-center gap-2 px-4 py-8 text-center">
            <Icon paths={icons.layer} class="size-6 text-muted-foreground" />
            <p class="m-0 text-ui-sm font-medium">No layers yet</p>
            <p class="m-0 text-ui-sm text-muted-foreground">Add a layer to start your design.</p>
            <Button size="sm" class="mt-1" data-layers-add="" onClick={add}>
              <Icon paths={icons.add} />
              Add layer
            </Button>
          </div>
        }
      >
        <div class="min-h-0 flex-1 overflow-y-auto p-1">
          <SortableList.Root
            aria-label="Layers"
            size="sm"
            class="gap-0.5"
            items={ids()}
            onReorder={(details) => props.onReorder?.(details.items)}
            onFocusOut={handleListFocusOut}
          >
            {/* Keyed by id, not by layer: a changed layer is a new object, and the row keeps its focus. */}
            <For each={ids()}>
              {(id) => {
                const layer = () => layers().find((candidate) => candidate.id === id)!;
                const selected = () => id === selectedId();
                const tabIndex = () => (id === tabStopId() ? 0 : -1);
                // The name button's name carries the row's state: "Logo, hidden, locked".
                const state = () =>
                  `${layer().visible ? "" : ", hidden"}${layer().locked ? ", locked" : ""}`;
                return (
                  <SortableList.Item
                    value={id}
                    label={layer().name}
                    class="p-0"
                    onFocusIn={() => setFocusedId(id)}
                  >
                    <div
                      data-selected={selected() ? "" : undefined}
                      data-hidden={layer().visible ? undefined : ""}
                      data-locked={layer().locked ? "" : undefined}
                      class="group relative flex min-w-0 flex-1 items-center gap-1 self-stretch rounded-lg px-1 transition-colors before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:rounded-full hover:bg-muted data-[selected]:bg-primary/15 data-[selected]:before:bg-primary"
                      onClick={(event) => selectFromRow(event, id)}
                    >
                      <span
                        aria-hidden="true"
                        class="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-muted text-muted-foreground group-data-[hidden]:opacity-50 @sm:size-8"
                      >
                        <Show
                          when={layer().thumbnail}
                          fallback={
                            <Icon paths={kindIcon(layer().icon)} class="size-3.5 @sm:size-4" />
                          }
                        >
                          {(thumbnail) => (
                            <img
                              src={thumbnail()}
                              alt=""
                              draggable={false}
                              class="size-full object-cover"
                            />
                          )}
                        </Show>
                      </span>

                      <div class="relative flex min-w-0 flex-1 self-stretch">
                        <SortableList.ItemTrigger
                          data-layer-name={id}
                          aria-label={`${layer().name}${state()}`}
                          aria-current={selected() ? "true" : undefined}
                          tabIndex={tabIndex()}
                          class="min-w-0 flex-1 px-1 hover:bg-transparent group-data-[selected]:font-medium"
                          onDblClick={() => setEditingId(id)}
                          onKeyDown={(event) => handleNameKeyDown(event, layer())}
                        >
                          <Tooltip.Root disabled={truncatedId() !== id}>
                            <Tooltip.Trigger
                              asChild={(triggerProps) => (
                                <span
                                  {...triggerProps({
                                    onPointerEnter: (event: PointerEvent) =>
                                      setTruncatedId(
                                        isTruncated(event.currentTarget as HTMLElement) ? id : null,
                                      ),
                                  })}
                                  class="truncate group-data-[hidden]:text-muted-foreground"
                                >
                                  {layer().name}
                                </span>
                              )}
                            />
                            <Portal>
                              <Tooltip.Positioner>
                                <Tooltip.Content>{layer().name}</Tooltip.Content>
                              </Tooltip.Positioner>
                            </Portal>
                          </Tooltip.Root>
                        </SortableList.ItemTrigger>
                        <Show when={editingId() === id}>
                          <Editable.Root
                            size="sm"
                            class="absolute inset-0"
                            defaultValue={layer().name}
                            defaultEdit
                            finalFocusEl={() => nameButton(id)}
                            onValueCommit={(details) => rename(layer(), details.value)}
                            onEditChange={(details) => {
                              if (!details.edit) setEditingId(null);
                            }}
                          >
                            <Editable.Label class="sr-only">Layer name</Editable.Label>
                            <Editable.Area>
                              <Editable.Input class="cursor-text select-text" />
                            </Editable.Area>
                          </Editable.Root>
                        </Show>
                      </div>

                      {/* The toggles and the menu fade in while the pointer is on the row or the focus is in it; a pressed toggle and an open menu stay, and a touch screen (no hover) always shows them. */}
                      <Toggle.Root
                        size="sm"
                        class="w-7 px-0 data-[state=on]:bg-transparent data-[state=on]:text-foreground data-[state=on]:opacity-100 hover:data-[state=on]:bg-muted opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100"
                        tabIndex={tabIndex()}
                        aria-label={`${layer().visible ? "Hide" : "Show"} ${layer().name}`}
                        pressed={!layer().visible}
                        onPressedChange={(pressed) => props.onChange?.(id, { visible: !pressed })}
                      >
                        <Icon paths={layer().visible ? icons.visible : icons.hidden} />
                      </Toggle.Root>
                      <Toggle.Root
                        size="sm"
                        class="w-7 px-0 data-[state=on]:bg-transparent data-[state=on]:text-foreground data-[state=on]:opacity-100 hover:data-[state=on]:bg-muted opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100"
                        tabIndex={tabIndex()}
                        aria-label={`${layer().locked ? "Unlock" : "Lock"} ${layer().name}`}
                        pressed={layer().locked}
                        onPressedChange={(pressed) => props.onChange?.(id, { locked: pressed })}
                      >
                        <Icon paths={layer().locked ? icons.locked : icons.unlocked} />
                      </Toggle.Root>
                      <Menu.Root
                        size="sm"
                        onSelect={(details) => handleAction(layer(), details.value)}
                      >
                        <Menu.Trigger
                          asChild={(triggerProps) => (
                            <Button
                              variant="ghost"
                              size="sm"
                              {...triggerProps()}
                              class="w-7 px-0 data-[state=open]:opacity-100 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100"
                              tabIndex={tabIndex()}
                              aria-label={`Actions for ${layer().name}`}
                            >
                              <Icon paths={icons.actions} />
                            </Button>
                          )}
                        />
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
                );
              }}
            </For>
          </SortableList.Root>
        </div>
      </Show>
    </section>
  );
}
