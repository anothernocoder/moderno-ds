<!--
  Theme Builder — edits the contract slots in both scopes (`:root` + `.dark`)
  with a live preview over the *real* @moderno components, then exports a
  theme.css + tokens.dtcg.json + CLI snippet. Export runs through the same
  `@moderno-ui/theme-compile` CI uses (via `buildTheme`), so a clean export here is
  a theme that passes CI; the inline WCAG AA checker surfaces its warnings.
  State persists to the URL (`?t=`) and localStorage.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { Button, LineChart } from "@moderno-ui/svelte";
  import { COLOR_GROUPS } from "@moderno-ui/tokens/contract";
  import {
    buildTheme,
    defaultThemeState,
    previewStyle,
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
  // Built by the same helper the export uses, so a cleared optional field
  // previews the inherited default instead of a blanked slot (`--slot: ` makes
  // var(--slot) substitute to nothing, and the stage loses that padding/radius).
  const previewVars = $derived(previewStyle(state[scope]));

  const chartSeries = [
    { name: "A", points: [{ x: 0, y: 8 }, { x: 1, y: 22 }, { x: 2, y: 16 }, { x: 3, y: 34 }] },
    { name: "B", points: [{ x: 0, y: 4 }, { x: 1, y: 12 }, { x: 2, y: 24 }, { x: 3, y: 20 }] },
  ];

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
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const res = await fetch(`${base}/r/themes/${name}/tokens.dtcg.json`);
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

<div class="tb-shell">
  <div class="tb">
    <section class="tb-editor" aria-label="Theme editor">
      <div class="tb-head">
        <label class="tb-name">
          <span class="tb-label">{strings.name}</span>
          <input type="text" bind:value={state.name} spellcheck="false" />
        </label>
        <div class="tb-seg" role="group" aria-label={`${strings.light} / ${strings.dark}`}>
          <button type="button" aria-pressed={scope === "light"} onclick={() => (scope = "light")}>
            {strings.light}
          </button>
          <button type="button" aria-pressed={scope === "dark"} onclick={() => (scope = "dark")}>
            {strings.dark}
          </button>
        </div>
      </div>

      <div class="tb-start">
        <div class="tb-start-head">
          <span class="tb-label">{strings.startFrom}</span>
          <button type="button" class="tb-link" onclick={reset}>{strings.reset}</button>
        </div>
        <div class="tb-start-row">
          <button type="button" class="tb-btn" onclick={() => importBase("theme-moderno")}>
            Moderno
          </button>
          <button type="button" class="tb-btn" onclick={() => importBase("theme-contrast")}>
            Contrast
          </button>
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
        Extended slots (display face, elevation, container breakpoints, spacing,
        motion) are optional: @moderno-ui/tokens ships a neutral default for each,
        so a blank field means "inherit it" and exports nothing for that slot.
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
    </section>

    <section class="tb-preview" aria-label="Preview">
      <div class="tb-stage" class:dark={scope === "dark"} style={previewVars}>
        <div class="tb-stage-inner">
          <div class="tb-buttons">
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
          <div class="tb-chart">
            <LineChart width={560} height={180} series={chartSeries} xTicks={4} yTicks={4} />
          </div>
        </div>
      </div>

      {#if !bundle.valid}
        <div class="tb-status tb-status--fail">
          <p>{strings.invalid}: {bundle.error}</p>
        </div>
      {:else if bundle.warnings.length === 0}
        <div class="tb-status tb-status--ok"><p>✓ {strings.contrastOk}</p></div>
      {:else}
        <div class="tb-status tb-status--fail">
          <p>⚠ {strings.contrastFail}</p>
          <ul>
            {#each bundle.warnings as w (w)}<li>{w}</li>{/each}
          </ul>
        </div>
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
    </section>
  </div>
</div>

<style>
  /* The builder sizes itself off its own column, not the viewport: the docs
     sidebar and TOC rail eat a varying share of the page width. */
  .tb-shell {
    container-type: inline-size;
  }
  .tb {
    display: grid;
    grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
  }
  @container (max-width: 56rem) {
    .tb {
      grid-template-columns: minmax(0, 18rem) minmax(0, 1fr);
    }
  }
  @container (max-width: 40rem) {
    .tb {
      grid-template-columns: minmax(0, 1fr);
    }
    .tb-preview {
      position: static;
    }
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

  /* Editor */
  .tb-editor {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--card);
    overflow: hidden;
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

  /* Preview */
  .tb-preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
  .tb-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
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
  /* Scale down with the column, never up — upscaling blows up the axis text. */
  .tb-chart :global(svg) {
    display: block;
    width: 100%;
    max-width: 560px;
    height: auto;
  }

  .tb-status {
    padding: 0.625rem 0.875rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 0.8125rem;
  }
  .tb-status p {
    margin: 0;
    font-weight: 500;
  }
  .tb-status--ok p {
    color: var(--success, var(--primary));
  }
  .tb-status--fail {
    border-color: color-mix(in oklch, var(--destructive) 45%, var(--border));
  }
  .tb-status--fail p {
    color: var(--destructive);
  }
  .tb-status ul {
    margin: 0.35rem 0 0;
    padding-left: 1.1rem;
    color: var(--muted-foreground);
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
    background: var(--card);
  }
  .tb-file code {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 0.8125rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tb-file--cli code {
    color: var(--muted-foreground);
  }
</style>
