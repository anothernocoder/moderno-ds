import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on DatePicker", () => {
  it("accepts real DatePicker usage and knows its Ark anatomy", () => {
    const code = [
      'import { DatePicker, Portal, parseDate } from "@moderno-ui/react";',
      "",
      '<DatePicker.Root size="sm" selectionMode="range" locale="es-ES" defaultValue={[parseDate("2024-05-06")]}>',
      "  <DatePicker.Label>Trip</DatePicker.Label>",
      "  <DatePicker.Control>",
      "    <DatePicker.Input index={0} />",
      "    <DatePicker.Input index={1} />",
      "    <DatePicker.Trigger>▾</DatePicker.Trigger>",
      "  </DatePicker.Control>",
      "  <Portal>",
      "    <DatePicker.Positioner>",
      "      <DatePicker.Content>",
      '        <DatePicker.View view="day">',
      "          <DatePicker.Context>",
      "            {(datePicker) => (",
      "              <DatePicker.Table>",
      "                <DatePicker.TableBody>",
      "                  {datePicker.weeks.map((week, i) => (",
      "                    <DatePicker.TableRow key={i}>",
      "                      {week.map((day, j) => (",
      "                        <DatePicker.TableCell key={j} value={day}>",
      "                          <DatePicker.TableCellTrigger>{day.day}</DatePicker.TableCellTrigger>",
      "                        </DatePicker.TableCell>",
      "                      ))}",
      "                    </DatePicker.TableRow>",
      "                  ))}",
      "                </DatePicker.TableBody>",
      "              </DatePicker.Table>",
      "            )}",
      "          </DatePicker.Context>",
      "        </DatePicker.View>",
      "      </DatePicker.Content>",
      "    </DatePicker.Positioner>",
      "  </Portal>",
      "</DatePicker.Root>",
      "",
      '[data-scope="date-picker"][data-part="table-cell-trigger"][data-today] { color: var(--primary); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<DatePicker.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="date-picker"][data-part="day"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"day" is not a real part of DatePicker');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { DatePicker } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { DatePicker } from "@moderno-ui/react"');
  });
});
