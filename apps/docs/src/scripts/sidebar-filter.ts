/**
 * Sidebar filter: narrows the nav to pages whose title matches the typed
 * query. `/` focuses the input from anywhere on the page (unless focus is
 * already in a text field), Esc clears it and restores the full navigation.
 *
 * Matching is case- and accent-insensitive so "documentacion" finds
 * "Documentación" in the es locale: both sides are run through the same
 * NFD-strip-combining-marks normalization before comparing. A group whose
 * pages all fail to match collapses entirely; when every group collapses, a
 * "no matches" row (already in the markup, just `hidden`) appears.
 *
 * Works only on the rows the server already rendered — an empty query never
 * touches the DOM, so the sidebar's initial markup (what `guards.spec.ts`
 * checks) is exactly what it always was.
 */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const input = document.querySelector<HTMLInputElement>("[data-sidebar-filter]");
const groups = [...document.querySelectorAll<HTMLElement>("[data-sidebar-group]")];
const empty = document.querySelector<HTMLElement>("[data-sidebar-empty]");

if (input && groups.length) {
  const rows = groups.map((group) => ({
    group,
    items: [...group.querySelectorAll<HTMLLIElement>("[data-sidebar-item]")].map((item) => ({
      item,
      title: normalize(item.querySelector("a")?.textContent ?? ""),
    })),
  }));

  const applyFilter = (raw: string) => {
    const query = normalize(raw);
    let anyVisible = false;
    for (const { group, items } of rows) {
      let groupHasMatch = false;
      for (const { item, title } of items) {
        const matches = query === "" || title.includes(query);
        item.hidden = !matches;
        if (matches) groupHasMatch = true;
      }
      group.hidden = !groupHasMatch;
      if (groupHasMatch) anyVisible = true;
    }
    if (empty) empty.hidden = anyVisible;
  };

  input.addEventListener("input", () => applyFilter(input.value));

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    input.value = "";
    applyFilter("");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
    event.preventDefault();
    input.focus();
  });
}
