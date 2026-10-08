/**
 * Valid is not enough: a generated widget must also be usable. The system
 * prompt states the rules, and the lint checks the parsed program against the
 * ones code can see. A lint error counts like a parse error: it triggers the
 * one retry (ADR-0011).
 */
import type { ElementNode } from "@openuidev/lang-core";
import { actionField } from "../library/blocks.ts";

/** The UI rules of the system prompt, one line each. */
export const UI_RULES = [
  "Pick the control by the data: a code (a lottery number, a PIN, a zip code) → PinInput, or Field with inputMode numeric and maxLength; a quantity with limits → NumberInput with min and max; money → Field with inputMode numeric and the currency in the label; 2–5 options → RadioGroup or SegmentedControl; a longer list → Select.",
  "Every control renders at one size: do not try to size controls.",
  "A form has exactly one primary Button. Leave its action out: it then sends its label with the values of the form.",
  "Write labels and text in the language of the user.",
  "No emoji and no decorative text.",
];

/** A lint failure, shaped like OpenUI's `ValidationError` so the retry reads both alike. */
export interface UsabilityError {
  code: "usability";
  component: string;
  path: string;
  message: string;
  statementId?: string;
}

/** The Simple forms that take input: a widget holding one is a form. */
const CONTROLS = new Set([
  "Field",
  "NumberInput",
  "PinInput",
  "Select",
  "Combobox",
  "RadioGroup",
  "SegmentedControl",
  "ToggleGroup",
  "TagsInput",
  "Checkbox",
  "Switch",
  "Slider",
  "DatePicker",
]);
const WITH_OPTIONS = new Set([
  "Select",
  "Combobox",
  "RadioGroup",
  "SegmentedControl",
  "ToggleGroup",
]);

/** A label that names a code, not a quantity. */
const CODE_LABEL = /c[oó]digo|code|n[uú]mero|number|pin|zip|postal|phone|tel[eé]fono|c[eé]dula/i;

/** Every element under `node`, itself included, in program order. */
function elements(node: unknown): ElementNode[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object") return [];
  if ((node as ElementNode).type !== "element") return [];
  const element = node as ElementNode;
  return [element, ...Object.values(element.props).flatMap(elements)];
}

const isPrimary = (button: ElementNode) => (button.props.variant ?? "primary") === "primary";

function error(element: ElementNode, message: string): UsabilityError {
  return {
    code: "usability",
    component: element.typeName,
    path: "",
    message,
    statementId: element.statementId,
  };
}

/** A NumberInput for a code: its label names one, and it has no limits, or limits that are a digit count (0 to 9999). */
function isCodeStepper(input: ElementNode): boolean {
  const { label, min, max } = input.props;
  const digitLimits = (min === undefined || min === 0) && /^9{2,}$/.test(String(max));
  return (
    CODE_LABEL.test(String(label)) && ((min === undefined && max === undefined) || digitLimits)
  );
}

/** A form Block's own submit button: `FormLayout(…, submitLabel, submitClick)`. */
const SUBMIT_ACTION = actionField("submitLabel");

/**
 * The usability errors of a parsed program; `[]` when it has none.
 * `formBlocks` names the Blocks that submit a form: each is a form with its
 * own primary action.
 */
export function checkUsability(
  root: ElementNode | null,
  formBlocks: ReadonlySet<string> = new Set(),
): UsabilityError[] {
  const all = elements(root);
  const errors: UsabilityError[] = [];

  for (const element of all) {
    const options = element.props.options;
    if (WITH_OPTIONS.has(element.typeName) && !(Array.isArray(options) && options.length)) {
      errors.push(error(element, `${element.typeName} has no options: list them.`));
    }
    if (element.typeName === "NumberInput" && isCodeStepper(element)) {
      errors.push(
        error(
          element,
          `NumberInput "${String(element.props.label)}" is a code, not a quantity: nobody steps to it. Use PinInput, or Field with inputMode "numeric" and maxLength.`,
        ),
      );
    }
  }

  const submitters = all.filter((element) => formBlocks.has(element.typeName));
  if (!submitters.length && !all.some((element) => CONTROLS.has(element.typeName))) return errors;
  const buttons = all.filter((element) => element.typeName === "Button" && isPrimary(element));
  const primaries = buttons.length + submitters.length;
  if (primaries === 0) {
    errors.push(error(root!, "The form has no primary Button to send it: add one."));
  }
  if (primaries > 1) {
    errors.push(
      error(
        root!,
        submitters.length
          ? `The form has ${primaries} primary actions, and ${submitters[0]!.typeName} sends the form itself: keep it, make every Button outline.`
          : `The form has ${primaries} primary Buttons: keep one, make the rest outline.`,
      ),
    );
  }
  for (const block of submitters) {
    if (block.props[SUBMIT_ACTION] !== undefined) {
      errors.push(
        error(
          block,
          `${block.typeName} sets ${SUBMIT_ACTION}, which drops the values of the form. Leave it out: it then sends its label with the values.`,
        ),
      );
    }
  }
  // Only the default action sends the values: a fixed message or a URL drops them.
  for (const button of buttons) {
    if (button.props.action !== undefined) {
      errors.push(
        error(
          button,
          "The form's primary Button sets an action, which drops the values of the form. Leave its action out: it then sends its label with the values.",
        ),
      );
    }
  }
  return errors;
}
