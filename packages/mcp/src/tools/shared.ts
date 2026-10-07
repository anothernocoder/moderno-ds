import type {
  AgentBlock,
  AgentComponent,
  AggregatedManifests,
  ComponentsManifest,
  Framework,
} from "@moderno-ui/lint-core";

export function findFrameworkManifest(
  manifests: AggregatedManifests,
  framework: Framework,
): ComponentsManifest | undefined {
  return manifests.components.find((m) => m.framework === framework);
}

/** A primitive or a block (ADR-0012), looked up by name, case-insensitively. */
export function findComponentOrBlock(
  manifest: ComponentsManifest,
  name: string,
): AgentComponent | AgentBlock | undefined {
  const wanted = name.toLowerCase();
  const byName = (entry: { name: string }) => entry.name.toLowerCase() === wanted;
  return manifest.components.find(byName) ?? manifest.blocks?.find(byName);
}

/** One error type every tool throws for "framework not installed" — the MCP SDK maps it to a tool error result. */
export class ModernoMcpError extends Error {}

export function frameworkNotFoundError(
  manifests: AggregatedManifests,
  framework: Framework,
): ModernoMcpError {
  const installed = manifests.components.map((m) => m.framework);
  const hint =
    installed.length > 0
      ? `Installed frameworks: ${installed.join(", ")}.`
      : manifests.scopeDir
        ? `No @moderno-ui/* framework package found under ${manifests.scopeDir}.`
        : "No node_modules/@moderno-ui directory found from this working directory — is a @moderno-ui/* package installed?";
  return new ModernoMcpError(`No manifest for framework "${framework}". ${hint}`);
}

export function componentNotFoundError(
  manifest: ComponentsManifest,
  name: string,
): ModernoMcpError {
  const available = manifest.components.map((c) => c.name).join(", ");
  const blocks = manifest.blocks?.length
    ? ` Blocks: ${manifest.blocks.map((b) => b.name).join(", ")}.`
    : "";
  return new ModernoMcpError(
    `No component or block named "${name}" in ${manifest.package}@${manifest.version} (${manifest.framework}). Available: ${available}.${blocks}`,
  );
}
