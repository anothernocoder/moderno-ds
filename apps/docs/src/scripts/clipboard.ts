/**
 * Delegated copy-to-clipboard for every copy button on the page. A button
 * either carries the literal text in `data-copy`, names a source element via
 * `data-copy-target` (its `textContent` is copied), names a URL to fetch via
 * `data-copy-url` (the page's `.md` twin), or — `data-copy-code` — copies the
 * one *visible* `<pre>` under its nearest `[data-code-root]`. That last form is
 * what lets a single button serve a block that renders several sources and
 * shows one: a Preview's per-framework sources, Install's package-manager ×
 * framework commands (both switched by CSS off `data-framework`).
 *
 * On success the button gets `data-state="copied"` and its `data-copied` label
 * for ~1.2s. One listener, any number of buttons (including those Astro
 * renders inside MDX).
 *
 * It also gives fenced code in MDX prose the same chrome CodeBlock.astro
 * renders: Astro's Shiki emits a bare `pre.astro-code` with no hook for a
 * button, so each one outside an existing `[data-code-root]` is wrapped in a
 * `.code-block` with a copy button here. Only the button needs script; the
 * block itself is fully styled without it.
 */
const COPY_ICON =
  '<svg class="code-copy-idle" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const CHECK_ICON =
  '<svg class="code-copy-done" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

function visiblePre(root: Element): HTMLElement | undefined {
  return [...root.querySelectorAll<HTMLElement>("pre")].find(
    (pre) => pre.getClientRects().length > 0,
  );
}

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
  if (btn.hasAttribute("data-copy-code")) {
    const root = btn.closest("[data-code-root]");
    const pre = root ? visiblePre(root) : undefined;
    return pre?.textContent?.replace(/\n$/, "") ?? "";
  }
  return btn.dataset.copy ?? "";
}

document.addEventListener("click", async (event) => {
  const btn = (event.target as HTMLElement).closest<HTMLElement>(
    "[data-copy], [data-copy-target], [data-copy-url], [data-copy-code]",
  );
  if (!btn) return;
  try {
    await navigator.clipboard.writeText(await resolveText(btn));
    const done = btn.dataset.copied;
    if (done) {
      const previous = btn.getAttribute("aria-label");
      btn.setAttribute("data-state", "copied");
      btn.setAttribute("aria-label", done);
      setTimeout(() => {
        btn.removeAttribute("data-state");
        if (previous === null) btn.removeAttribute("aria-label");
        else btn.setAttribute("aria-label", previous);
      }, 1200);
    }
  } catch {
    /* clipboard blocked — no-op */
  }
});

/** Wrap prose `pre.astro-code` blocks in `.code-block` chrome with a copy button. */
function enhanceProseCode(): void {
  const { copyLabel = "Copy code", copiedLabel = "Copied" } = document.body.dataset;
  for (const pre of document.querySelectorAll<HTMLElement>("main pre.astro-code")) {
    if (pre.closest("[data-code-root], .preview-panel--demo")) continue;
    const wrap = document.createElement("div");
    wrap.className = "code-block code-block--prose";
    wrap.setAttribute("data-code-root", "");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-copy";
    btn.setAttribute("data-copy-code", "");
    btn.setAttribute("aria-label", copyLabel);
    btn.title = copyLabel;
    btn.dataset.copied = copiedLabel;
    btn.innerHTML = COPY_ICON + CHECK_ICON;
    pre.replaceWith(wrap);
    wrap.append(pre, btn);
  }
}

enhanceProseCode();
