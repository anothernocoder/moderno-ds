import type { AggregatedManifests, ComponentsManifest, Framework } from "../manifests.ts";

export function findFrameworkManifest(
  manifests: AggregatedManifests,
  framework: Framework,
): ComponentsManifest | undefined {
  return manifests.components.find((m) => m.framework === framework);
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
        ? `No @moderno/* framework package found under ${manifests.scopeDir}.`
        : "No node_modules/@moderno directory found from this working directory — is a @moderno/* package installed?";
  return new ModernoMcpError(`No manifest for framework "${framework}". ${hint}`);
}

export function componentNotFoundError(
  manifest: ComponentsManifest,
  name: string,
): ModernoMcpError {
  const available = manifest.components.map((c) => c.name).join(", ");
  return new ModernoMcpError(
    `No component named "${name}" in ${manifest.package}@${manifest.version} (${manifest.framework}). Available: ${available}.`,
  );
}
