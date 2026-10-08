import { fileURLToPath } from "node:url";
import { createParser } from "@openuidev/lang-core";
import { discoverManifests } from "@moderno-ui/lint-core";
import { describe, expect, it } from "vitest";
import { checkUsability, createSubLibrary, fromManifest } from "../../src/server.ts";

const installed = discoverManifests(fileURLToPath(new URL("../..", import.meta.url)));
const manifest = installed.components.find((candidate) => candidate.framework === "react")!;
const blocks = ["FormLayout", "LoginForm", "StatRow"];
const library = createSubLibrary(fromManifest(manifest, installed.contract!, blocks), [
  "Field",
  "NumberInput",
  "Select",
  "RadioGroup",
  "Button",
  ...blocks,
]);
const parser = createParser(library.toJSONSchema(), "Stack");
const formBlocks = new Set(["FormLayout", "LoginForm"]);

/** The lint findings, as `statement: message`, for a root Stack that holds every line. */
function lint(...lines: string[]): string[] {
  const names = lines.map((line) => line.slice(0, line.indexOf(" =")));
  const { root, meta } = parser.parse([`root = Stack([${names.join(", ")}])`, ...lines].join("\n"));
  expect(meta.errors).toEqual([]);
  return checkUsability(root, formBlocks).map((error) => `${error.statementId}: ${error.message}`);
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

  describe("on a program with Blocks", () => {
    // The lint's root Stack holds every line, so the Block's children are written inline.
    const formLayout = (children: string, ...rest: string[]) =>
      `form = FormLayout([${children}], "Elige tu número", "Chance"${rest.map((arg) => `, ${arg}`).join("")})`;
    const number = 'Field("Número", "", null, null, "numeric", 4)';
    const play = 'Button("primary", ["Jugar"])';

    it("passes a form Block that holds controls and no primary Button", () => {
      expect(lint(formLayout(number))).toEqual([]);
      expect(lint('login = LoginForm([{"id": "length", "label": "8 characters"}])')).toEqual([]);
    });

    it("passes a Block that is no form, beside a widget with no controls", () => {
      const stats =
        'stats = StatRow("Ventas", "Mayo", [{"id": "a", "label": "Total", "value": "$1"}])';
      expect(lint(stats, 'more = Button("primary", ["Ver más"])')).toEqual([]);
    });

    it("flags a primary Button beside or inside a form Block", () => {
      expect(lint(formLayout(`${number}, ${play}`))).toEqual([
        "root: The form has 2 primary actions, and FormLayout sends the form itself: keep it, make every Button outline.",
      ]);
      expect(lint(formLayout(number), send)).toHaveLength(1);
    });

    it("flags a form Block whose submit sets an action, and a control with no options", () => {
      expect(
        lint(
          formLayout(
            'Select("Lotería", [])',
            "null",
            "null",
            '"Jugar"',
            'Action([@ToAssistant("Hi")])',
          ),
        ),
      ).toEqual([
        "undefined: Select has no options: list them.",
        expect.stringMatching(/^form: FormLayout sets submitClick, which drops the values/),
      ]);
    });
  });
});
