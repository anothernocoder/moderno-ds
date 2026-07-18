/**
 * Shared helper for the cross-framework golden-SVG parity tests. Each binding
 * SSR-renders a chart and compares it, normalised, against
 * `chartNodeToSvg(…)` — the reference serialization from charts-core.
 *
 * Normalisation removes renderer noise that carries no markup meaning:
 * hydration comment markers (Svelte), hydration key attributes (Solid),
 * self-closing tags (React), and template whitespace between elements.
 */
export function normalizeSvg(markup: string): string {
  return markup
    .replace(/<!--.*?-->/gs, "")
    .replace(/\s+data-hk="[^"]*"/g, "")
    .replace(/<([a-zA-Z][\w-]*)([^>]*?)\s*\/>/g, "<$1$2></$1>")
    .replace(/\s+>/g, ">")
    .replace(/>\s+</g, "><")
    .trim();
}
