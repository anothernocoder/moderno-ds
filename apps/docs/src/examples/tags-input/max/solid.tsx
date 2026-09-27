/** @jsxImportSource solid-js */
import { Index } from "solid-js";
import { TagsInput } from "@moderno-ui/solid";

export function TagsInputMaxDemo() {
  return (
    <TagsInput.Root max={3} defaultValue={["React", "Vue"]}>
      <TagsInput.Label>Up to three frameworks</TagsInput.Label>
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
        <TagsInput.Input placeholder="Add a framework" />
      </TagsInput.Control>
    </TagsInput.Root>
  );
}
