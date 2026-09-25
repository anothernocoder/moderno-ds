/**
 * The token-contract page's slot tables, built from the contract data
 * (`@moderno-ui/css/contract`: names, groups, roles) and the neutral defaults
 * (`@moderno-ui/css/tokens.dtcg.json`: values). ADR-0008 writes a role once, in
 * the contract, so the page never keeps its own copy: a slot added to the
 * contract shows up here with no docs edit. `<ContractTable>` renders these
 * rows as HTML (two columns, the default under the slot name, to fit a phone)
 * and the page's `.md` twin renders them as a Markdown table.
 *
 * Roles are English on every locale: the contract carries English only, and it
 * is the text agents read from `get_contract` and each theme's DESIGN.md.
 */
import {
  COLOR_SLOTS,
  CONTRACT,
  EXTENDED_SLOTS,
  OTHER_SLOTS,
  TYPE_STEP_ROLES,
  TYPE_STEPS,
} from "@moderno-ui/css/contract";
import neutralTokens from "@moderno-ui/css/tokens.dtcg.json";
import { defaultsFrom } from "@moderno-ui/theme-compile";
import type { UiKey } from "../i18n/ui.ts";

export const CONTRACT_TABLES = ["color", "other", "extended", "type-scale"] as const;
export type ContractTableName = (typeof CONTRACT_TABLES)[number];

export interface ContractRow {
  /** `--slot`, or the step name in the type-scale table. */
  name: string;
  /** The neutral default in `:root`; absent in the tables of required slots. */
  value?: string;
  /** The neutral default in `.dark`, only where it differs from `:root`. */
  darkValue?: string;
  /** What it is for, from the contract, capitalized for a table cell. */
  role: string;
}

export interface ContractTable {
  /** What the first column lists. */
  key: "slot" | "step";
  /** Whether the table has a value column. */
  hasValue: boolean;
  rows: ContractRow[];
}

const defaults = defaultsFrom(neutralTokens);
const roleOf = new Map(CONTRACT.map((s) => [s.name, s.role]));

/** The type scale gets its own table, one row per step, so the extended table skips it. */
const TYPE_SCALE_SLOTS = new Set(TYPE_STEPS.flatMap((step) => [`text-${step}`, `leading-${step}`]));

function capitalized(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function neutralValue(name: string): string {
  const value = defaults.light.get(name);
  if (value === undefined) throw new Error(`tokens.dtcg.json has no light value for --${name}`);
  return value;
}

function slotRow(name: string, withValue: boolean): ContractRow {
  const row: ContractRow = { name: `--${name}`, role: capitalized(roleOf.get(name) ?? "") };
  if (!withValue) return row;
  const value = neutralValue(name);
  const dark = defaults.dark.get(name);
  return dark !== undefined && dark !== value
    ? { ...row, value, darkValue: dark }
    : { ...row, value };
}

export function contractTable(name: ContractTableName): ContractTable {
  switch (name) {
    case "color":
      return { key: "slot", hasValue: false, rows: COLOR_SLOTS.map((s) => slotRow(s, false)) };
    case "other":
      return { key: "slot", hasValue: false, rows: OTHER_SLOTS.map((s) => slotRow(s, false)) };
    case "extended":
      return {
        key: "slot",
        hasValue: true,
        rows: EXTENDED_SLOTS.filter((s) => !TYPE_SCALE_SLOTS.has(s)).map((s) => slotRow(s, true)),
      };
    case "type-scale":
      return {
        key: "step",
        hasValue: true,
        rows: TYPE_STEPS.map((step) => ({
          name: step,
          value: `${neutralValue(`text-${step}`)} / ${neutralValue(`leading-${step}`)}`,
          role: capitalized(TYPE_STEP_ROLES[step]),
        })),
      };
  }
}

export function isContractTableName(value: string | undefined): value is ContractTableName {
  return value !== undefined && (CONTRACT_TABLES as readonly string[]).includes(value);
}

/** Column headers of the Markdown table, in the page's language. */
function markdownHead(table: ContractTable, t: (key: UiKey) => string): string[] {
  const first = table.key === "slot" ? t("contract.slot") : t("contract.step");
  const value = table.key === "slot" ? t("contract.value") : t("contract.size");
  return [first, ...(table.hasValue ? [value] : []), t("contract.role")];
}

function escapeCell(text: string): string {
  return text.replace(/\|/g, "\\|");
}

/** The same table as Markdown, for the page's `.md` twin. */
export function contractTableMarkdown(name: ContractTableName, t: (key: UiKey) => string): string {
  const table = contractTable(name);
  const head = markdownHead(table, t);
  const lines = table.rows.map((row) => {
    const cells = [`\`${row.name}\``];
    if (table.hasValue) {
      const dark = row.darkValue ? ` (\`.dark\`: \`${row.darkValue}\`)` : "";
      cells.push(`\`${row.value}\`${dark}`);
    }
    cells.push(row.role);
    return `| ${cells.map(escapeCell).join(" | ")} |`;
  });
  return [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...lines].join(
    "\n",
  );
}
