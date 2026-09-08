import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import { fileURLToPath } from "node:url";
import { defineConfig, passthroughImageService } from "astro/config";
import shikiConfig from "./shiki.config.ts";

// GitHub Pages serves this as a project site under /moderno-ds/, so it needs
// its own base path and can't use the Vercel adapter (which targets the
// Build Output API, not a plain static dist/).
const GH_PAGES = process.env.GH_PAGES === "true";
const SITE =
  process.env.SITE_URL ?? (GH_PAGES ? "https://anothernocoder.github.io" : "https://moderno.style");

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: GH_PAGES ? "/moderno-ds" : undefined,
  // Both locales are prefixed (/en, /es) so every slug exists symmetrically —
  // the parity guard and the language switcher rely on that symmetry.
  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [svelte(), mdx(), sitemap()],
  // Markdown and MDX run through Sätteri, Astro 7's default processor — there
  // is no remark/rehype plugin in this repo to keep. Fenced blocks are
  // highlighted by Astro's native Shiki with the same options the standalone
  // <Code> component gets (see shiki.config.ts); the chrome around them lives
  // in src/styles/docs.css, against the contract tokens.
  markdown: { shikiConfig },
  server: { port: Number(process.env.PORT) || 4321 },
  // No image optimization in the docs (sharp is not built); pass images through.
  image: { service: passthroughImageService() },
  adapter: GH_PAGES ? undefined : vercel(),
  output: "static",
  vite: {
    // The Svelte islands import the published CSS contract once, globally.
    ssr: { noExternal: ["@moderno-ui/css"] },
    resolve: {
      alias: {
        // A block preview mounts the registry source itself (registry/blocks/…)
        // rather than a copy, so the docs can never show markup that has
        // drifted from what the CLI installs. Those files sit outside this app
        // and have no `node_modules` of their own, so their bare import of the
        // framework package has nothing to resolve against — this points it at
        // the same workspace package the islands already use.
        "@moderno-ui/svelte": fileURLToPath(
          new URL("./node_modules/@moderno-ui/svelte", import.meta.url),
        ),
      },
    },
  },
});
