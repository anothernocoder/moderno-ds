/**
 * PinInput — every cell id (and the label's `for`) derives from one root id,
 * and `count` on the Root tells Ark how many cells there are, so the
 * server-rendered aria labels match the client's.
 */
import { h } from "vue";
import { PinInput } from "../../src/pin-input.js";
import type { Section } from "../section.js";

// A six-digit one-time code: the cell indices the PinInput renders.
const CODE_CELLS = [0, 1, 2, 3, 4, 5];

const PinInputSection: Section = () =>
  h("section", { "aria-label": "pin-input" }, [
    h(PinInput.Root, { count: CODE_CELLS.length, otp: true, size: "md" }, () => [
      h(PinInput.Label, {}, () => "Verification code"),
      h(PinInput.Control, {}, () =>
        CODE_CELLS.map((index) => h(PinInput.Input, { key: index, index })),
      ),
      h(PinInput.HiddenInput),
    ]),
  ]);

export default PinInputSection;
