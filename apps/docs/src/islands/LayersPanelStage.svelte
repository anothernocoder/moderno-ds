<!--
  The app around one layers panel, as a consumer would write it: the block is
  controlled, so this keeps the layers and the selection and writes back every
  change the block reports. A reorder, a toggle, a rename, a duplicate, a
  delete and an add all land in `layers`. A real app would confirm a delete
  first; the demo deletes at once.
-->
<script lang="ts">
  import LayersPanel from "../../../../registry/blocks/layers-panel/svelte/LayersPanel.svelte";

  interface Layer {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    thumbnail?: string;
    icon?: string;
  }

  let {
    layers: initialLayers,
    selectedId: initialSelectedId = null,
    newLayerName,
  }: { layers: Layer[]; selectedId?: string | null; newLayerName: (count: number) => string } =
    $props();

  // Seeded once from the props: from here on the demo owns them, like an app would.
  // svelte-ignore state_referenced_locally
  let layers = $state(initialLayers);
  // svelte-ignore state_referenced_locally
  let selectedId = $state(initialSelectedId);
  // New layers need ids of their own; the block leaves naming them to the app.
  let created = 0;

  function reorder(ids: string[]) {
    layers = ids.map((id) => layers.find((layer) => layer.id === id)!);
  }

  function change(id: string, update: Partial<Layer>) {
    layers = layers.map((layer) => (layer.id === id ? { ...layer, ...update } : layer));
  }

  // The copy goes above the original, in front of it, and is selected.
  function duplicate(id: string) {
    const index = layers.findIndex((layer) => layer.id === id);
    created += 1;
    const copy = { ...layers[index]!, id: `${id}-copy-${created}`, name: `${layers[index]!.name} 2` };
    layers = [...layers.slice(0, index), copy, ...layers.slice(index)];
    selectedId = copy.id;
  }

  function remove(id: string) {
    layers = layers.filter((layer) => layer.id !== id);
    if (selectedId === id) selectedId = null;
  }

  // A new layer goes on top, in front of the others, and is selected.
  function add() {
    created += 1;
    const layer = {
      id: `layer-${created}`,
      name: newLayerName(created),
      visible: true,
      locked: false,
      icon: "shape",
    };
    layers = [layer, ...layers];
    selectedId = layer.id;
  }
</script>

<LayersPanel
  {layers}
  {selectedId}
  onselect={(id) => (selectedId = id)}
  onreorder={reorder}
  onchange={change}
  onduplicate={duplicate}
  ondelete={remove}
  onadd={add}
/>
