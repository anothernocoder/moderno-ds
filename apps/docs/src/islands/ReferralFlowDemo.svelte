<!--
  The referral flow, live and walkable, in two shapes.

  With no `example` it is the page's main preview: one tab per frame width,
  desktop first in the walk, plus the readout of what the assembly told the page
  it was doing. Only the active tab's copy is mounted (DemoTabs), so switching
  tabs starts a fresh walk at `referral-invite` and the readout starts over.

  With `example="returning"` it mounts one copy at the tablet width, opened on
  the reward screen for a member who already invited three friends — the
  `initialStep` + `initialFriends` pair a real route hands the flow.

  This is the registry source itself (registry/flows/referral/svelte), not a
  copy — what renders below is what `moderno add referral-svelte` writes into a
  consumer project, and the three screens inside it are the registry screens the
  CLI installs alongside it (astro.config.mjs resolves the assembly's
  `@/components/screens/…` imports back to them).

  The walk the reader can take, with nothing faked but the mail:

    referral-invite →[Send invites]→ referral-share →[Skip for now]→
      referral-reward →[Invite more friends]→ referral-share

  "Not now" on the invite form also leaves for the share screen. The moves
  between the share and reward screens are plain links the mastheads draw; the
  assembly catches the click the way a client router does.

  The readout under the frame is the docs', not the design system's: it is the
  `onstepchange` and `oninvite` callbacks, printed as they fire. A real app puts
  the first into its router and the second into its API.
-->
<script lang="ts">
  import ReferralFlow from "../../../../registry/flows/referral/svelte/ReferralFlow.svelte";
  import DemoTabs from "./DemoTabs.svelte";
  import DeviceFrame from "./DeviceFrame.svelte";

  type ReferralStep = "referral-invite" | "referral-share" | "referral-reward";

  let { locale = "en", example }: { locale?: "en" | "es"; example?: "returning" } = $props();

  /** The flow in order — what the readout walks, and what the assembly sequences. */
  const steps: ReferralStep[] = ["referral-invite", "referral-share", "referral-reward"];

  /** A member who came back: three friends invited, two of them joined. */
  const returningFriends = [
    { id: "grace", name: "Grace Hopper", email: "grace@example.com", status: "Joined" },
    { id: "alan", name: "Alan Turing", email: "alan@example.com", status: "Joined" },
    { id: "ada", name: "Ada Lovelace", email: "ada@example.com", status: "Invited" },
  ];

  type Frame = "phone" | "tablet" | "desktop";

  const copy = {
    en: {
      label: "Referral flow frames",
      tabs: [
        { id: "phone", icon: "phone", label: "Phone" },
        { id: "tablet", icon: "tablet", label: "Tablet" },
        { id: "desktop", icon: "desktop", label: "Desktop" },
      ],
      readout: "What the assembly reported",
      empty: "Nothing yet — move the flow above.",
      note: "The two callbacks the assembly hands up: the step it moved to, for your router, and the addresses it invited, for your API. The reward numbers are counted from the same list the share screen shows.",
    },
    es: {
      label: "Marcos del flujo de invitaciones",
      tabs: [
        { id: "phone", icon: "phone", label: "Teléfono" },
        { id: "tablet", icon: "tablet", label: "Tableta" },
        { id: "desktop", icon: "desktop", label: "Escritorio" },
      ],
      readout: "Lo que informó el ensamblaje",
      empty: "Nada todavía — mueve el flujo de arriba.",
      note: "Los dos callbacks que el ensamblaje devuelve: el paso al que se movió, para tu router, y las direcciones que invitó, para tu API. Los números de recompensa se cuentan de la misma lista que muestra la pantalla de compartir.",
    },
  }[locale];

  let step = $state<ReferralStep>("referral-invite");
  let events = $state<string[]>([]);

  function record(line: string) {
    events = [line, ...events].slice(0, 6);
  }

  function onstepchange(next: ReferralStep) {
    step = next;
    record(`onstepchange("${next}")`);
  }

  function oninvite(emails: string[]) {
    record(`oninvite(${JSON.stringify(emails)})`);
  }

  function frameOf(id: string): Frame {
    return id === "phone" || id === "tablet" ? id : "desktop";
  }

  /** A tab mounts a fresh flow at its first step, so the readout starts over too. */
  function fresh() {
    step = "referral-invite";
    events = [];
  }
</script>

{#if example === "returning"}
  <!-- One example, as its own preview: the stage DemoTabs would draw, without the tab list. -->
  <div class="demo-tabs">
    <div class="demo-tabs-panel" data-demo-state={example}>
      <div class="demo-stage">
        <DeviceFrame device="tablet">
          <ReferralFlow initialStep="referral-reward" initialFriends={returningFriends} />
        </DeviceFrame>
      </div>
    </div>
  </div>
{:else}
  <DemoTabs tabs={copy.tabs} label={copy.label}>
    {#snippet stage(id)}
      {@const frame = frameOf(id)}
      <div class="referral-stage" {@attach fresh}>
        <DeviceFrame device={frame}>
          <ReferralFlow {onstepchange} {oninvite} />
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
{/if}

<style>
  .referral-stage {
    display: grid;
    gap: var(--spacing-6);
  }
  /* The one thing the docs override on the shipped files, and only here: a
     screen's root is `min-h-dvh`, because a screen is as tall as the window it
     owns. A browser window's worth of flow inside a docs page would bury the
     prose, so inside this frame "the window" is the frame. Nothing in
     `registry/` changes — this rule is the frame telling the screen how big the
     window is, which is what a real viewport does. The flow's own wrapper is in
     the chain, so it has to carry the height through. */
  :global(.screen-window .moderno-flow-referral) {
    block-size: 100%;
  }
  :global(.screen-window .moderno-flow-referral > div),
  :global(.screen-window .moderno-flow-referral > div > div) {
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
  .demo-readout-note {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.8125rem;
    line-height: 1.5;
  }
</style>
