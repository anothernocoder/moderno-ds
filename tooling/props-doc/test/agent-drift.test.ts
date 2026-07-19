import { describe, expect, it } from "vitest";
import { checkAgentDrift, type AgentDriftCheckInput } from "../src/agent-drift.ts";

const BASE: AgentDriftCheckInput = {
  name: "Button",
  slug: "button",
  agent: { intent: "A single click action." },
  agentPropsHash: "sha256:abc",
  currentPropsHash: "sha256:abc",
};

describe("checkAgentDrift", () => {
  it("passes a component whose agent: block is present and pinned to the current props hash", () => {
    expect(checkAgentDrift([BASE])).toEqual([]);
  });

  it("flags a component with no agent: block at all", () => {
    const issues = checkAgentDrift([{ ...BASE, agent: undefined }]);
    expect(issues).toEqual([{ name: "Button", slug: "button", reason: "missing-agent-block" }]);
  });

  it("flags a component whose props changed but agentPropsHash wasn't bumped", () => {
    const issues = checkAgentDrift([{ ...BASE, currentPropsHash: "sha256:def" }]);
    expect(issues).toEqual([{ name: "Button", slug: "button", reason: "stale-props-hash" }]);
  });

  it("flags a component whose agent: block never recorded a props hash", () => {
    const issues = checkAgentDrift([{ ...BASE, agentPropsHash: undefined }]);
    expect(issues).toEqual([{ name: "Button", slug: "button", reason: "stale-props-hash" }]);
  });

  it("passes once agentPropsHash is bumped alongside a props change", () => {
    const issues = checkAgentDrift([
      { ...BASE, agentPropsHash: "sha256:def", currentPropsHash: "sha256:def" },
    ]);
    expect(issues).toEqual([]);
  });

  it("checks every component independently", () => {
    const issues = checkAgentDrift([
      BASE,
      { ...BASE, name: "Field", slug: "field", agent: undefined },
      { ...BASE, name: "Select", slug: "select", currentPropsHash: "sha256:def" },
    ]);
    expect(issues).toEqual([
      { name: "Field", slug: "field", reason: "missing-agent-block" },
      { name: "Select", slug: "select", reason: "stale-props-hash" },
    ]);
  });
});
