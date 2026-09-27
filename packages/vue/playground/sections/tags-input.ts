/**
 * TagsInput — Ark's tags-input machine: each tag reaches the server with its
 * text and a named delete trigger, the label points at the input, the hidden
 * input carries the form value and a disabled root is already marked.
 */
import { h } from "vue";
import { TagsInput } from "../../src/tags-input.js";
import type { Section } from "../section.js";

// One tags input: its tags from Ark's Context, then the input.
const tagsInput = (props: {
  size?: "sm";
  label: string;
  defaultValue: string[];
  disabled?: boolean;
}) =>
  h(
    TagsInput.Root,
    { size: props.size, defaultValue: props.defaultValue, disabled: props.disabled, name: "tags" },
    () => [
      h(TagsInput.Label, {}, () => props.label),
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
        h(TagsInput.Input, { placeholder: "Add a tag" }),
        h(TagsInput.ClearTrigger, {}, () => "×"),
      ]),
      h(TagsInput.HiddenInput),
    ],
  );

const TagsInputSection: Section = () =>
  h("section", { "aria-label": "tags-input" }, [
    tagsInput({ label: "Frameworks", defaultValue: ["React", "Vue"] }),
    tagsInput({ size: "sm", label: "Topics", defaultValue: ["Design"], disabled: true }),
  ]);

export default TagsInputSection;
