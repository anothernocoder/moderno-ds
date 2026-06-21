/**
 * Delegated copy-to-clipboard for every `[data-copy]` button on the page. A
 * button either carries the literal text in `data-copy`, or names a source
 * element via `data-copy-target` (its `textContent` is copied). On success the
 * button's `data-copied` label flashes for ~1.2s. One listener, any number of
 * buttons (including those Astro renders inside MDX).
 */
async function resolveText(btn: HTMLElement): Promise<string> {
  const url = btn.dataset.copyUrl;
  if (url) {
    const res = await fetch(url);
    return res.ok ? res.text() : "";
  }
  const targetId = btn.dataset.copyTarget;
  if (targetId) {
    const el = document.getElementById(targetId);
    return el?.textContent ?? "";
  }
  return btn.dataset.copy ?? "";
}

document.addEventListener("click", async (event) => {
  const btn = (event.target as HTMLElement).closest<HTMLElement>(
    "[data-copy], [data-copy-target], [data-copy-url]",
  );
  if (!btn) return;
  try {
    await navigator.clipboard.writeText(await resolveText(btn));
    const done = btn.dataset.copied;
    if (done) {
      const previous = btn.getAttribute("aria-label") ?? "";
      btn.setAttribute("data-state", "copied");
      btn.setAttribute("aria-label", done);
      setTimeout(() => {
        btn.removeAttribute("data-state");
        btn.setAttribute("aria-label", previous);
      }, 1200);
    }
  } catch {
    /* clipboard blocked — no-op */
  }
});
