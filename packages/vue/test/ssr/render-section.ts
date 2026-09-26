import { createSSRApp, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import type { Section } from "../../playground/section.js";

/**
 * Server-renders one playground section on its own, popovers closed, so an
 * assertion can only be satisfied by that section's component.
 */
export function renderSection(section: Section): Promise<string> {
  return renderToString(createSSRApp({ render: () => h(section, { open: false }) }));
}
