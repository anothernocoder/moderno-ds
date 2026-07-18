import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

/**
 * The `docs` collection holds one MDX file per page per locale, keyed by its
 * path: `en/button.mdx` → id `en/button` (locale `en`, slug `button`). Both
 * locales live in the same collection so the parity guard can compare slug sets
 * and the language switcher can resolve the sibling page by swapping the locale.
 */
/**
 * The curated layer of `moderno.agent.json`'s `guidance` (schema:
 * `docs/prd/phase-7/moderno.agent.schema.json`, `definitions.guidance`). Read
 * once from the English page by `@moderno/props-doc`'s manifest builder and
 * folded into every framework's manifest verbatim — this block is not
 * translated, so the Spanish twin of a page doesn't need one.
 */
const agentGuidance = z.object({
  /** One line: what this primitive is for. */
  intent: z.string().optional(),
  whenToUse: z.string().optional(),
  /** Steer to the correct alternative. */
  whenNotToUse: z.array(z.object({ case: z.string(), use: z.string() })).optional(),
  gotchas: z.array(z.string()).optional(),
  /** Slot/data-part notes specific to this component. */
  theming: z.array(z.string()).optional(),
});

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
    /** Curated agent guidance; only meaningful on the English page (see above). */
    agent: agentGuidance.optional(),
  }),
});

export const collections = { docs };
