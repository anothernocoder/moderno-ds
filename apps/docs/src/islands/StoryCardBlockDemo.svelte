<!--
  The story-card block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/story-card/svelte), not
  a copy, so the demo cannot drift from the file the docs print underneath it.

  The block ships its sample story with no image, since a consumer brings their
  own. The demo passes a local illustration, so the page loads no third-party
  image; the "no image" example leaves it out.

  A story is a phone-sized format, so every state mounts on a 24rem stage (the
  width of `--container-sm`), centred in the preview. `widths` frames the same
  file four times instead, one in each band of the block's steps (ADR-0005):
  18rem is below `--container-sm`, 30rem sits between `--container-sm` and
  `--container-md` (a larger title and detail), 40rem between `--container-md`
  and `--container-lg` (the card at its full size, with more room inside) and
  50rem crosses `--container-lg` (room above and below the card). The docs
  column never reaches the 48rem `@lg` step, so the wide frame holds a 50rem
  stage and scrolls sideways inside itself; the page never does.

  The error copy holds its message the way a consumer does, as a string, and
  "Try again" clears it to "": the block treats the empty string as no error
  and shows the story again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import StoryCard from "../../../../registry/blocks/story-card/svelte/StoryCard.svelte";
  import stackImage from "../assets/story-card/stoneware-stack.svg?url";

  type State = "default" | "widths" | "no-image" | "empty" | "loading" | "error" | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: {
      error: "We could not load this story.",
      alt: "Three stoneware bowls stacked in front of a terracotta arch",
    },
    es: {
      error: "No pudimos cargar esta historia.",
      alt: "Tres cuencos de gres apilados delante de un arco de terracota",
    },
  }[locale];

  const image = { src: stackImage, alt: copy.alt };

  let error = $state(copy.error);
</script>

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <StoryCard {image} />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <StoryCard {image} />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <StoryCard {image} />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><StoryCard {image} /></div>
        </div>
      </div>
    </div>
  {:else}
    <div class="demo-phone">
      {#if shown === "no-image"}
        <StoryCard />
      {:else if shown === "empty"}
        <StoryCard title="" />
      {:else if shown === "loading"}
        <StoryCard loading />
      {:else if shown === "error"}
        <StoryCard {image} {error} onretry={() => (error = "")} />
      {:else if shown === "disabled"}
        <StoryCard {image} disabled />
      {:else}
        <StoryCard {image} />
      {/if}
    </div>
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
  /* The widths are the demo's, not the design system's: the block sizes only
     from contract slots. The phone stage is `--container-sm` wide. */
  .demo-phone {
    width: min(100%, var(--container-sm));
    margin-inline: auto;
  }
  .demo-wide {
    width: 50rem;
  }
</style>
