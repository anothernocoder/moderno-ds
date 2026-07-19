/**
 * CI drift gate (issue #45) — pure decision logic, no fs/git. A primitive's
 * `agent:` MDX front-matter block must exist, and its sibling
 * `agentPropsHash` field (the props hash the block was last reviewed
 * against) must match the props hash `props-doc` generates right now.
 * Bumping `agentPropsHash` without reviewing the prose is possible, but it
 * means editing the block alongside the props change, which is the bar
 * ADR-0003 asks for — not a silent gap.
 */
import type { AgentGuidance } from "./agent-manifest.ts";

export interface AgentDriftCheckInput {
  name: string;
  slug: string;
  agent: AgentGuidance | undefined;
  agentPropsHash: string | undefined;
  currentPropsHash: string;
}

export type AgentDriftReason = "missing-agent-block" | "stale-props-hash";

export interface AgentDriftIssue {
  name: string;
  slug: string;
  reason: AgentDriftReason;
}

export function checkAgentDrift(inputs: AgentDriftCheckInput[]): AgentDriftIssue[] {
  const issues: AgentDriftIssue[] = [];
  for (const { name, slug, agent, agentPropsHash, currentPropsHash } of inputs) {
    if (!agent) {
      issues.push({ name, slug, reason: "missing-agent-block" });
      continue;
    }
    if (agentPropsHash !== currentPropsHash) {
      issues.push({ name, slug, reason: "stale-props-hash" });
    }
  }
  return issues;
}
