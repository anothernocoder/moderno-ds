<!--
  The layers panel block in one example per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other.

  Every copy is a LayersPanelStage: the app around the block. The block is
  controlled, so the stage keeps the layers and the selection and writes back
  every change the block reports. The stage mounts the registry source itself
  (registry/blocks/layers-panel/svelte), not a copy, so the demo cannot drift
  from the file the docs print underneath it. Each copy keeps its own state.

  A layers panel lives in an editor's sidebar, so each copy sits in a framed
  panel of a sidebar's width. `widths` frames the same wiring twice around the
  block's one step (ADR-0005): 16rem is below `--container-sm` (small
  thumbnails, an icon-only Add layer) and 28rem is above it (bigger
  thumbnails, Add layer with its label). `many` gives the panel a fixed
  height, so the list scrolls, with names long enough to be cut short.

  `data-demo-state` names each copy on its wrapper, so the e2e spec can find
  each copy by what it is meant to show.
-->
<script lang="ts">
  import LayersPanelStage from "./LayersPanelStage.svelte";

  type Example = "default" | "widths" | "empty" | "many";

  let { locale = "en", example = "default" }: { locale?: "en" | "es"; example?: Example } =
    $props();

  const copy = {
    en: {
      title: "Title",
      logo: "Logo",
      photo: "Hero photo",
      button: "Call to action",
      guides: "Guides",
      background: "Background",
      caption: "Caption under the hero photo, second line",
      avatar: "Author avatar",
      quote: "Pull quote from the interview with the lead designer",
      divider: "Divider",
      footer: "Footer links",
      badge: "New badge",
      newLayer: (count: number) => `Layer ${count}`,
    },
    es: {
      title: "Título",
      logo: "Logotipo",
      photo: "Foto principal",
      button: "Llamada a la acción",
      guides: "Guías",
      background: "Fondo",
      caption: "Pie de la foto principal, segunda línea",
      avatar: "Avatar del autor",
      quote: "Cita destacada de la entrevista con la diseñadora principal",
      divider: "Separador",
      footer: "Enlaces del pie",
      badge: "Insignia de novedad",
      newLayer: (count: number) => `Capa ${count}`,
    },
  }[locale];

  /**
   * Stand-ins for the thumbnails an editor renders from its canvas, inline so
   * the demo needs no network: a real app passes its own image URLs.
   */
  const thumbnail = (body: string) =>
    "data:image/svg+xml," +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${body}</svg>`);
  const photo = thumbnail(
    '<rect width="32" height="32" fill="#7fb2d9"/>' +
      '<circle cx="23" cy="9" r="4" fill="#f4d58d"/>' +
      '<path d="M0 32 11 16l8 10 4-5 9 11z" fill="#3f6b4f"/>',
  );
  const avatar = thumbnail(
    '<rect width="32" height="32" fill="#3f4a5a"/>' +
      '<circle cx="16" cy="13" r="6" fill="#d9c2a7"/>' +
      '<path d="M5 32a11 11 0 0 1 22 0z" fill="#8a6b52"/>',
  );

  type Layer = {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    thumbnail?: string;
    icon?: string;
  };

  function layer(id: string, name: string, rest: Partial<Layer> = {}): Layer {
    return { id, name, visible: true, locked: false, ...rest };
  }

  const designLayers = [
    layer("title", copy.title, { icon: "text" }),
    layer("logo", copy.logo, { icon: "image", locked: true }),
    layer("photo", copy.photo, { thumbnail: photo }),
    layer("button", copy.button, { icon: "group" }),
    layer("guides", copy.guides, { icon: "frame", visible: false }),
    layer("background", copy.background, { icon: "shape", locked: true }),
  ];

  const manyLayers = [
    layer("badge", copy.badge, { icon: "shape" }),
    layer("title", copy.title, { icon: "text" }),
    layer("quote", copy.quote, { icon: "text" }),
    layer("avatar", copy.avatar, { thumbnail: avatar }),
    layer("caption", copy.caption, { icon: "text", visible: false }),
    layer("photo", copy.photo, { thumbnail: photo }),
    layer("button", copy.button, { icon: "group" }),
    layer("divider", copy.divider, { icon: "shape", locked: true }),
    layer("footer", copy.footer, { icon: "group" }),
    layer("logo", copy.logo, { icon: "image", locked: true }),
    layer("guides", copy.guides, { icon: "frame", visible: false }),
    layer("background", copy.background, { icon: "shape", locked: true }),
  ];
</script>

<div class="demo-state" data-demo-state={example}>
  {#if example === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 16rem" data-label="16rem">
        <div class="layers-frame">
          <LayersPanelStage layers={designLayers} selectedId="photo" newLayerName={copy.newLayer} />
        </div>
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 28rem" data-label="28rem">
        <div class="layers-frame">
          <LayersPanelStage layers={designLayers} selectedId="photo" newLayerName={copy.newLayer} />
        </div>
      </div>
    </div>
  {:else if example === "empty"}
    <div class="layers-frame layers-frame--sidebar">
      <LayersPanelStage layers={[]} newLayerName={copy.newLayer} />
    </div>
  {:else if example === "many"}
    <div class="layers-frame layers-frame--sidebar layers-frame--short">
      <LayersPanelStage layers={manyLayers} selectedId="quote" newLayerName={copy.newLayer} />
    </div>
  {:else}
    <div class="layers-frame layers-frame--sidebar">
      <LayersPanelStage layers={designLayers} selectedId="logo" newLayerName={copy.newLayer} />
    </div>
  {/if}
</div>

<style>
  /* `minmax(0, 1fr)`, not the implicit `auto`: an auto track grows to its
     items' min-content and could widen past the preview. */
  .demo-widths {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 2.5rem;
  }
  /* The editor panel around the block: its edge and its corner. */
  .layers-frame {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--background);
  }
  /* A sidebar's width, and never wider than the stage. */
  .layers-frame--sidebar {
    width: 17rem;
    max-width: 100%;
  }
  /* A panel shorter than its list: the list scrolls under the header. */
  .layers-frame--short {
    height: 18rem;
  }
</style>
