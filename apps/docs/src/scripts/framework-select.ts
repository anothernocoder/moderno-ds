/**
 * Framework selector client logic — see FrameworkSelect.astro for the Nimbus
 * attribution and why the port is a single `data-framework` attribute on
 * `<html>` rather than Nimbus's per-group React context.
 *
 * BaseLayout's inline head script already applies the persisted choice (or
 * the React default) to `<html>` before paint, on every page, so every
 * Preview and Install panel is correct on first render even before this
 * module runs. This script only has two jobs once the page is interactive:
 * sync the *visible* radios to that same choice (the server always renders
 * "React" checked), and write a new choice — to the attribute and to
 * localStorage — when the reader picks one.
 */
const STORAGE_KEY = "moderno-framework";
const DEFAULT_FRAMEWORK = "react";

const group = document.querySelector<HTMLElement>("[data-framework-select]");
if (group) {
  const current = localStorage.getItem(STORAGE_KEY) || DEFAULT_FRAMEWORK;
  for (const radio of group.querySelectorAll<HTMLInputElement>(".framework-radio")) {
    radio.checked = radio.value === current;
  }

  group.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.checked) return;
    localStorage.setItem(STORAGE_KEY, target.value);
    document.documentElement.dataset.framework = target.value;
  });
}
