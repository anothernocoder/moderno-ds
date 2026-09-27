// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/vue";
import { renderToString } from "@vue/server-renderer";
import { createSSRApp, h } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import ShareInvite from "../../../registry/blocks/share-invite/vue/ShareInvite.vue";

/**
 * The Vue share-invite block, given the attributes a consumer passes.
 *
 * It lives in this `vue-ssr` project because only this project compiles
 * `<script setup>` SFCs (`@vitejs/plugin-vue`).
 *
 * The block renders two roots: its `@container` section and, after it, its own
 * `Toaster` (inside the section, layout containment would trap the fixed toast
 * group). Vue cannot place a fragment's attributes by itself, so it dropped a
 * consumer's `class` and `id` and warned about them. Every other Vue block has
 * one root, the section, and its attributes land there; these tests keep this
 * block in line with them.
 */

afterEach(cleanup);

const attrs = { class: "mx-auto max-w-xl", id: "share" };

function blockSection(): HTMLElement {
  const section = document.querySelector<HTMLElement>("section.moderno-block-share-invite");
  if (section === null) throw new Error("no share-invite section");
  return section;
}

describe("ShareInvite block (Vue)", () => {
  it("puts the consumer's class and id on its section", () => {
    render(ShareInvite, { attrs });

    expect(blockSection().id).toBe("share");
    expect(blockSection().classList).toContain("mx-auto");
    expect(blockSection().classList).toContain("max-w-xl");
    expect(blockSection().classList).toContain("@container");
  });

  it("does not warn about attributes it cannot place", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      render(ShareInvite, { attrs });
      const messages = warn.mock.calls.map((call) => String(call[0]));
      expect(messages.filter((message) => message.includes("Extraneous"))).toEqual([]);
    } finally {
      warn.mockRestore();
    }
  });

  it("puts the consumer's class and id on its section when rendered on the server", async () => {
    const html = await renderToString(createSSRApp({ render: () => h(ShareInvite, attrs) }));
    const section = html.match(/<section[^>]*>/)?.[0] ?? "";

    expect(section).toContain('id="share"');
    expect(section).toContain("moderno-block-share-invite");
    expect(section).toContain("mx-auto max-w-xl");
  });
});
