<!--
  The timeline block in one example per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other.

  Every copy is a TimelineStage: the app around the block. The block holds no
  clock and no animation logic, so the stage keeps the time, the playing and
  loop flags, the tracks and the selected keyframe, and writes back every
  change the block reports. The stage mounts the registry source itself
  (registry/blocks/timeline/svelte), not a copy, so the demo cannot drift from
  the file the docs print underneath it. Each copy keeps its own state.

  `widths` frames the same wiring three times around the block's steps
  (ADR-0005): 18rem is below `--container-sm` (narrow label column, every
  other ruler mark), 30rem sits between `--container-sm` and `--container-md`
  (the label column widens) and 40rem crosses `--container-md` (every ruler
  mark shows).

  `editing` starts with the playhead between keyframes, ready to add one, and
  `zoom` starts at 400%, with the frame marks showing and the playhead late in
  the animation, scrolled into view.

  `data-demo-state` names each copy on its wrapper, so the e2e spec can find
  each copy by what it is meant to show.
-->
<script lang="ts">
  import TimelineStage from "./TimelineStage.svelte";

  type Example = "default" | "widths" | "tracks" | "frames" | "editing" | "zoom";

  let { locale = "en", example = "default" }: { locale?: "en" | "es"; example?: Example } =
    $props();

  const copy = {
    en: {
      opacity: "Opacity",
      position: "Position",
      scale: "Scale",
      rotation: "Rotation",
      colour: "Colour",
      blur: "Blur",
      shadow: "Shadow",
      volume: "Volume",
    },
    es: {
      opacity: "Opacidad",
      position: "Posición",
      scale: "Escala",
      rotation: "Rotación",
      colour: "Color",
      blur: "Desenfoque",
      shadow: "Sombra",
      volume: "Volumen",
    },
  }[locale];

  function track(id: keyof typeof copy, times: number[]) {
    return {
      id,
      label: copy[id],
      keyframes: times.map((time, index) => ({ id: `${id}-${index + 1}`, time })),
    };
  }

  const threeTracks = [
    track("opacity", [0, 1, 4]),
    track("position", [0.5, 2.5]),
    track("scale", [1.5, 3, 4.5]),
  ];

  const manyTracks = [
    ...threeTracks,
    track("rotation", [0, 2, 5]),
    track("colour", [1, 3.5]),
    track("blur", [0.5, 1.5]),
    track("shadow", [2, 4]),
    track("volume", [0, 4.5]),
  ];

  const longTracks = [
    track("opacity", [0, 12, 80]),
    track("position", [5, 45]),
    track("volume", [0, 30, 60, 90]),
  ];
</script>

<div class="demo-state" data-demo-state={example}>
  {#if example === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <TimelineStage tracks={threeTracks} duration={5} />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <TimelineStage tracks={threeTracks} duration={5} />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <TimelineStage tracks={threeTracks} duration={5} />
      </div>
    </div>
  {:else if example === "tracks"}
    <TimelineStage tracks={manyTracks} duration={5} />
  {:else if example === "frames"}
    <TimelineStage tracks={longTracks} duration={90} fps={24} />
  {:else if example === "editing"}
    <TimelineStage tracks={threeTracks} duration={5} time={2} />
  {:else if example === "zoom"}
    <TimelineStage tracks={threeTracks} duration={5} time={4} zoom={4} />
  {:else}
    <TimelineStage tracks={threeTracks} duration={5} time={1.4} />
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
</style>
