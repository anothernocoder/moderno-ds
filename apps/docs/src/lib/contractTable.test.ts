import { describe, expect, it } from "vitest";
import { CONTRACT, TYPE_STEPS } from "@moderno-ui/css/contract";
import neutralTokens from "@moderno-ui/css/tokens.dtcg.json";
import { useTranslations } from "../i18n/ui.ts";
import { CONTRACT_TABLES, contractTable, contractTableMarkdown } from "./contractTable.ts";

const tables = CONTRACT_TABLES.map(contractTable);
const bySlot = new Map(
  tables.flatMap((t) => (t.key === "slot" ? t.rows : [])).map((r) => [r.name, r]),
);

describe("contractTable — the token-contract page's slot tables", () => {
  it("lists every contract slot once, in a slot row or a type-scale step", () => {
    const steps = contractTable("type-scale").rows.map((r) => r.name);
    expect(steps).toEqual([...TYPE_STEPS]);
    const listed = [
      ...bySlot.keys(),
      ...steps.flatMap((s) => [`--text-${s}`, `--leading-${s}`]),
    ].sort();
    expect(listed).toEqual(CONTRACT.map((s) => `--${s.name}`).sort());
  });

  it("takes each role from the contract", () => {
    for (const slot of CONTRACT) {
      const row = bySlot.get(`--${slot.name}`);
      if (!row) continue;
      expect(row.role.toLowerCase()).toBe(slot.role.toLowerCase());
    }
  });

  it("takes each extended default from the neutral DTCG file, and the dark one where it differs", () => {
    const light = neutralTokens.light as Record<string, { $value: string }>;
    const dark = neutralTokens.dark as Record<string, { $value: string }>;
    for (const row of contractTable("extended").rows) {
      const name = row.name.slice(2);
      expect(row.value).toBe(light[name]!.$value);
      expect(row.darkValue).toBe(
        dark[name] && dark[name].$value !== light[name]!.$value ? dark[name].$value : undefined,
      );
    }
    expect(bySlot.get("--overlay")?.darkValue).toBeDefined();
    expect(contractTable("type-scale").rows[0]!.value).toBe(
      `${light["text-ui-xs"]!.$value} / ${light["leading-ui-xs"]!.$value}`,
    );
  });

  it("gives the required tables no value column", () => {
    expect(contractTable("color").hasValue).toBe(false);
    expect(contractTable("other").hasValue).toBe(false);
    expect(contractTable("color").rows.every((r) => r.value === undefined)).toBe(true);
  });

  it("renders as Markdown with the page's column headers", () => {
    const en = contractTableMarkdown("extended", useTranslations("en"));
    expect(en).toMatch(/^\| Slot \| Default \| Role \|\n\| --- \| --- \| --- \|\n/);
    expect(en).toContain("| `--overlay` | `oklch(0 0 0 / 0.32)` (`.dark`: `oklch(0 0 0 / 0.6)`) |");
    const es = contractTableMarkdown("type-scale", useTranslations("es"));
    expect(es).toMatch(/^\| Paso \| Tamaño \/ interlineado \| Rol \|/);
  });
});
