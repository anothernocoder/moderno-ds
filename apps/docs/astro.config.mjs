import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import expressiveCode from "astro-expressive-code";
import { defineConfig, passthroughImageService } from "astro/config";

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
  integrations: [
    // Must run before mdx() so its rehype plugin sees fenced code blocks
    // first. Options live in ec.config.mjs — see that file for why.
    expressiveCode(),
    svelte(),
    mdx(),
    sitemap(),
  ],
  server: { port: Number(process.env.PORT) || 4321 },
  // No image optimization in the docs (sharp is not built); pass images through.
  image: { service: passthroughImageService() },
  adapter: GH_PAGES ? undefined : vercel(),
  output: "static",
  vite: {
    // The Svelte islands import the published CSS contract once, globally.
    ssr: { noExternal: ["@moderno-ui/css"] },
  },
});
