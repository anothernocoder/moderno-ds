import { Show, children, type JSX } from "solid-js";
import { Card } from "@moderno-ui/solid";

export type ContainerSize = "sm" | "md" | "lg" | "full";

export interface ContainerProps {
  size?: ContainerSize;
  children?: JSX.Element;
}

export function Container(props: ContainerProps) {
  const content = children(() => props.children);

  return (
    <div class="@container moderno-block-container w-full text-foreground">
      <div
        data-size={props.size ?? "lg"}
        class="mx-auto w-full px-4 py-6 data-[size=lg]:max-w-lg data-[size=md]:max-w-md data-[size=sm]:max-w-sm @sm:px-6 @md:px-8 @lg:py-10"
      >
        <Show
          when={content()}
          fallback={
            <Card.Root>
              <Card.Header>
                <Card.Title>Page content</Card.Title>
                <Card.Description>
                  The container centres this card and keeps the same gutter on both sides.
                </Card.Description>
              </Card.Header>
            </Card.Root>
          }
        >
          {content()}
        </Show>
      </div>
    </div>
  );
}
