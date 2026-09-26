import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** Button's props, resolved from the canonical react source, and its recipe's variants. */
export default function expectButton(button: AgentComponent): void {
  expect(button.props.map((p) => p.name).sort()).toEqual(["size", "variant"]);
  expect(button.variants).toEqual({
    variant: ["primary", "secondary", "outline", "ghost", "destructive"],
    size: ["sm", "md", "lg"],
  });
}
