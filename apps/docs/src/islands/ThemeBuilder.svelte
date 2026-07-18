<!--
  Theme Builder — edits the contract slots in both scopes (`:root` + `.dark`)
  with a live preview over the *real* @moderno components, then exports a
  theme.css + tokens.dtcg.json + CLI snippet. Export runs through the same
  `@moderno/theme-compile` CI uses (via `buildTheme`), so a clean export here is
  a theme that passes CI; the inline WCAG AA checker surfaces its warnings.
  State persists to the URL (`?t=`) and localStorage.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { Button, LineChart } from "@moderno/svelte";
  import { COLOR_GROUPS } from "@moderno/tokens/contract";
  import {
    buildTheme,
    defaultThemeState,
    slugify,
    tokensToState,
    OTHER_SLOTS,
    type ThemeState,
  } from "../lib/theme.ts";
  import { createThemeStore } from "../lib/themeStore.ts";

  interface Strings {
    light: string;
    dark: string;
    import: string;
    paste: string;
    reset: string;
    exportCss: string;
    exportTokens: string;
    cliSnippet: string;
    contrastOk: string;
    contrastFail: string;
    invalid: string;
    copied: string;
    /** Editor group labels, keyed by the contract group id. */
    groups: Record<string, string>;
  }

  let { strings }: { strings: Strings } = $props();

  let state = $state<ThemeState>(defaultThemeState());
  let scope = $state<"light" | "dark">("light");
  let pasteOpen = $state(false);
  let pasteText = $state("");
  let pasteError = $state("");

  const bundle = $derived(buildTheme(state));
  const activeScope = $derived(state[scope]);
  const previewVars = $derived(
    Object.entries(state[scope])
      .map(([slot, value]) => `--${slot}: ${value}`)
      .join("; "),
  );

  const chartSeries = [
    { name: "A", points: [{ x: 0, y: 8 }, { x: 1, y: 22 }, { x: 2, y: 16 }, { x: 3, y: 34 }] },
    { name: "B", points: [{ x: 0, y: 4 }, { x: 1, y: 12 }, { x: 2, y: 24 }, { x: 3, y: 20 }] },
  ];

  // The editor groups derive from the contract data — a slot added to
  // @moderno/tokens shows up here without touching the island. Labels come
  // from the docs i18n; an unmapped group falls back to its id.
  const GROUPS = COLOR_GROUPS.map(({ group, slots }) => ({
    label: strings.groups[group] ?? group,
    slots,
  }));

  function loadDoc(doc: unknown) {
    try {
      state = tokensToState(doc);
      pasteError = "";
      pasteOpen = false;
    } catch (err) {
      pasteError = (err as Error).message;
    }
  }

  async function importBase(name: string) {
    const res = await fetch(`/r/themes/${name}/tokens.dtcg.json`);
    if (res.ok) loadDoc(await res.json());
  }

  function applyPaste() {
    try {
      loadDoc(JSON.parse(pasteText));
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
  });

  $effect(() => {
    store().persist(state);
  });
</script>

<div class="tb">
  <section class="tb-editor" aria-label="Theme editor">
    <div class="tb-toolbar">
      <div class="tb-scope" role="tablist">
        <button
          type="button"
          class:active={scope === "light"}
          onclick={() => (scope = "light")}
        >
          {strings.light}
        </button>
        <button
          type="button"
          class:active={scope === "dark"}
          onclick={() => (scope = "dark")}
        >
          {strings.dark}
        </button>
      </div>
      <label class="tb-name">
        name
        <input type="text" bind:value={state.name} spellcheck="false" />
      </label>
    </div>

    <div class="tb-actions">
      <button type="button" onclick={() => importBase("theme-moderno")}>Moderno</button>
      <button type="button" onclick={() => importBase("theme-contrast")}>Contrast</button>
      <button type="button" onclick={() => (pasteOpen = !pasteOpen)}>{strings.paste}</button>
      <button type="button" onclick={reset}>{strings.reset}</button>
    </div>

    {#if pasteOpen}
      <div class="tb-paste">
        <textarea bind:value={pasteText} rows="5" placeholder="tokens.dtcg.json"></textarea>
        <button type="button" onclick={applyPaste}>{strings.import}</button>
        {#if pasteError}<p class="tb-error">{pasteError}</p>{/if}
      </div>
    {/if}

    {#each GROUPS as group (group.label)}
      <fieldset class="tb-group">
        <legend>{group.label}</legend>
        {#each group.slots as slot (slot)}
          <label class="tb-slot">
            <span class="tb-swatch" style={`background: ${activeScope[slot]}`}></span>
            <span class="tb-slot-name">{slot}</span>
            <input type="text" spellcheck="false" bind:value={state[scope][slot]} />
          </label>
        {/each}
      </fieldset>
    {/each}

    <fieldset class="tb-group">
      <legend>{strings.groups["other"] ?? "Other"}</legend>
      {#each OTHER_SLOTS as slot (slot)}
        <label class="tb-slot tb-slot--wide">
          <span class="tb-slot-name">{slot}</span>
          <input type="text" spellcheck="false" bind:value={state[scope][slot]} />
        </label>
      {/each}
    </fieldset>
  </section>

  <section class="tb-preview" aria-label="Preview">
    <div class="tb-stage" class:dark={scope === "dark"} style={previewVars}>
      <div class="tb-stage-inner">
        <div class="demo-row">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Delete</Button>
        </div>
        <div class="tb-card">
          <h4>Card title</h4>
          <p>Muted body text rendered from the contract slots.</p>
          <Button size="sm">Action</Button>
        </div>
        <LineChart width={420} height={200} series={chartSeries} xTicks={4} yTicks={4} />
      </div>
    </div>

    <div class="tb-contrast">
      {#if !bundle.valid}
        <p class="tb-error">{strings.invalid}: {bundle.error}</p>
      {:else if bundle.warnings.length === 0}
        <p class="tb-ok">✓ {strings.contrastOk}</p>
      {:else}
        <p class="tb-warn">⚠ {strings.contrastFail}</p>
        <ul>
          {#each bundle.warnings as w (w)}<li>{w}</li>{/each}
        </ul>
      {/if}
    </div>

    <div class="tb-export">
      <div class="tb-export-row">
        <button
          type="button"
          disabled={!bundle.valid}
          onclick={(e) => copy(bundle.css, e.currentTarget)}
        >
          {strings.exportCss}
        </button>
        <button
          type="button"
          class="tb-download"
          disabled={!bundle.valid}
          aria-label={strings.exportCss}
          onclick={() => download("theme.css", bundle.css, "text/css")}
        >
          ↓
        </button>
        <button
          type="button"
          onclick={(e) => copy(JSON.stringify(bundle.tokens, null, 2), e.currentTarget)}
        >
          {strings.exportTokens}
        </button>
        <button
          type="button"
          class="tb-download"
          aria-label={strings.exportTokens}
          onclick={() =>
            download(
              `${slugify(state.name) || "theme"}.tokens.dtcg.json`,
              JSON.stringify(bundle.tokens, null, 2),
              "application/json",
            )}
        >
          ↓
        </button>
      </div>
      <label class="tb-cli">
        {strings.cliSnippet}
        <code>{bundle.cli}</code>
        <button type="button" onclick={(e) => copy(bundle.cli, e.currentTarget)}>⧉</button>
      </label>
    </div>
  </section>
</div>

<style>
  .tb {
    display: grid;
    grid-template-columns: 22rem 1fr;
    gap: 1.5rem;
    align-items: start;
  }
  @media (max-width: 56rem) {
    .tb {
      grid-template-columns: 1fr;
    }
  }
  .tb-editor {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
    background: var(--card);
  }
  .tb-toolbar {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  .tb-scope button,
  .tb-actions button {
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--foreground);
    border-radius: var(--radius);
    padding: 0.3rem 0.7rem;
    cursor: pointer;
    font: inherit;
  }
  .tb-scope button.active {
    background: var(--primary);
    color: var(--primary-foreground);
  }
  .tb-name {
    display: flex;
    flex-direction: column;
    font-size: 0.7rem;
    color: var(--muted-foreground);
  }
  .tb-name input {
    width: 8rem;
  }
  .tb-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 1rem;
  }
  .tb-paste {
    margin-bottom: 1rem;
  }
  .tb-paste textarea {
    width: 100%;
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }
  .tb-group {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin: 0 0 1rem;
    padding: 0.5rem 0.75rem 0.75rem;
  }
  .tb-group legend {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted-foreground);
  }
  .tb-slot {
    display: grid;
    grid-template-columns: 1.1rem 8rem 1fr;
    align-items: center;
    gap: 0.5rem;
    margin: 0.35rem 0;
    font-size: 0.78rem;
  }
  .tb-slot--wide {
    grid-template-columns: 8rem 1fr;
  }
  .tb-swatch {
    width: 1.1rem;
    height: 1.1rem;
    border: 1px solid var(--border);
    border-radius: 3px;
  }
  .tb-slot-name {
    color: var(--muted-foreground);
    font-family: var(--font-mono);
  }
  .tb input,
  .tb textarea {
    border: 1px solid var(--input);
    background: var(--background);
    color: var(--foreground);
    border-radius: var(--radius);
    padding: 0.25rem 0.4rem;
    font: 0.78rem var(--font-mono);
  }
  .tb-preview {
    position: sticky;
    top: 5rem;
  }
  .tb-stage {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.5rem;
    background: var(--background);
    color: var(--foreground);
  }
  .tb-stage-inner {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .tb-card {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--card);
    color: var(--card-foreground);
    padding: 1rem;
  }
  .tb-card h4 {
    margin: 0 0 0.3rem;
  }
  .tb-card p {
    margin: 0 0 0.75rem;
    color: var(--muted-foreground);
    font-size: 0.9rem;
  }
  .tb-contrast {
    margin: 1rem 0;
    font-size: 0.85rem;
  }
  .tb-contrast ul {
    margin: 0.25rem 0 0;
    padding-left: 1.1rem;
    color: var(--muted-foreground);
  }
  .tb-ok {
    color: var(--primary);
  }
  .tb-warn,
  .tb-error {
    color: var(--destructive);
  }
  .tb-export-row {
    display: flex;
    gap: 0.5rem;
  }
  .tb-export button {
    border: 1px solid var(--border);
    background: var(--primary);
    color: var(--primary-foreground);
    border-radius: var(--radius);
    padding: 0.4rem 0.8rem;
    cursor: pointer;
    font: inherit;
  }
  .tb-export button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .tb-download {
    padding: 0.4rem 0.6rem;
  }
  .tb-cli {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    font-size: 0.72rem;
    color: var(--muted-foreground);
  }
  .tb-cli code {
    flex: 1;
    background: var(--muted);
    padding: 0.3rem 0.5rem;
    border-radius: var(--radius);
  }
</style>
