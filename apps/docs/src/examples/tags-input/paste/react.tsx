import { TagsInput } from "@moderno-ui/react";

export function TagsInputPasteDemo() {
  return (
    <TagsInput.Root addOnPaste>
      <TagsInput.Label>Colors</TagsInput.Label>
      <TagsInput.Control>
        <TagsInput.Context>
          {(tagsInput) =>
            tagsInput.value.map((value, index) => (
              <TagsInput.Item key={index} index={index} value={value}>
                <TagsInput.ItemPreview>
                  <TagsInput.ItemText>{value}</TagsInput.ItemText>
                  <TagsInput.ItemDeleteTrigger>×</TagsInput.ItemDeleteTrigger>
                </TagsInput.ItemPreview>
                <TagsInput.ItemInput />
              </TagsInput.Item>
            ))
          }
        </TagsInput.Context>
        <TagsInput.Input placeholder="Paste red, green, blue" />
      </TagsInput.Control>
    </TagsInput.Root>
  );
}
