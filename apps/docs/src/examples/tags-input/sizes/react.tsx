import { TagsInput } from "@moderno-ui/react";

export function TagsInputSizesDemo() {
  return (
    <div className="demo-stack">
      <TagsInput.Root size="sm" defaultValue={["React"]}>
        <TagsInput.Label>Small</TagsInput.Label>
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
          <TagsInput.Input />
        </TagsInput.Control>
      </TagsInput.Root>
      <TagsInput.Root size="md" defaultValue={["React"]}>
        <TagsInput.Label>Medium</TagsInput.Label>
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
          <TagsInput.Input />
        </TagsInput.Control>
      </TagsInput.Root>
      <TagsInput.Root size="lg" defaultValue={["React"]}>
        <TagsInput.Label>Large</TagsInput.Label>
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
          <TagsInput.Input />
        </TagsInput.Control>
      </TagsInput.Root>
    </div>
  );
}
