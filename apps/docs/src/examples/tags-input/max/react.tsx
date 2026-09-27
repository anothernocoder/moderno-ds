import { TagsInput } from "@moderno-ui/react";

export function TagsInputMaxDemo() {
  return (
    <TagsInput.Root max={3} defaultValue={["React", "Vue"]}>
      <TagsInput.Label>Up to three frameworks</TagsInput.Label>
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
        <TagsInput.Input placeholder="Add a framework" />
      </TagsInput.Control>
    </TagsInput.Root>
  );
}
