// One Shiki configuration for every code block on the site.
//
// Two consumers need the same object and neither can read the other's: Astro
// applies `markdown.shikiConfig` to fenced blocks in MDX prose, while the
// `astro:components` <Code> used by CodeBlock.astro and Install.astro carries
// its own defaults (`theme: "github-dark"`, `defaultColor: "light"`). Sharing
// one module is what keeps a ```ts fence in a guide and a <CodeBlock> looking
// like the same code block.
//
// `defaultColor: false` makes Shiki emit both palettes as CSS variables
// (`--shiki-light*` / `--shiki-dark*`) rather than baking one of them in. The
// site's own toggle sets a `.dark` class on <html> before paint (see
// BaseLayout's inline script) and src/styles/docs.css picks the palette from
// that class — no `prefers-color-scheme` media query, so a reader who
// overrides the OS scheme gets the palette they asked for.
// `as const` keeps the literals literal: `<Code>` types its themes as Shiki's
// bundled-name union and `defaultColor` as `string | false`, neither of which a
// widened `string`/`boolean` would satisfy.
export default {
  themes: { light: "github-light", dark: "github-dark" },
  defaultColor: false,
  wrap: false,
} as const;
