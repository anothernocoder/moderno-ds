import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, type PropType } from "vue";
import {
  TagsInput,
  type TagsInputSize,
  type TagsInputValidityChangeDetails,
  type TagsInputValueChangeDetails,
} from "../src/index.js";

afterEach(cleanup);

describe("TagsInput surface (Vue)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { TagsInput: ArkTagsInput } = await import("@ark-ui/vue");
    for (const part of Object.keys(ArkTagsInput)) {
      if (part === "Root") continue; // wrapped below
      expect(TagsInput[part as keyof typeof TagsInput], `TagsInput.${part} missing`).toBeDefined();
    }
  });
});

const Demo = defineComponent({
  props: {
    size: { type: String as PropType<TagsInputSize>, default: undefined },
    value: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: undefined },
    max: { type: Number, default: undefined },
    disabled: { type: Boolean, default: false },
    invalid: { type: Boolean, default: undefined },
    validate: {
      type: Function as PropType<(details: { inputValue: string; value: string[] }) => boolean>,
      default: undefined,
    },
    onValueChange: {
      type: Function as PropType<(details: TagsInputValueChangeDetails) => void>,
      default: undefined,
    },
    onValueInvalid: {
      type: Function as PropType<(details: TagsInputValidityChangeDetails) => void>,
      default: undefined,
    },
  },
  setup(props) {
    return () =>
      h(
        TagsInput.Root,
        {
          size: props.size,
          modelValue: props.value,
          defaultValue: props.defaultValue,
          max: props.max,
          disabled: props.disabled,
          invalid: props.invalid,
          validate: props.validate,
          onValueChange: props.onValueChange,
          onValueInvalid: props.onValueInvalid,
          class: "frameworks",
        },
        () => [
          h(TagsInput.Label, {}, () => "Frameworks"),
          h(TagsInput.Control, {}, () => [
            h(TagsInput.Context, null, {
              default: ({ value }: { value: string[] }) =>
                value.map((tag, index) =>
                  h(TagsInput.Item, { key: index, index, value: tag }, () => [
                    h(TagsInput.ItemPreview, {}, () => [
                      h(TagsInput.ItemText, {}, () => tag),
                      h(TagsInput.ItemDeleteTrigger, {}, () => "×"),
                    ]),
                    h(TagsInput.ItemInput),
                  ]),
                ),
            }),
            h(TagsInput.Input),
            h(TagsInput.ClearTrigger, {}, () => "×"),
          ]),
          h(TagsInput.HiddenInput),
        ],
      );
  },
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="tags-input"][data-part="${name}"]`)!;
const parts = (name: string) => [
  ...document.querySelectorAll<HTMLElement>(`[data-scope="tags-input"][data-part="${name}"]`),
];
const tags = () => parts("item").map((item) => item.getAttribute("data-value"));
const input = () => screen.getByRole<HTMLInputElement>("textbox", { name: "Frameworks" });

describe("TagsInput", () => {
  it("applies the recipe to the root part, defaulting to md", () => {
    render(Demo, { props: { size: "sm" as const, defaultValue: ["React"] } });
    expect(part("root").getAttribute("data-size")).toBe("sm");
    // Ark's own anatomy is intact around the recipe attribute.
    expect(part("control").contains(part("item"))).toBe(true);
    expect(part("control").contains(part("input"))).toBe(true);
    expect(part("item-preview").contains(part("item-text"))).toBe(true);
    expect(part("item-preview").contains(part("item-delete-trigger"))).toBe(true);
    expect(part("item").contains(part("item-input"))).toBe(true);

    cleanup();
    render(Demo, { props: { defaultValue: ["React"] } });
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native attributes to Ark's root", () => {
    render(Demo);
    expect(part("root").className).toBe("frameworks");
  });

  it("names the input by the label and each delete trigger by its tag", () => {
    render(Demo, { props: { defaultValue: ["React", "Vue"] } });
    expect(input()).toBe(part("input"));
    expect(tags()).toEqual(["React", "Vue"]);
    expect(parts("item-text").map((text) => text.textContent)).toEqual(["React", "Vue"]);
    expect(screen.getByRole("button", { name: "Delete tag Vue" })).toBe(
      parts("item-delete-trigger")[1],
    );
  });

  it("adds a tag on Enter and on the delimiter, and reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { onValueChange } });
    await user.type(input(), "React{Enter}");
    // Ark empties the input a frame after the tag is taken.
    await waitFor(() => expect(input().value).toBe(""));
    expect(tags()).toEqual(["React"]);
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ["React"] });

    // Ark empties the input itself; user-event keeps its own copy of the text.
    await user.clear(input());
    await user.type(input(), "Vue,");
    await waitFor(() => expect(tags()).toEqual(["React", "Vue"]));
  });

  it("removes a tag with its delete trigger, and the last one with Backspace", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { defaultValue: ["React", "Vue", "Solid"] } });
    await user.click(screen.getByRole("button", { name: "Delete tag Vue" }));
    await waitFor(() => expect(tags()).toEqual(["React", "Solid"]));

    // The first Backspace in an empty input highlights the last tag; the
    // second removes it.
    await user.click(input());
    await user.keyboard("{Backspace}");
    await waitFor(() =>
      expect(parts("item-preview")[1]!.hasAttribute("data-highlighted")).toBe(true),
    );
    await user.keyboard("{Backspace}");
    await waitFor(() => expect(tags()).toEqual(["React"]));
  });

  it("edits a highlighted tag in place on Enter", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { defaultValue: ["React", "Vue"], onValueChange } });
    expect(parts("item-input")[1]!.hidden).toBe(true);
    // Arrow Left from the empty input highlights the last tag; Enter swaps its
    // chip for a box with the text selected.
    await user.click(input());
    await user.keyboard("{ArrowLeft}{Enter}");
    const itemInput = parts("item-input")[1] as HTMLInputElement;
    await waitFor(() => expect([itemInput.selectionStart, itemInput.selectionEnd]).toEqual([0, 3]));
    expect(itemInput.hidden).toBe(false);
    expect(parts("item-preview")[1]!.hidden).toBe(true);
    expect(itemInput.value).toBe("Vue");
    // A browser focuses the box when Ark selects its text; jsdom does not.
    itemInput.focus();
    await user.keyboard("Solid{Enter}");
    await waitFor(() => expect(tags()).toEqual(["React", "Solid"]));
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ["React", "Solid"] });
    expect(itemInput.hidden).toBe(true);
  });

  it("clears every tag with the clear trigger, which hides once empty", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { defaultValue: ["React", "Vue"] } });
    expect(part("clear-trigger").hidden).toBe(false);
    await user.click(part("clear-trigger"));
    await waitFor(() => expect(tags()).toEqual([]));
    expect(part("clear-trigger").hidden).toBe(true);
    expect(part("root").hasAttribute("data-empty")).toBe(true);
  });

  it("drops a duplicate, and refuses any tag past max", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { defaultValue: ["React"], max: 2 } });
    // Ark empties the input a frame after a tag is taken (or dropped).
    await user.type(input(), "React{Enter}");
    await waitFor(() => expect(input().value).toBe(""));
    expect(tags()).toEqual(["React"]);

    await user.clear(input());
    await user.type(input(), "Vue{Enter}");
    await waitFor(() => expect(input().value).toBe(""));
    expect(tags()).toEqual(["React", "Vue"]);

    // At max the tag is refused and its text stays in the input.
    await user.clear(input());
    await user.type(input(), "Solid{Enter}");
    expect(tags()).toEqual(["React", "Vue"]);
    expect(input().value).toBe("Solid");
  });

  it("reports a tag that validate rejects", async () => {
    const user = userEvent.setup();
    const onValueInvalid = vi.fn();
    render(Demo, {
      props: {
        validate: ({ inputValue }: { inputValue: string }) => inputValue.length > 1,
        onValueInvalid,
      },
    });
    await user.type(input(), "R{Enter}");
    expect(tags()).toEqual([]);
    expect(onValueInvalid).toHaveBeenLastCalledWith({ reason: "invalidTag" });
  });

  it("follows a controlled value", async () => {
    const { rerender } = render(Demo, { props: { value: ["React"] } });
    await rerender({ value: ["React", "Vue"] });
    await waitFor(() => expect(tags()).toEqual(["React", "Vue"]));
  });

  it("marks an invalid value on the control and the input", () => {
    render(Demo, { props: { invalid: true } });
    expect(part("control").hasAttribute("data-invalid")).toBe(true);
    expect(input().getAttribute("aria-invalid")).toBe("true");
  });

  it("disables every part and the input", () => {
    render(Demo, { props: { defaultValue: ["React"], disabled: true } });
    for (const name of ["root", "label", "control", "item", "item-preview", "item-text"]) {
      expect(part(name).hasAttribute("data-disabled"), name).toBe(true);
    }
    expect(input().disabled).toBe(true);
    expect(part("item-delete-trigger")).toHaveProperty("disabled", true);
  });
});
