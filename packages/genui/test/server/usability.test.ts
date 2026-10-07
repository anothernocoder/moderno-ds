import { fileURLToPath } from "node:url";
import { createParser } from "@openuidev/lang-core";
import { discoverManifests } from "@moderno-ui/lint-core";
import { describe, expect, it } from "vitest";
import { checkUsability, createSubLibrary, fromManifest } from "../../src/server.ts";

const installed = discoverManifests(fileURLToPath(new URL("../..", import.meta.url)));
const manifest = installed.components.find((candidate) => candidate.framework === "react")!;
const library = createSubLibrary(fromManifest(manifest, installed.contract!), [
  "Field",
  "NumberInput",
  "Select",
  "RadioGroup",
  "Button",
]);
const parser = createParser(library.toJSONSchema(), "Stack");

/** The lint findings, as `statement: message`, for a root Stack that holds every line. */
function lint(...lines: string[]): string[] {
  const names = lines.map((line) => line.slice(0, line.indexOf(" =")));
  const { root, meta } = parser.parse([`root = Stack([${names.join(", ")}])`, ...lines].join("\n"));
  expect(meta.errors).toEqual([]);
  return checkUsability(root).map((error) => `${error.statementId}: ${error.message}`);
}

const send = 'send = Button("primary", ["Send"])';

describe("checkUsability", () => {
  it("passes a form with one primary Button and no action", () => {
    expect(lint('name = Field("Name")', 'cancel = Button("outline", ["Cancel"])', send)).toEqual(
      [],
    );
  });

  it("passes a widget with no controls, whatever its buttons", () => {
    expect(lint('a = Button("primary", ["A"])', 'b = Button(null, ["B"])')).toEqual([]);
  });

  it("flags a Select or a RadioGroup with no options", () => {
    expect(lint('pick = Select("Size", [])', 'size = RadioGroup("Size", [])', send)).toEqual([
      "pick: Select has no options: list them.",
      "size: RadioGroup has no options: list them.",
    ]);
  });

  it("flags a form with no primary Button, or with two", () => {
    expect(lint('name = Field("Name")')).toEqual([
      "root: The form has no primary Button to send it: add one.",
    ]);
    // A Button with no variant is primary.
    expect(lint('name = Field("Name")', send, 'again = Button(null, ["Again"])')).toEqual([
      "root: The form has 2 primary Buttons: keep one, make the rest outline.",
    ]);
  });

  it("flags a form whose primary Button sets an action", () => {
    expect(
      lint(
        'name = Field("Name")',
        'send = Button("primary", ["Send"], Action([@ToAssistant("Hi")]))',
      ),
    ).toEqual([expect.stringMatching(/^send: .*drops the values/)]);
  });

  it("flags a NumberInput for a code, not one for a quantity", () => {
    const flagged = (line: string) => lint(line, send).length > 0;

    expect(flagged('code = NumberInput("Código postal")')).toBe(true);
    expect(flagged('code = NumberInput("Lottery number", 0, 9999)')).toBe(true);
    expect(flagged('guests = NumberInput("Number of guests", 1, 12)')).toBe(false);
    expect(flagged('amount = NumberInput("Amount", 0, 9999)')).toBe(false);
  });
});
