/** @jsxImportSource solid-js */
import { Index } from "solid-js";
import { TagsInput } from "@moderno-ui/solid";

export function TagsInputSizesDemo() {
  return (
    <div class="demo-stack">
      <TagsInput.Root size="sm" defaultValue={["React"]}>
        <TagsInput.Label>Small</TagsInput.Label>
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
          <TagsInput.Input />
        </TagsInput.Control>
      </TagsInput.Root>
      <TagsInput.Root size="md" defaultValue={["React"]}>
        <TagsInput.Label>Medium</TagsInput.Label>
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
          <TagsInput.Input />
        </TagsInput.Control>
      </TagsInput.Root>
      <TagsInput.Root size="lg" defaultValue={["React"]}>
        <TagsInput.Label>Large</TagsInput.Label>
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
          <TagsInput.Input />
        </TagsInput.Control>
      </TagsInput.Root>
    </div>
  );
}
