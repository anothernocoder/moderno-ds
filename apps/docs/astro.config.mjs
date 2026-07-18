import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import { defineConfig, passthroughImageService } from "astro/config";

const SITE = process.env.SITE_URL ?? "https://moderno.style";

// https://astro.build/config
export default defineConfig({
  site: SITE,
  // Both locales are prefixed (/en, /es) so every slug exists symmetrically —
  // the parity guard and the language switcher rely on that symmetry.
  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [svelte(), mdx(), sitemap()],
  server: { port: Number(process.env.PORT) || 4321 },
  // No image optimization in the docs (sharp is not built); pass images through.
  image: { service: passthroughImageService() },
  adapter: vercel(),
  output: "static",
  vite: {
    // The Svelte islands import the published CSS contract once, globally.
    ssr: { noExternal: ["@moderno/css"] },
  },
});
