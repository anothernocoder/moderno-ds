<script lang="ts">
  import SectionHeader from "../../../../registry/blocks/section-header/svelte/SectionHeader.svelte";

  type State =
    | "default"
    | "widths"
    | "section"
    | "card"
    | "empty"
    | "loading"
    | "error"
    | "disabled";

  let { locale = "en", state = "default" }: { locale?: "en" | "es"; state?: State } = $props();

  const copy = {
    en: {
      error: "We could not load this project's details.",
      tasks: "Open tasks",
      tasksDescription: "Everything your team still has to finish this sprint.",
      newTask: "New task",
      exportLabel: "Export",
      members: "Team members",
      membersDescription: "People who can see and edit this project.",
      invite: "Invite",
      manage: "Manage",
    },
    es: {
      error: "No pudimos cargar los detalles de este proyecto.",
      tasks: "Tareas abiertas",
      tasksDescription: "Todo lo que a tu equipo le queda por terminar en este sprint.",
      newTask: "Nueva tarea",
      exportLabel: "Exportar",
      members: "Miembros del equipo",
      membersDescription: "Personas que pueden ver y editar este proyecto.",
      invite: "Invitar",
      manage: "Gestionar",
    },
  }[locale];
</script>

<div class="demo-state" data-demo-state={state}>
  {#if state === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <SectionHeader />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <SectionHeader />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><SectionHeader /></div>
        </div>
      </div>
    </div>
  {:else if state === "section" || state === "empty"}
    <SectionHeader
      variant="section"
      heading={copy.tasks}
      description={copy.tasksDescription}
      count={state === "empty" ? 0 : 12}
      primaryLabel={copy.newTask}
      secondaryLabel={copy.exportLabel}
    />
  {:else if state === "card"}
    <SectionHeader
      variant="card"
      heading={copy.members}
      description={copy.membersDescription}
      count={8}
      primaryLabel={copy.invite}
      secondaryLabel={copy.manage}
    />
  {:else if state === "loading"}
    <SectionHeader loading />
  {:else if state === "error"}
    <SectionHeader error={copy.error} />
  {:else if state === "disabled"}
    <SectionHeader disabled />
  {:else}
    <SectionHeader />
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
  /* The width is the demo's, not the design system's: the block sizes only
     from contract slots. */
  .demo-scroll {
    overflow-x: auto;
  }
  .demo-wide {
    width: 50rem;
  }
</style>
