<!--
  The media-object block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/media-object/svelte), not
  a copy, so the demo cannot drift from the file the docs print underneath it.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (the avatar over the
  text), 30rem sits between `--container-sm` and `--container-md` (the avatar
  beside the text), 40rem between `--container-md` and `--container-lg` (a
  larger heading and body) and 50rem crosses `--container-lg` (the meta on the
  heading's far edge). The docs column never reaches the 48rem `@lg` step, so
  the wide frame holds a 50rem stage and scrolls sideways inside itself; the
  page never does.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import MediaObject from "../../../../registry/blocks/media-object/svelte/MediaObject.svelte";

  type State = "default" | "widths" | "end" | "empty" | "loading" | "error" | "disabled";

  let { locale = "en", state = "default" }: { locale?: "en" | "es"; state?: State } = $props();

  const copy = {
    en: {
      error: "We could not load this comment.",
      noteHeading: "Grace Hopper",
      noteMeta: "Pinned note",
      noteBody: "Reviews happen on Thursdays. Share a link to your file by Wednesday evening so everyone has time to look.",
      noteAction: "Open thread",
    },
    es: {
      error: "No pudimos cargar este comentario.",
      noteHeading: "Grace Hopper",
      noteMeta: "Nota fijada",
      noteBody: "Las revisiones son los jueves. Comparte el enlace a tu archivo el miércoles por la tarde para que todos tengan tiempo de verlo.",
      noteAction: "Abrir el hilo",
    },
  }[locale];
</script>

<div class="demo-state" data-demo-state={state}>
  {#if state === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <MediaObject />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <MediaObject />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <MediaObject />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><MediaObject /></div>
        </div>
      </div>
    </div>
  {:else if state === "end"}
    <MediaObject
      mediaPosition="end"
      heading={copy.noteHeading}
      meta={copy.noteMeta}
      body={copy.noteBody}
      initials="GH"
      actionLabel={copy.noteAction}
    />
  {:else if state === "empty"}
    <MediaObject body="" />
  {:else if state === "loading"}
    <MediaObject loading />
  {:else if state === "error"}
    <MediaObject error={copy.error} />
  {:else if state === "disabled"}
    <MediaObject disabled />
  {:else}
    <MediaObject />
  {/if}
</div>

<style>
  /* `minmax(0, 1fr)`, not the implicit `auto`: an auto track grows to its
     items' min-content, and the 50rem stage would widen the track past the
     frame instead of scrolling inside it. */
  .demo-widths {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 2.5rem;
  }
  .demo-scroll {
    overflow-x: auto;
  }
  /* The width is the demo's, not the design system's: the block sizes only
     from contract slots. */
  .demo-wide {
    width: 50rem;
  }
</style>
