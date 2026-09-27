<!--
  The action-panel block in one state per Preview: the page's main preview
  mounts `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/action-panel/svelte), not
  a copy, so the demo cannot drift from the file the docs print underneath it.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (each control under its
  text), 30rem sits between `--container-sm` and `--container-md` (controls
  beside their text), 40rem between `--container-md` and `--container-lg` (a
  larger heading) and 50rem crosses `--container-lg` (the heading beside the
  panel). The docs column never reaches the 48rem `@lg` step, so the wide frame
  holds a 50rem stage and scrolls sideways inside itself; the page never does.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import ActionPanel from "../../../../registry/blocks/action-panel/svelte/ActionPanel.svelte";

  type State =
    | "default"
    | "widths"
    | "destructive"
    | "empty"
    | "loading"
    | "error"
    | "disabled";

  let { locale = "en", state = "default" }: { locale?: "en" | "es"; state?: State } = $props();

  const copy = {
    en: {
      error: "We could not load your settings.",
      dangerHeading: "Danger zone",
      dangerDescription: "These actions cannot be undone.",
      danger: [
        {
          id: "transfer",
          title: "Transfer ownership",
          description: "Hand this workspace to another admin. You keep member access.",
          action: "Transfer",
        },
        {
          id: "delete",
          title: "Delete workspace",
          description: "Remove the workspace, its documents and its members for good.",
          action: "Delete",
        },
      ],
    },
    es: {
      error: "No pudimos cargar tus ajustes.",
      dangerHeading: "Zona de peligro",
      dangerDescription: "Estas acciones no se pueden deshacer.",
      danger: [
        {
          id: "transfer",
          title: "Transferir la propiedad",
          description: "Cede este espacio a otro administrador. Sigues como miembro.",
          action: "Transferir",
        },
        {
          id: "delete",
          title: "Eliminar el espacio",
          description: "Borra el espacio, sus documentos y sus miembros para siempre.",
          action: "Eliminar",
        },
      ],
    },
  }[locale];
</script>

<div class="demo-state" data-demo-state={state}>
  {#if state === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <ActionPanel />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <ActionPanel />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <ActionPanel />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><ActionPanel /></div>
        </div>
      </div>
    </div>
  {:else if state === "destructive"}
    <ActionPanel
      variant="destructive"
      heading={copy.dangerHeading}
      description={copy.dangerDescription}
      items={copy.danger}
    />
  {:else if state === "empty"}
    <ActionPanel items={[]} />
  {:else if state === "loading"}
    <ActionPanel loading />
  {:else if state === "error"}
    <ActionPanel error={copy.error} />
  {:else if state === "disabled"}
    <ActionPanel disabled />
  {:else}
    <ActionPanel />
  {/if}
</div>

<style>
  /* `minmax(0, 1fr)`, not the implicit `auto`: an auto track grows to its
     items' min-content, and the 50rem stage would widen the track past the
     panel instead of scrolling inside its own frame. */
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
