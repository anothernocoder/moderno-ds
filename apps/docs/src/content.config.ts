import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

/**
 * The `docs` collection holds one MDX file per page per locale, keyed by its
 * path: `en/button.mdx` → id `en/button` (locale `en`, slug `button`). Both
 * locales live in the same collection so the parity guard can compare slug sets
 * and the language switcher can resolve the sibling page by swapping the locale.
 */
const docs = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Sidebar group, in the page's own language. */
    group: z.string().default("Components"),
    /** Sort order within the group. */
    order: z.number().default(100),
    /** Component name whose generated PropsTable this page documents. */
    component: z.string().optional(),
    /** npm package the install block targets (e.g. `@moderno/react`). */
    pkg: z.string().optional(),
  }),
});

export const collections = { docs };
