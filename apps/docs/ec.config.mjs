// Expressive Code options live here (rather than inline in astro.config.mjs)
// because the standalone `<Code>` component — used by CodeBlock.astro and
// Install.astro to render outside of fenced markdown — needs to re-import a
// JSON-serializable-free config at runtime; functions like themeCssSelector
// can't cross the astro.config.mjs → component boundary otherwise.
export default {
  themes: ["github-light", "github-dark"],
  useDarkModeMediaQuery: false,
  // The site's own toggle sets/removes a `.dark` class on <html> before paint
  // (see BaseLayout's inline script) — reuse it instead of EC's `data-theme`
  // convention or a media query.
  themeCssSelector: (theme) => (theme.type === "dark" ? ".dark" : false),
  // Applies to every code block on the site, including plain ```fenced
  // blocks in MDX prose — not just the ones rendered through our own
  // CodeBlock/Install components. Without this, only our own <Code> calls
  // got frame="none"; a bare ```bash fence in a guide would still default to
  // the terminal-window treatment (3 dots + header bar), which is exactly
  // the "some blocks look different from others" inconsistency this avoids.
  defaultProps: {
    frame: "none",
  },
  styleOverrides: {
    codeFontFamily: "var(--docs-font-mono)",
    uiFontFamily: "var(--docs-font-sans)",
    // Every standalone code block gets the same bordered, rounded card as
    // the rest of the site's chrome (props table, cards, etc.) — reusing the
    // exact --border/--radius tokens instead of Expressive Code's own
    // theme-derived border color keeps it visually part of the same system.
    borderRadius: "var(--radius)",
    borderWidth: "1px",
    borderColor: "var(--border)",
    frames: {
      frameBoxShadowCssValue: "none",
    },
  },
};
