import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add checkout-form-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "checkout-form-react", target: "src/components/blocks/checkout-form.tsx" },
    { item: "checkout-form-vue", target: "src/components/blocks/CheckoutForm.vue" },
    { item: "checkout-form-svelte", target: "src/components/blocks/CheckoutForm.svelte" },
    { item: "checkout-form-solid", target: "src/components/blocks/checkout-form.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Field per
      // input, a RadioGroup for the delivery method, a Switch to save the card,
      // Dividers between the groups, two Buttons and an Alert when it fails…
      for (const primitive of ["Field", "RadioGroup", "Switch", "Divider", "Button", "Alert"]) {
        expect(written).toContain(primitive);
      }
      expect(written).toContain("RadioGroup.ItemHiddenInput");
      expect(written).toContain("Switch.HiddenInput");
      expect(written).toContain('variant="error"');
      // …both steps, and the named fields a consumer reads back from each…
      expect(written).toContain('"shipping"');
      expect(written).toContain('"payment"');
      for (const field of [
        '"email"',
        '"fullName"',
        '"address"',
        '"city"',
        '"region"',
        '"postalCode"',
        '"country"',
        'name="delivery"',
        '"cardName"',
        '"cardNumber"',
        '"expiry"',
        '"cvc"',
        'name="saveCard"',
      ]) {
        expect(written).toContain(field);
      }
      // …the browser's own autofill for the address and the card…
      for (const token of ['"street-address"', '"postal-code"', '"cc-number"', '"cc-csc"']) {
        expect(written).toContain(token);
      }
      // …the heading in the theme's display face…
      expect(written).toContain("font-serif");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): fields pair off and the buttons share a row,
      // then a larger heading and the delivery options side by side, then each
      // group's title beside its fields with more room above and below…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:grid-cols-2");
      expect(written).toContain("@sm:flex-row");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@md:grid-cols-2");
      expect(written).toContain("@lg:grid-cols-3");
      expect(written).toContain("@lg:py-16");
      expect(written).not.toContain("@media");
      // …and carrying its own loading render.
      expect(written).toContain("aria-busy");
      expect(written).toContain("Placing order");
    });
  }

  it("declares the framework package it composes and pulls in no extra items", async () => {
    const registry = await createRegistry(registryDir).load();
    for (const { item } of variants) {
      const entry = registry.getItem(item)!;
      expect(entry.type).toBe("registry:block");
      expect(entry.version).toBe("0.1.0");
      // No icons, and every primitive arrives with the framework package, so
      // `add` copies exactly one file and installs nothing else.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
