import type { ReactNode } from "react";
import { Card } from "@moderno-ui/react";

export type ContainerSize = "sm" | "md" | "lg" | "full";

export interface ContainerProps {
  size?: ContainerSize;
  children?: ReactNode;
}

export function Container({ size = "lg", children }: ContainerProps) {
  return (
    <div className="@container moderno-block-container w-full text-foreground">
      <div
        data-size={size}
        className="mx-auto w-full px-4 py-6 data-[size=lg]:max-w-lg data-[size=md]:max-w-md data-[size=sm]:max-w-sm @sm:px-6 @md:px-8 @lg:py-10"
      >
        {children ?? (
          <Card.Root>
            <Card.Header>
              <Card.Title>Page content</Card.Title>
              <Card.Description>
                The container centres this card and keeps the same gutter on both sides.
              </Card.Description>
            </Card.Header>
          </Card.Root>
        )}
      </div>
    </div>
  );
}
