/** @jsxImportSource solid-js */
import { Index } from "solid-js";
import { TagsInput } from "@moderno-ui/solid";

export function TagsInputPasteDemo() {
  return (
    <TagsInput.Root addOnPaste>
      <TagsInput.Label>Colors</TagsInput.Label>
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
        <TagsInput.Input placeholder="Paste red, green, blue" />
      </TagsInput.Control>
    </TagsInput.Root>
  );
}
