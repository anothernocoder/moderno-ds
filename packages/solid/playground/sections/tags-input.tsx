/**
 * TagsInput — Ark's tags-input machine: each tag with its text and named
 * delete trigger, the label pointing at the input, the hidden form value and
 * a disabled root must reach the server.
 */
import { Index } from "solid-js";
import { TagsInput } from "../../src/tags-input.jsx";
import type { Section } from "../section.js";

/** One tags input: its tags from Ark's Context, then the input. */
function Tags(props: { size?: "sm"; label: string; defaultValue: string[]; disabled?: boolean }) {
  return (
    <TagsInput.Root
      size={props.size}
      defaultValue={props.defaultValue}
      disabled={props.disabled}
      name="tags"
    >
      <TagsInput.Label>{props.label}</TagsInput.Label>
      <TagsInput.Control>
        <TagsInput.Context>
          {(tagsInput) => (
            <Index each={tagsInput().value}>
              {(value, index) => (
                <TagsInput.Item index={index} value={value()}>
                  <TagsInput.ItemPreview>
                    <TagsInput.ItemText>{value()}</TagsInput.ItemText>
                    <TagsInput.ItemDeleteTrigger>×</TagsInput.ItemDeleteTrigger>
                  </TagsInput.ItemPreview>
                  <TagsInput.ItemInput />
                </TagsInput.Item>
              )}
            </Index>
          )}
        </TagsInput.Context>
        <TagsInput.Input placeholder="Add a tag" />
        <TagsInput.ClearTrigger>×</TagsInput.ClearTrigger>
      </TagsInput.Control>
      <TagsInput.HiddenInput />
    </TagsInput.Root>
  );
}

const TagsInputSection: Section = () => (
  <section aria-label="tags-input">
    <Tags label="Frameworks" defaultValue={["React", "Vue"]} />
    <Tags size="sm" label="Topics" defaultValue={["Design"]} disabled />
  </section>
);

export default TagsInputSection;
