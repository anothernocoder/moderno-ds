<!--
  The onboarding flow, live and walkable, plus the readout of what its assembly
  told the page it was doing — one frame width per tab. Only the active tab's
  copy is mounted (DemoTabs), so switching tabs starts a fresh walk and the
  readout starts over with it.

  This is the registry source itself (registry/flows/onboarding/svelte), not a
  copy: what renders below is what `moderno add onboarding-svelte` writes, and
  the four screens inside it are the registry screens the CLI installs with it
  (astro.config.mjs resolves the assembly's `@/components/screens/…` imports).

  The walk a reader can take:

    welcome →[Continue]→ profile-setup →[Save changes]→ plan-select
            →[a plan]→ invite-team →[Continue]→ oncomplete, back to welcome

  and every "Skip for now" moves one step on ("Skip for now" on welcome leaves
  the flow at once).

  The readout is the docs', not the design system's: it prints `onstepchange`
  and `oncomplete` as they fire. A real app puts the first into its router and
  the second into its API.

  `initialStep` and `initialName` pass straight to the assembly, so the Examples
  can open the flow part-way through or with a name already known.
-->
<script lang="ts">
  import OnboardingFlow from "../../../../registry/flows/onboarding/svelte/OnboardingFlow.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";

  type OnboardingStep = "welcome" | "profile-setup" | "plan-select" | "invite-team";

  let {
    locale = "en",
    initialStep = "welcome",
    initialName = "",
  }: {
    locale?: "en" | "es";
    initialStep?: OnboardingStep;
    initialName?: string;
  } = $props();

  /** The flow in order — what the readout walks, and what the assembly sequences. */
  const steps: OnboardingStep[] = ["welcome", "profile-setup", "plan-select", "invite-team"];

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Onboarding flow frames",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      readout: "What the assembly reported",
      empty: "Nothing yet — move the flow above.",
      note: "The two callbacks the assembly hands up: the step it moved to, for your router, and what the reader set up, for your API. The flow returns to welcome after oncomplete because leaving is the app's job, not the flow's.",
    },
    es: {
      label: "Marcos del flujo de bienvenida",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      readout: "Lo que informó el ensamblaje",
      empty: "Nada todavía — mueve el flujo de arriba.",
      note: "Los dos callbacks que el ensamblaje devuelve: el paso al que se movió, para tu router, y lo que la persona configuró, para tu API. El flujo vuelve a welcome después de oncomplete porque salir es trabajo de la aplicación, no del flujo.",
    },
  }[locale];

  let step = $state<OnboardingStep>("welcome");
  let events = $state<string[]>([]);

  function record(line: string) {
    events = [line, ...events].slice(0, 6);
  }

  function onstepchange(next: OnboardingStep) {
    step = next;
    record(`onstepchange("${next}")`);
  }

  function oncomplete(result: { name: string; plan?: string; invites: string[] }) {
    record(`oncomplete(${JSON.stringify(result)})`);
  }

  function frameOf(id: string): Frame {
    return id === "phone" || id === "tablet" ? id : "desktop";
  }

  /** A tab mounts a fresh flow at its first step, so the readout starts over too. */
  function fresh() {
    step = initialStep;
    events = [];
  }
</script>

<DemoTabs tabs={copy.tabs} label={copy.label}>
  {#snippet stage(id)}
    {@const frame = frameOf(id)}
    <div class="onboarding-stage" {@attach fresh}>
      <DeviceFrame device={frame}>
        <OnboardingFlow {initialStep} {initialName} {onstepchange} {oncomplete} />
      </DeviceFrame>

      <div class="demo-readout" role="group" aria-label={copy.readout}>
        <ol class="demo-steps">
          {#each steps as name (name)}
            <li class:is-current={step === name} aria-current={step === name ? "step" : undefined}>
              <code>{name}</code>
            </li>
          {/each}
        </ol>
        <ul class="demo-events">
          {#if events.length === 0}
            <li class="demo-events-empty">{copy.empty}</li>
          {:else}
            {#each events as line, index (`${index}-${line}`)}
              <li><code>{line}</code></li>
            {/each}
          {/if}
        </ul>
        <p class="demo-readout-note">{copy.note}</p>
      </div>
    </div>
  {/snippet}
</DemoTabs>

<style>
  .onboarding-stage {
    display: grid;
    gap: var(--spacing-6);
  }
  /* A screen's root is `min-h-dvh`; inside this frame "the window" is the
     frame, and the flow's own wrapper is in the chain, so it carries the
     height through. Nothing in `registry/` changes. */
  :global(.screen-window .moderno-flow-onboarding) {
    block-size: 100%;
  }
  :global(.screen-window .moderno-flow-onboarding > div),
  :global(.screen-window .moderno-flow-onboarding > div > div) {
    min-block-size: 100%;
  }
  .demo-readout {
    display: grid;
    gap: var(--spacing-3);
    max-inline-size: 62rem;
    margin-inline: auto;
    inline-size: 100%;
  }
  .demo-steps {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .demo-steps li {
    padding: var(--spacing-1) var(--spacing-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--muted-foreground);
  }
  .demo-steps li.is-current {
    border-color: var(--primary);
    color: var(--foreground);
  }
  .demo-events {
    display: grid;
    gap: var(--spacing-1);
    margin: 0;
    padding: 0;
    list-style: none;
    min-block-size: 6rem;
    align-content: start;
  }
  .demo-events-empty {
    color: var(--muted-foreground);
  }
  .demo-events code {
    overflow-wrap: anywhere;
  }
  .demo-readout-note {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.8125rem;
    line-height: 1.5;
  }
</style>
