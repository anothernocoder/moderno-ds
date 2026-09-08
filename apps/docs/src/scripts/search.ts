/**
 * ⌘K / Ctrl+K search dialog, over Pagefind's JS API directly
 * (`pagefind.search()` / `debouncedSearch()`) — never `PagefindUI`.
 *
 * The bundle only exists after the postbuild `pnpm index` step, so importing
 * it is lazy and its failure is a first-class UI state ("missing index"),
 * not a swallowed error: `astro dev` (no bundle yet) and a stale build both
 * show it instead of a dialog that quietly does nothing.
 *
 * `<dialog>` + `showModal()` supplies the focus trap for free (the rest of
 * the document becomes inert) and the Esc-to-close behaviour; this script
 * only adds the ⌘K shortcut, backdrop-click-to-close, returning focus to the
 * trigger, and the search itself.
 */
interface PagefindSubResult {
  title: string;
  url: string;
  excerpt: string;
}

interface PagefindData {
  url: string;
  meta: { title?: string };
  excerpt: string;
  sub_results: PagefindSubResult[];
}

interface PagefindSearchResult {
  id: string;
  data: () => Promise<PagefindData>;
}

interface PagefindModule {
  debouncedSearch: (
    term: string,
    options: Record<string, unknown>,
    debounceTimeoutMs: number,
  ) => Promise<{ results: PagefindSearchResult[] } | null>;
}

// Queried once at the top level under `search*` names — `input`, `dialog`
// etc. would collide with the same short names in the docs' other
// `src/scripts/*.ts` files: those load as global (non-module) scripts too,
// so `astro check` type-checks every one of them in one shared global scope.
const searchTriggerEl = document.querySelector<HTMLButtonElement>("[data-search-trigger]");
const searchDialogEl = document.querySelector<HTMLDialogElement>("[data-search-dialog]");
const searchInputEl = document.querySelector<HTMLInputElement>("[data-search-input]");
const searchResultsEl = document.querySelector<HTMLElement>("[data-search-results]");
const searchEmptyEl = document.querySelector<HTMLElement>("[data-search-empty]");
const searchNoResultsEl = document.querySelector<HTMLElement>("[data-search-no-results]");
const searchMissingEl = document.querySelector<HTMLElement>("[data-search-missing]");

if (
  searchTriggerEl &&
  searchDialogEl &&
  searchInputEl &&
  searchResultsEl &&
  searchEmptyEl &&
  searchNoResultsEl &&
  searchMissingEl
) {
  // Re-bound to short, block-scoped consts: the functions below are nested
  // closures, and TypeScript does not carry a narrowed (non-null) type across
  // a closure boundary — only a binding whose own declared type is already
  // non-null stays non-null inside one.
  const trigger = searchTriggerEl;
  const dialog = searchDialogEl;
  const input = searchInputEl;
  const resultsEl = searchResultsEl;
  const emptyState = searchEmptyEl;
  const noResultsState = searchNoResultsEl;
  const missingState = searchMissingEl;

  const bundlePath = dialog.dataset.bundle!;

  let modulePromise: Promise<PagefindModule> | null = null;
  let indexMissing = false;
  function loadPagefind(): Promise<PagefindModule> {
    if (!modulePromise) {
      modulePromise = import(/* @vite-ignore */ `${bundlePath}pagefind.js`) as Promise<PagefindModule>;
    }
    return modulePromise;
  }

  type SearchState = "empty" | "no-results" | "results" | "missing";
  function setState(state: SearchState) {
    emptyState.hidden = state !== "empty";
    noResultsState.hidden = state !== "no-results";
    missingState.hidden = state !== "missing";
    resultsEl.hidden = state !== "results";
  }

  let items: HTMLAnchorElement[] = [];
  let activeIndex = -1;

  function setActive(index: number) {
    if (items[activeIndex]) items[activeIndex].removeAttribute("aria-selected");
    activeIndex = index;
    const el = items[activeIndex];
    if (el) {
      el.setAttribute("aria-selected", "true");
      el.scrollIntoView({ block: "nearest" });
    }
  }

  function clearResults() {
    resultsEl.innerHTML = "";
    items = [];
    activeIndex = -1;
  }

  function renderResults(dataList: PagefindData[]) {
    clearResults();
    for (const data of dataList) {
      const group = document.createElement("div");
      group.className = "search-group";
      const heading = document.createElement("p");
      heading.className = "search-group-title";
      heading.textContent = data.meta.title || data.url;
      group.appendChild(heading);

      // A page with no matching sub-section (a short page whose only match is
      // the body text pagefind grouped into the page result itself) still
      // gets one row, built from the page-level excerpt.
      const sections =
        data.sub_results.length > 0
          ? data.sub_results
          : [{ title: data.meta.title || data.url, url: data.url, excerpt: data.excerpt }];

      for (const section of sections) {
        const a = document.createElement("a");
        a.href = section.url;
        a.className = "search-result";
        a.setAttribute("role", "option");
        a.tabIndex = -1;
        a.dataset.searchResult = "";

        const title = document.createElement("span");
        title.className = "search-result-title";
        title.textContent = section.title;

        const excerpt = document.createElement("span");
        excerpt.className = "search-result-excerpt";
        // Pagefind's own excerpt highlighting: a short string of already-escaped
        // HTML wrapping the matched terms in <mark>, from our own build output.
        excerpt.innerHTML = section.excerpt;

        a.append(title, excerpt);
        const index = items.length;
        a.addEventListener("mouseenter", () => setActive(index));
        group.appendChild(a);
        items.push(a);
      }
      resultsEl.appendChild(group);
    }
    setActive(items.length > 0 ? 0 : -1);
  }

  let searchToken = 0;
  async function runSearch(term: string) {
    const token = ++searchToken;
    if (indexMissing) {
      setState("missing");
      return;
    }
    if (term.trim() === "") {
      clearResults();
      setState("empty");
      return;
    }
    let pagefind: PagefindModule;
    try {
      pagefind = await loadPagefind();
    } catch {
      indexMissing = true;
      setState("missing");
      return;
    }
    const search = await pagefind.debouncedSearch(term, {}, 150);
    if (token !== searchToken) return; // superseded by a newer keystroke
    if (!search) return; // pagefind itself debounced this call away
    if (search.results.length === 0) {
      clearResults();
      setState("no-results");
      return;
    }
    const dataList = await Promise.all(search.results.slice(0, 8).map((r) => r.data()));
    if (token !== searchToken) return;
    renderResults(dataList);
    setState("results");
  }

  input.addEventListener("input", () => {
    void runSearch(input.value);
  });

  function openDialog() {
    dialog.showModal();
    input.value = "";
    clearResults();
    setState(indexMissing ? "missing" : "empty");
    input.focus();
    if (!indexMissing) {
      // Probe the bundle as soon as the dialog opens, so a dev build with no
      // index yet shows the "missing" state before the first keystroke.
      loadPagefind().catch(() => {
        indexMissing = true;
        setState("missing");
      });
    }
  }

  trigger.addEventListener("click", openDialog);

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    if (dialog.open) dialog.close();
    else openDialog();
  });

  // Native `showModal()` already traps focus (the rest of the document goes
  // inert) and closes on Esc; this only returns focus to the trigger once it
  // does.
  dialog.addEventListener("close", () => {
    trigger.focus();
  });

  // Backdrop click: `<dialog>` has no built-in "click outside" close, so
  // compare the click point against the dialog's own box (it fits its
  // content, so anything outside it is the backdrop).
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (items.length > 0) setActive((activeIndex + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (items.length > 0) setActive((activeIndex - 1 + items.length) % items.length);
    } else if (event.key === "Enter") {
      const el = items[activeIndex];
      if (el) {
        event.preventDefault();
        window.location.assign(el.href);
      }
    }
  });
}
