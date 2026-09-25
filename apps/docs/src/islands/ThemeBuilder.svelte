<!--
  Theme Builder — edits the contract slots in both scopes (`:root` + `.dark`)
  with a live preview over the *real* @moderno components, then exports a
  theme.css + tokens.dtcg.json + DESIGN.md + CLI snippet. Export runs through the
  same `@moderno-ui/theme-compile` CI uses (via `buildTheme`), so a clean export
  here is a theme that passes CI; the inline WCAG AA checker surfaces its warnings.
  State persists to the URL (`?t=`) and localStorage. A registry base's brand
  notes do not: they are fetched with the base, and again on reload, from its
  published DESIGN.md.

  The preview owns the page: a masonry gallery of components fills the main
  column, and the editor — slots, contrast report and export — lives in a
  panel that slides in from the right edge. Open, the panel reserves its width
  on a wide screen (the gallery reflows beside it); on a narrow one it lays
  over the gallery instead, and Escape or the scrim closes it.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { COLOR_GROUPS } from "@moderno-ui/tokens/contract";
  import ThemePreviewGallery from "./ThemePreviewGallery.svelte";
  import {
    buildTheme,
    defaultThemeState,
    isStillBase,
    previewStyle,
    readBrandNotes,
    slugify,
    tokensToState,
    EXTENDED_SLOTS,
    OTHER_SLOTS,
    type ThemeState,
  } from "../lib/theme.ts";
  import { createThemeStore } from "../lib/themeStore.ts";
  import { hexToOklch, oklchToHex } from "../lib/color.ts";

  interface Strings {
    light: string;
    dark: string;
    name: string;
    description: string;
    descriptionHint: string;
    notesKept: string;
    notesDraft: string;
    notesLoading: string;
    startFrom: string;
    import: string;
    paste: string;
    reset: string;
    export: string;
    copy: string;
    download: string;
    pickColor: string;
    cliSnippet: string;
    contrastOk: string;
    contrastFail: string;
    invalid: string;
    copied: string;
    /** Placeholder on an optional (extended) slot left blank. */
    inherited: string;
    customize: string;
    closePanel: string;
    contrast: string;
    preview: string;
    /** Editor group labels, keyed by the contract group id. */
    groups: Record<string, string>;
  }

  /** A registry theme to start from; `item` is its directory under `/r/themes/`. */
  interface Base {
    item: string;
    label: string;
  }

  // The bases come from the registry (siteThemes.ts), so a new theme under
  // registry/themes/ is offered here without touching the island.
  let { strings, bases }: { strings: Strings; bases: Base[] } = $props();

  // Where the panel docks beside the gallery rather than over it. Kept in step
  // with the `@media` rule that reserves the panel's width on `.layout`.
  const DOCKED = "(min-width: 64rem)";
  const PANEL_KEY = "moderno-theme-builder-panel";

  // The island is `client:only`, so the browser globals are there at init: the
  // first paint already has the panel where it will stay, with no slide-in.
  // A remembered choice wins; otherwise it starts open only where it docks.
  function initialPanel(): boolean {
    try {
      const saved = localStorage.getItem(PANEL_KEY);
      if (saved === "open" || saved === "closed") return saved === "open";
    } catch {
      /* storage blocked */
    }
    return matchMedia(DOCKED).matches;
  }

  let state = $state<ThemeState>(defaultThemeState());
  let scope = $state<"light" | "dark">("light");
  let panelOpen = $state(initialPanel());
  let pasteOpen = $state(false);
  let pasteText = $state("");
  let pasteError = $state("");
  let panelToggle = $state<HTMLButtonElement>();

  function setPanel(open: boolean) {
    panelOpen = open;
    try {
      localStorage.setItem(PANEL_KEY, open ? "open" : "closed");
    } catch {
      /* storage blocked */
    }
    // Closing hides the panel's contents (inert), so focus inside it would be
    // stranded: hand it back to the control that reopens it.
    if (!open) panelToggle?.focus();
  }

  function onKeydown(e: KeyboardEvent) {
    // Escape only dismisses the overlay form; docked, the panel is part of the
    // page and Escape inside a field shouldn't yank it away.
    if (e.key === "Escape" && panelOpen && !matchMedia(DOCKED).matches) setPanel(false);
  }

  // Brand notes of the registry bases fetched so far, by item: null when the
  // base has none (or its DESIGN.md failed to load), so the export drafts them.
  let baseNotes = $state<Record<string, string | null>>({});
  // Only while the theme is still its base (the name test keptBrandNotes
  // applies) does a missing entry mean "not loaded yet" rather than "draft".
  const stillBase = $derived(isStillBase(state));
  const notesLoading = $derived(stillBase && !(state.base! in baseNotes));
  const notesKept = $derived(stillBase && baseNotes[state.base!] != null);
  const bundle = $derived(buildTheme(state, state.base === null ? null : baseNotes[state.base]));
  const activeScope = $derived(state[scope]);
  // Built by the same helper the export uses, so a cleared optional field
  // previews the inherited default instead of a blanked slot (`--slot: ` makes
  // var(--slot) substitute to nothing, and the stage loses that padding/radius).
  const previewVars = $derived(previewStyle(state[scope]));

  // The editor groups derive from the contract data — a slot added to
  // @moderno-ui/tokens shows up here without touching the island. Labels come
  // from the docs i18n; an unmapped group falls back to its id.
  const GROUPS = COLOR_GROUPS.map(({ group, slots }) => ({
    label: strings.groups[group] ?? group,
    slots,
  }));

  // Only the first groups start open: the whole contract at once is a wall of
  // fields, and a collapsed group still shows its colours in the summary strip.
  const OPEN_GROUPS = 2;

  const tokensJson = $derived(JSON.stringify(bundle.tokens, null, 2));
  const tokensFile = $derived(`${slugify(state.name) || "theme"}.tokens.dtcg.json`);

  function loadDoc(doc: unknown, base: string | null) {
    try {
      state = tokensToState(doc, base);
      pasteError = "";
      pasteOpen = false;
    } catch (err) {
      pasteError = (err as Error).message;
    }
  }

  const registryUrl = (item: string, file: string) =>
    `${import.meta.env.BASE_URL.replace(/\/$/, "")}/r/themes/${item}/${file}`;

  async function loadBaseNotes(item: string) {
    if (item in baseNotes) return;
    let notes: string | null = null;
    try {
      const res = await fetch(registryUrl(item, "DESIGN.md"));
      if (res.ok) notes = readBrandNotes(await res.text());
    } catch {
      /* offline: the export drafts the notes instead */
    }
    baseNotes[item] = notes;
  }

  async function importBase(item: string) {
    const [res] = await Promise.all([
      fetch(registryUrl(item, "tokens.dtcg.json")),
      loadBaseNotes(item),
    ]);
    if (res.ok) loadDoc(await res.json(), item);
  }

  function applyPaste() {
    try {
      loadDoc(JSON.parse(pasteText), null);
    } catch {
      pasteError = strings.invalid;
    }
  }

  function reset() {
    state = defaultThemeState();
  }

  async function copy(text: string, btn: HTMLButtonElement) {
    try {
      await navigator.clipboard.writeText(text);
      const prev = btn.textContent;
      btn.textContent = strings.copied;
      setTimeout(() => (btn.textContent = prev), 1200);
    } catch {
      /* clipboard blocked */
    }
  }

  function download(filename: string, text: string, type: string) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Persistence policy lives in themeStore (tested); the island only wires
  // the real browser dependencies in. Built lazily — SSR has no localStorage.
  const store = () =>
    createThemeStore({
      storage: localStorage,
      url: () => location.href,
      replaceUrl: (url) => history.replaceState(null, "", url),
    });

  onMount(() => {
    state = store().hydrate();
    // A reload or a shared link restores the base, not its notes: fetch them.
    if (state.base !== null) void loadBaseNotes(state.base);
  });

  $effect(() => {
    store().persist(state);
  });
</script>

<svelte:window onkeydown={onKeydown} />

{#snippet scopeToggle()}
  <div class="tb-seg" role="group" aria-label={`${strings.light} / ${strings.dark}`}>
    <button type="button" aria-pressed={scope === "light"} onclick={() => (scope = "light")}>
      {strings.light}
    </button>
    <button type="button" aria-pressed={scope === "dark"} onclick={() => (scope = "dark")}>
      {strings.dark}
    </button>
  </div>
{/snippet}

<div class="tb" data-panel={panelOpen ? "open" : "closed"}>
  <div class="tb-toolbar">
    {@render scopeToggle()}
    <button
      type="button"
      class="tb-btn tb-toggle"
      aria-controls="tb-panel"
      aria-expanded={panelOpen}
      bind:this={panelToggle}
      onclick={() => setPanel(!panelOpen)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M15 4v16" />
      </svg>
      {strings.customize}
      {#if bundle.valid && bundle.warnings.length > 0}
        <span class="tb-badge" title={strings.contrastFail}>{bundle.warnings.length}</span>
      {/if}
    </button>
  </div>

  <section class="tb-preview" aria-label={strings.preview}>
    <div class="tb-stage" class:dark={scope === "dark"} style={previewVars}>
      <ThemePreviewGallery />
    </div>
  </section>

  <!-- Overlay form only (hidden where the panel docks): a click outside closes. -->
  <button
    type="button"
    class="tb-scrim"
    tabindex="-1"
    aria-hidden="true"
    onclick={() => setPanel(false)}
  ></button>

  <aside id="tb-panel" class="tb-panel" aria-label={strings.customize} inert={!panelOpen}>
    <header class="tb-panel-head">
      <h2>{strings.customize}</h2>
      <button
        type="button"
        class="tb-icon-btn"
        aria-label={strings.closePanel}
        title={strings.closePanel}
        onclick={() => setPanel(false)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </header>

    <div class="tb-panel-body">
      <div class="tb-head">
        <label class="tb-name">
          <span class="tb-label">{strings.name}</span>
          <input type="text" bind:value={state.name} spellcheck="false" />
        </label>
        {@render scopeToggle()}
      </div>

      <label class="tb-desc">
        <span class="tb-label">{strings.description}</span>
        <input
          type="text"
          bind:value={state.description}
          placeholder={strings.descriptionHint}
          maxlength="200"
        />
      </label>

      <div class="tb-start">
        <div class="tb-start-head">
          <span class="tb-label">{strings.startFrom}</span>
          <button type="button" class="tb-link" onclick={reset}>{strings.reset}</button>
        </div>
        <div class="tb-start-row">
          {#each bases as base (base.item)}
            <button type="button" class="tb-btn" onclick={() => importBase(base.item)}>
              {base.label}
            </button>
          {/each}
          <button
            type="button"
            class="tb-btn"
            aria-expanded={pasteOpen}
            onclick={() => (pasteOpen = !pasteOpen)}
          >
            {strings.paste}
          </button>
        </div>

        {#if pasteOpen}
          <div class="tb-paste">
            <textarea bind:value={pasteText} rows="5" placeholder="tokens.dtcg.json"></textarea>
            <button type="button" class="tb-btn tb-btn--primary" onclick={applyPaste}>
              {strings.import}
            </button>
            {#if pasteError}<p class="tb-error">{pasteError}</p>{/if}
          </div>
        {/if}
      </div>

      {#each GROUPS as group, i (group.label)}
        <details class="tb-group" open={i < OPEN_GROUPS}>
          <summary>
            <span>{group.label}</span>
            <span class="tb-strip" aria-hidden="true">
              {#each group.slots as slot (slot)}
                <span style={`background: ${activeScope[slot]}`}></span>
              {/each}
            </span>
          </summary>
          <div class="tb-slots">
            {#each group.slots as slot (slot)}
              <div class="tb-slot">
                <label class="tb-swatch" style={`--swatch: ${activeScope[slot]}`}>
                  <input
                    type="color"
                    aria-label={`${strings.pickColor}: ${slot}`}
                    value={oklchToHex(activeScope[slot] ?? "") ?? "#000000"}
                    oninput={(e) => (state[scope][slot] = hexToOklch(e.currentTarget.value))}
                  />
                </label>
                <label class="tb-field">
                  <span class="tb-slot-name">{slot}</span>
                  <input type="text" spellcheck="false" bind:value={state[scope][slot]} />
                </label>
              </div>
            {/each}
          </div>
        </details>
      {/each}

      <details class="tb-group">
        <summary><span>{strings.groups["other"] ?? "Other"}</span></summary>
        <div class="tb-slots">
          {#each OTHER_SLOTS as slot (slot)}
            <label class="tb-field">
              <span class="tb-slot-name">{slot}</span>
              <input type="text" spellcheck="false" bind:value={state[scope][slot]} />
            </label>
          {/each}
        </div>
      </details>

      <!--
        Extended slots (display face, elevation, modal scrim, container
        breakpoints, spacing, motion) are optional: @moderno-ui/tokens ships a
        neutral default for each, so a blank field means "inherit it" and exports
        nothing for that slot. The scrim is a colour, but a translucent one, so
        it gets a text field only: the native picker has no alpha channel.
      -->
      <details class="tb-group">
        <summary><span>{strings.groups["extended"] ?? "Extended"}</span></summary>
        <div class="tb-slots">
          {#each EXTENDED_SLOTS as slot (slot)}
            <label class="tb-field">
              <span class="tb-slot-name">{slot}</span>
              <input
                type="text"
                spellcheck="false"
                placeholder={strings.inherited}
                bind:value={state[scope][slot]}
              />
            </label>
          {/each}
        </div>
      </details>
    </div>

    <!-- Pinned under the scrolling slots: the verdict on the theme and the way
         out of the builder stay in view whichever group is being edited. -->
    <footer class="tb-panel-foot">
      {#if !bundle.valid}
        <div class="tb-status tb-status--fail">
          <p>{strings.invalid}: {bundle.error}</p>
        </div>
      {:else if bundle.warnings.length === 0}
        <div class="tb-status tb-status--ok">
          <p>✓ {strings.contrast}: {strings.contrastOk}</p>
        </div>
      {:else}
        <details class="tb-status tb-status--fail">
          <summary>⚠ {strings.contrastFail} ({bundle.warnings.length})</summary>
          <ul>
            {#each bundle.warnings as w (w)}<li>{w}</li>{/each}
          </ul>
        </details>
      {/if}

      <div class="tb-export">
        <span class="tb-label">{strings.export}</span>
        <div class="tb-file">
          <code>theme.css</code>
          <button
            type="button"
            class="tb-btn"
            disabled={!bundle.valid}
            aria-label={`${strings.copy} theme.css`}
            onclick={(e) => copy(bundle.css, e.currentTarget)}
          >
            {strings.copy}
          </button>
          <button
            type="button"
            class="tb-btn"
            disabled={!bundle.valid}
            aria-label={`${strings.download} theme.css`}
            onclick={() => download("theme.css", bundle.css, "text/css")}
          >
            {strings.download}
          </button>
        </div>
        <div class="tb-file">
          <code>tokens.dtcg.json</code>
          <button
            type="button"
            class="tb-btn"
            aria-label={`${strings.copy} tokens.dtcg.json`}
            onclick={(e) => copy(tokensJson, e.currentTarget)}
          >
            {strings.copy}
          </button>
          <button
            type="button"
            class="tb-btn"
            aria-label={`${strings.download} tokens.dtcg.json`}
            onclick={() => download(tokensFile, tokensJson, "application/json")}
          >
            {strings.download}
          </button>
        </div>
        <div class="tb-file">
          <span class="tb-file-name">
            <code>DESIGN.md</code>
            <small>
              {notesLoading
                ? strings.notesLoading
                : notesKept
                  ? strings.notesKept
                  : strings.notesDraft}
            </small>
          </span>
          <button
            type="button"
            class="tb-btn"
            disabled={!bundle.valid || notesLoading}
            aria-label={`${strings.copy} DESIGN.md`}
            onclick={(e) => copy(bundle.designMd, e.currentTarget)}
          >
            {strings.copy}
          </button>
          <button
            type="button"
            class="tb-btn"
            disabled={!bundle.valid || notesLoading}
            aria-label={`${strings.download} DESIGN.md`}
            onclick={() => download("DESIGN.md", bundle.designMd, "text/markdown")}
          >
            {strings.download}
          </button>
        </div>
        <div class="tb-file tb-file--cli">
          <code title={strings.cliSnippet}>{bundle.cli}</code>
          <button
            type="button"
            class="tb-btn"
            aria-label={`${strings.copy} ${strings.cliSnippet}`}
            onclick={(e) => copy(bundle.cli, e.currentTarget)}
          >
            {strings.copy}
          </button>
        </div>
      </div>
    </footer>
  </aside>
</div>

<style>
  /*
    The panel's width, written out twice: here for the panel itself, and as a
    literal in the `.layout` rule below, which sits outside this component and
    can't see a custom property set on `.tb`.
  */
  .tb {
    --tb-panel-w: 22rem;
    --tb-ease: 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  }

  /* The page is a tool, not prose: the layout drops its max width so the
     gallery can use the whole screen, and — where the panel docks — reserves
     the panel's width on its right, so the gallery reflows beside the panel
     instead of hiding under it. */
  :global(.layout:has(.tb)) {
    max-width: none;
    transition: padding-right var(--tb-ease);
  }
  @media (min-width: 64rem) {
    :global(.layout:has(.tb[data-panel="open"])) {
      padding-right: calc(22rem + 1.5rem);
    }
  }

  .tb-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    margin: 1.5rem 0 1rem;
  }
  .tb-toggle {
    gap: 0.4rem;
  }
  .tb-toggle svg,
  .tb-icon-btn svg {
    width: 1rem;
    height: 1rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .tb-toggle[aria-expanded="true"] {
    background: var(--muted);
  }
  /* Contrast failures, counted on the toggle: visible with the panel shut. */
  .tb-badge {
    min-width: 1.125rem;
    height: 1.125rem;
    padding: 0 0.3rem;
    border-radius: 999px;
    background: var(--destructive);
    color: var(--destructive-foreground, var(--background));
    font-size: 0.6875rem;
    font-weight: 600;
    line-height: 1.125rem;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  /* Shared controls */
  .tb-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--muted-foreground);
  }
  .tb input,
  .tb textarea {
    width: 100%;
    min-width: 0;
    border: 1px solid var(--input);
    background: var(--background);
    color: var(--foreground);
    border-radius: var(--radius);
    padding: 0.35rem 0.5rem;
    font: 0.8125rem/1.3 var(--font-mono);
  }
  .tb input:focus-visible,
  .tb textarea:focus-visible,
  .tb button:focus-visible,
  .tb summary:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 1px;
  }
  .tb-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2rem;
    padding: 0 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--background);
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .tb-btn:hover:not(:disabled) {
    background: var(--muted);
  }
  .tb-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .tb-link {
    padding: 0;
    border: 0;
    background: none;
    color: var(--muted-foreground);
    font: inherit;
    font-size: 0.75rem;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }
  .tb-link:hover {
    color: var(--foreground);
  }
  .tb-btn--primary {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--primary-foreground);
  }
  .tb-btn--primary:hover:not(:disabled) {
    background: var(--primary);
    opacity: 0.9;
  }

  /* Panel */
  .tb-panel {
    position: fixed;
    top: var(--docs-header-h);
    right: 0;
    bottom: 0;
    /* Under the header (50) and the mobile nav drawer (40). */
    z-index: 30;
    display: flex;
    flex-direction: column;
    width: min(var(--tb-panel-w), 100vw);
    border-left: 1px solid var(--border);
    background: var(--background);
    color: var(--foreground);
    transform: translateX(100%);
    /* Hidden only once the slide-out ends, so it animates out before it goes. */
    visibility: hidden;
    transition:
      transform var(--tb-ease),
      visibility 0s linear 0.25s;
  }
  .tb[data-panel="open"] .tb-panel {
    transform: none;
    visibility: visible;
    transition:
      transform var(--tb-ease),
      visibility 0s;
  }
  .tb-panel-head {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.625rem 0.625rem 0.625rem 1rem;
    border-bottom: 1px solid var(--border);
  }
  /* Explicit margins and colour: `main h2` prose rules would otherwise reach in. */
  .tb-panel-head h2 {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 600;
    letter-spacing: 0;
    color: var(--foreground);
  }
  .tb-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: 0;
    border-radius: var(--radius);
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }
  .tb-icon-btn:hover {
    background: var(--muted);
    color: var(--foreground);
  }
  .tb-panel-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .tb-panel-foot {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem 1rem 1rem;
    border-top: 1px solid var(--border);
    background: var(--card);
  }

  /* On a short screen a pinned footer would leave the slots a sliver: the
     panel scrolls as one, with contrast and export after the last group. */
  @media (max-height: 52rem) {
    .tb-panel {
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    .tb-panel-body {
      flex: none;
      overflow: visible;
    }
  }

  /* Overlay form: below the docking width the panel lays over the gallery,
     over a scrim that closes it. */
  .tb-scrim {
    display: none;
  }
  @media (max-width: 63.99rem) {
    .tb[data-panel="open"] .tb-scrim {
      display: block;
      position: fixed;
      inset: var(--docs-header-h) 0 0 0;
      z-index: 29;
      padding: 0;
      border: 0;
      background: var(--overlay, color-mix(in oklch, var(--foreground) 35%, transparent));
      cursor: default;
    }
    .tb[data-panel="open"] .tb-panel {
      box-shadow: -12px 0 32px -12px color-mix(in oklch, var(--foreground) 25%, transparent);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .tb-panel,
    .tb[data-panel="open"] .tb-panel,
    :global(.layout:has(.tb)) {
      transition: none;
    }
  }

  .tb-head {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    padding: 1rem;
  }
  .tb-name {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
  }
  .tb-seg {
    display: inline-flex;
    flex-shrink: 0;
    padding: 2px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--background);
  }
  .tb-seg button {
    height: calc(2rem - 6px);
    padding: 0 0.75rem;
    border: 0;
    border-radius: calc(var(--radius) - 2px);
    background: transparent;
    color: var(--muted-foreground);
    font-family: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
  }
  .tb-seg button[aria-pressed="true"] {
    background: var(--primary);
    color: var(--primary-foreground);
  }
  .tb-start {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0 1rem 1rem;
  }
  .tb-start-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }
  .tb-start-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .tb-paste {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .tb-paste textarea {
    resize: vertical;
  }

  .tb-group {
    border-top: 1px solid var(--border);
  }
  .tb-group summary {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    list-style: none;
    user-select: none;
  }
  .tb-group summary::-webkit-details-marker {
    display: none;
  }
  .tb-group summary::after {
    content: "";
    width: 0.45rem;
    height: 0.45rem;
    margin-left: auto;
    border-right: 1.5px solid var(--muted-foreground);
    border-bottom: 1.5px solid var(--muted-foreground);
    transform: translateY(-2px) rotate(45deg);
    transition: transform 0.15s ease;
  }
  .tb-group[open] summary::after {
    transform: translateY(1px) rotate(-135deg);
  }
  .tb-group summary:hover {
    background: var(--muted);
  }
  .tb-strip {
    display: flex;
    min-width: 0;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 999px;
  }
  .tb-strip span {
    width: 0.75rem;
    height: 0.75rem;
  }
  .tb-group[open] .tb-strip {
    display: none;
  }
  .tb-slots {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding: 0.25rem 1rem 1rem;
  }
  .tb-slot {
    display: flex;
    align-items: flex-end;
    gap: 0.625rem;
  }
  .tb-field {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }
  .tb-slot-name {
    overflow: hidden;
    font: 0.75rem var(--font-mono);
    color: var(--muted-foreground);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* The swatch *is* the colour picker: a native input stretched invisibly over
     it, so a click opens the OS picker while the swatch shows the real value. */
  .tb-swatch {
    position: relative;
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border: 1px solid color-mix(in oklch, var(--foreground) 22%, transparent);
    border-radius: var(--radius);
    background: var(--swatch);
    cursor: pointer;
  }
  .tb-swatch:focus-within {
    outline: 2px solid var(--ring);
    outline-offset: 1px;
  }
  .tb .tb-swatch input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    opacity: 0;
    cursor: pointer;
  }

  /* Preview — the stage carries the edited theme (its slots + `.dark`), so the
     gallery inside paints from the theme being built, not the site's. */
  .tb-stage {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: calc(var(--radius) * 1.5);
    background: var(--background);
    color: var(--foreground);
  }
  @media (min-width: 40rem) {
    .tb-stage {
      padding: 1.5rem;
    }
  }

  .tb-status {
    padding: 0.625rem 0.875rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 0.8125rem;
  }
  .tb-status p,
  .tb-status summary {
    margin: 0;
    font-weight: 500;
  }
  .tb-status--ok p {
    color: var(--success, var(--primary));
  }
  .tb-status--fail {
    border-color: color-mix(in oklch, var(--destructive) 45%, var(--border));
  }
  .tb-status--fail p,
  .tb-status--fail summary {
    color: var(--destructive);
  }
  .tb-status summary {
    cursor: pointer;
  }
  /* A theme can fail many pairs; the list scrolls rather than pushing the
     export off the bottom of the panel. */
  .tb-status ul {
    max-height: 8rem;
    overflow-y: auto;
    margin: 0.35rem 0 0;
    padding-left: 1.1rem;
    color: var(--muted-foreground);
  }
  .tb-status li {
    color: inherit;
  }
  .tb-error {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--destructive);
  }

  .tb-export {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .tb-file {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.375rem 0.375rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--background);
  }
  .tb-file code {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 0.8125rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tb-file-name {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }
  .tb-file-name code {
    flex: none;
  }
  /* Wraps rather than truncates: the panel is narrow, and the note is the only
     place that says whether the export carries the base's notes or a draft. */
  .tb-file-name small {
    font-size: 0.6875rem;
    line-height: 1.25;
    color: var(--muted-foreground);
  }
  .tb-desc {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0 1rem 1rem;
  }
  .tb-file--cli code {
    color: var(--muted-foreground);
  }
</style>
