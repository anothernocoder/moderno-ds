<!--
  One tab per state of a block or screen preview, one mounted copy at a time.

  Blocks and screens have several faces worth seeing (default, error, loading,
  a narrow container…) but a single file of source, so their Preview keeps one
  source panel and switches only the live stage. Mounting just the active copy
  keeps the stage one composition tall instead of five stacked cards, and means
  whatever a reader (or a test) measures on the stage is the state they chose.

  The tab list follows the WAI-ARIA tabs pattern: arrow keys, Home and End move
  and select, and only the selected tab is in the tab order. A tab with an
  `icon` shows that device instead of its label; the label stays as its
  accessible name and tooltip. Styling is global (docs.css `.demo-tabs*`) so
  every block page shares it.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Tab {
    id: string;
    /** Text of the tab; with an `icon` it is the tooltip and accessible name instead. */
    label: string;
    /** Draw this device instead of the label. */
    icon?: "phone" | "tablet" | "desktop";
    /** One sentence under the stage saying what this state shows. */
    caption?: string;
  }

  let {
    tabs,
    stage,
    label = "States",
  }: {
    tabs: Tab[];
    /** Renders the stage for one tab id. */
    stage: Snippet<[string]>;
    /** Accessible name of the tab list. */
    label?: string;
  } = $props();

  const uid = $props.id();
  let active = $state(tabs[0]!.id);
  const current = $derived(tabs.find((t) => t.id === active) ?? tabs[0]!);
  let buttons: HTMLButtonElement[] = $state([]);

  function onKeydown(event: KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight"
        ? index === last ? 0 : index + 1
        : event.key === "ArrowLeft"
          ? index === 0 ? last : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    active = tabs[next]!.id;
    buttons[next]?.focus();
  }
</script>

<div class="demo-tabs">
  <div class="demo-tabs-list" role="tablist" aria-label={label}>
    {#each tabs as tab, i (tab.id)}
      <button
        bind:this={buttons[i]}
        type="button"
        role="tab"
        class="demo-tab"
        id="{uid}-tab-{tab.id}"
        aria-selected={tab.id === active}
        aria-controls="{uid}-panel"
        tabindex={tab.id === active ? 0 : -1}
        data-demo-tab={tab.id}
        aria-label={tab.icon ? tab.label : undefined}
        title={tab.icon ? tab.label : undefined}
        onclick={() => (active = tab.id)}
        onkeydown={(e) => onKeydown(e, i)}
      >
        {#if tab.icon}
          <svg class="demo-tab-icon" viewBox="0 0 24 24" aria-hidden="true">
            {#if tab.icon === "phone"}
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <path d="M12 18h.01" />
            {:else if tab.icon === "tablet"}
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <path d="M12 18h.01" />
            {:else}
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            {/if}
          </svg>
        {:else}
          {tab.label}
        {/if}
      </button>
    {/each}
  </div>
  <div
    class="demo-tabs-panel"
    role="tabpanel"
    id="{uid}-panel"
    aria-labelledby="{uid}-tab-{current.id}"
    data-demo-state={current.id}
  >
    <div class="demo-stage">
      {#key current.id}
        {@render stage(current.id)}
      {/key}
    </div>
    {#if current.caption}
      <p class="demo-caption">{current.caption}</p>
    {/if}
  </div>
</div>
