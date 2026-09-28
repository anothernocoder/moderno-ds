import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add timeline-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "timeline-react", target: "src/components/blocks/timeline.tsx" },
    { item: "timeline-vue", target: "src/components/blocks/Timeline.vue" },
    { item: "timeline-svelte", target: "src/components/blocks/Timeline.svelte" },
    { item: "timeline-solid", target: "src/components/blocks/timeline.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: Toggles
      // with Tooltips for play, loop and the track labels, Buttons for adding,
      // deleting and zooming, and Sliders for the ruler and tracks…
      for (const primitive of ["Toggle", "Tooltip", "Button", "Slider"]) {
        expect(written).toContain(primitive);
      }
      // …the ruler's time marks as Slider markers and the playhead named…
      expect(written).toContain("Slider.Marker");
      expect(written).toContain('aria-label="Playhead"');
      // …keyframes that keep their order and never share a frame…
      expect(written).toMatch(/minStepsBetweenThumbs|min-steps-between-thumbs/);
      // …the add, delete and zoom buttons named, the zoom level announced…
      for (const label of ["Add keyframe", "Delete keyframe", "Zoom out", "Zoom in", "Fit"]) {
        expect(written).toContain(`label: "${label}"`);
      }
      expect(written).toContain('import { announce } from "@moderno-ui/core"');
      expect(written).toContain("Zoom ${Math.round(");
      // …laid out from its container rather than the viewport (ADR-0005).
      expect(written).toContain("@container");
      expect(written).toContain("@sm:w-34");
      expect(written).toContain("@md:block");
      expect(written).not.toContain("@media");

      const recorded = await readManifest(project());
      expect(recorded.items[item]!.version).toBe(registry.getItem(item)!.version);
      expect(recorded.items[item]!.type).toBe("registry:block");
      expect(recorded.items[item]!.files[0]!.target).toBe(target);
    });
  }

  it("declares the packages it imports and pulls in no extra items", async () => {
    const registry = await createRegistry(registryDir).load();
    for (const { item } of variants) {
      const entry = registry.getItem(item)!;
      expect(entry.type).toBe("registry:block");
      // No icon package: the icons are inline SVG, so every primitive arrives
      // with the framework package, `announce()` with core, and `add` copies
      // exactly one file.
      expect(entry.dependencies).toEqual([
        `@moderno-ui/${item.split("-").pop()}`,
        "@moderno-ui/core",
      ]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
