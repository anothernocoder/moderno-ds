/**
 * Tier rules for the registry (ADR-0005).
 *
 * Composition above primitives has three copy tiers — **block** (a page
 * section), **screen** (a full-viewport composition of blocks, one state of a
 * flow) and **flow** (an ordered sequence of screens plus the example assembly
 * that owns the navigation state). Composition is expressed with the ordinary
 * `registryDependencies` field, so `add`/`update`/`diff` keep working per item
 * and shadcn tooling still understands the manifest; there is no `composes`
 * field to teach anyone.
 *
 * What the field cannot express on its own is *direction*: nothing in the JSON
 * stops a block from pulling in a whole flow, which would make `moderno add
 * login-form` install a router. This module is that missing rule — one table of
 * legal edges plus a cycle check — used by the registry integrity test and by
 * the docs copy step before the registry is published under `/r/`.
 */
import { isRegistryItemType, type RegistryItem, type RegistryItemType } from "./types.ts";

/**
 * Which item types each type may list in `registryDependencies`. Reading down
 * the table is the tier ladder: a type may only compose types below it (a
 * component may compose another ejected component), never above it and never
 * across to a theme — a theme is installed on its own and paints everything.
 */
export const TIER_DEPENDENCIES: Record<RegistryItemType, readonly RegistryItemType[]> = {
  "registry:theme": [],
  "registry:component": ["registry:component"],
  "registry:block": ["registry:component"],
  "registry:screen": ["registry:block", "registry:component"],
  "registry:flow": ["registry:screen"],
};

export type TierViolation = {
  /** Item that carries the offending declaration. */
  item: string;
  kind: "unknown-type" | "unknown-dependency" | "illegal-edge" | "cycle";
  /** One line, ready to print in a CI failure. */
  message: string;
};

/**
 * Check a whole registry's items against the tier rules. Returns every
 * violation rather than throwing on the first, so one CI run reports the whole
 * catalog. An empty array means the registry is publishable.
 */
export function checkTiers(items: readonly RegistryItem[]): TierViolation[] {
  const violations: TierViolation[] = [];
  const byName = new Map<string, RegistryItem>();
  for (const item of items) byName.set(item.name, item);

  for (const item of items) {
    if (!isRegistryItemType(item.type)) {
      violations.push({
        item: item.name,
        kind: "unknown-type",
        message: `${item.name}: unknown type "${item.type}"`,
      });
      continue;
    }
    const allowed = TIER_DEPENDENCIES[item.type];
    for (const depName of item.registryDependencies ?? []) {
      const dep = byName.get(depName);
      if (!dep) {
        violations.push({
          item: item.name,
          kind: "unknown-dependency",
          message: `${item.name}: depends on unknown item "${depName}"`,
        });
        continue;
      }
      if (!allowed.includes(dep.type)) {
        violations.push({
          item: item.name,
          kind: "illegal-edge",
          message:
            `${item.name} (${item.type}) may not depend on ${depName} (${dep.type}); ` +
            `allowed: ${allowed.length > 0 ? allowed.join(", ") : "nothing"}`,
        });
      }
    }
  }

  for (const cycle of findCycles(items)) {
    violations.push({
      item: cycle[0]!,
      kind: "cycle",
      message: `dependency cycle: ${[...cycle, cycle[0]].join(" → ")}`,
    });
  }
  return violations;
}

/**
 * Back edges in `registryDependencies`: a directed graph has a cycle iff a DFS
 * finds a back edge, so this detects every cycle the gate must reject. It does
 * not enumerate them — the report is keyed on the sorted node set, so two
 * distinct cycles over the same nodes collapse into one entry; do not rely on
 * the returned list as a complete catalogue.
 *
 * A cycle does not hang `add`: `resolveInstallOrder` marks an item seen before
 * it recurses, so `a -> b -> a` terminates. It yields an arbitrary, silently
 * truncated install order instead — a screen written before the block it
 * composes — which is why a cycle is fatal even between two items of the same
 * tier, where the edge table allows the edge.
 */
function findCycles(items: readonly RegistryItem[]): string[][] {
  const deps = new Map<string, readonly string[]>();
  for (const item of items) deps.set(item.name, item.registryDependencies ?? []);

  const cycles: string[][] = [];
  const seenCycles = new Set<string>();
  const done = new Set<string>();
  const stack: string[] = [];
  const onStack = new Set<string>();

  const visit = (name: string): void => {
    if (done.has(name)) return;
    if (onStack.has(name)) {
      const cycle = stack.slice(stack.indexOf(name));
      const key = [...cycle].sort().join("|");
      if (!seenCycles.has(key)) {
        seenCycles.add(key);
        cycles.push(cycle);
      }
      return;
    }
    stack.push(name);
    onStack.add(name);
    for (const dep of deps.get(name) ?? []) visit(dep);
    stack.pop();
    onStack.delete(name);
    done.add(name);
  };

  for (const item of items) visit(item.name);
  return cycles;
}
