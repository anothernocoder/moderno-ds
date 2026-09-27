// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
import { afterEach, describe, expect, it } from "vitest";
import InputGroup from "../../../registry/blocks/input-group/vue/InputGroup.vue";

/**
 * The Vue input-group block, mounted in a browser-like DOM and typed into.
 *
 * It lives in this `vue-ssr` project, not the sibling `vue` one, because only
 * this project compiles `<script setup>` SFCs (`@vitejs/plugin-vue`). The jsdom
 * docblock makes Vite compile the file for the client, which is what a
 * consumer's app runs.
 *
 * The block once bound each input with `:value` alone. Ark's `Field.Input`
 * re-renders whenever the field's `invalid` or `disabled` changes, and Vue then
 * puts the prop back into the DOM. So the text a user typed vanished the moment
 * the consumer showed an error or started loading. React (`defaultValue`) and
 * Svelte never did that; these tests keep Vue in line with them.
 */

afterEach(cleanup);

function inputByName(name: string): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
  if (input === null) throw new Error(`no input named ${name}`);
  return input;
}

describe("InputGroup block (Vue)", () => {
  it("keeps the typed store address when an error arrives", async () => {
    const { rerender } = render(InputGroup);
    await fireEvent.update(inputByName("website"), "my shop");

    await rerender({ errors: { website: "Enter an address like acme.shop, without spaces." } });

    expect(inputByName("website").getAttribute("aria-invalid")).toBe("true");
    expect(inputByName("website").value).toBe("my shop");
  });

  it("keeps the typed price when an error arrives", async () => {
    const { rerender } = render(InputGroup);
    await fireEvent.update(inputByName("price"), "12,5");

    await rerender({ errors: { price: "Use a dot for cents." } });

    expect(inputByName("price").value).toBe("12,5");
  });

  it("keeps the typed query while the search is loading, and after", async () => {
    const { rerender, emitted } = render(InputGroup);
    await fireEvent.update(inputByName("query"), "linen");
    await fireEvent.click(screen.getByRole("button", { name: "Search" }));

    await rerender({ loading: true });
    expect(inputByName("query").disabled).toBe(true);
    expect(inputByName("query").value).toBe("linen");

    await rerender({ loading: false });
    expect(inputByName("query").value).toBe("linen");
    expect(emitted().search).toEqual([["linen"]]);
  });

  it("shows a new value when the consumer changes the prop", async () => {
    const { rerender } = render(InputGroup, { props: { website: "acme.shop" } });
    await fireEvent.update(inputByName("website"), "my shop");

    await rerender({ website: "linen.shop" });

    expect(inputByName("website").value).toBe("linen.shop");
  });
});
