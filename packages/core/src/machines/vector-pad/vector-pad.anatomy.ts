import { createAnatomy } from "@zag-js/anatomy";

/**
 * VectorPad's parts. The number fields are Ark NumberInputs of their own
 * (`data-scope="number-input"`), so they are not parts of this scope.
 */
export const anatomy = createAnatomy("vector-pad").parts(
  "root",
  "label",
  "control",
  "grid",
  "crosshair",
  "thumb",
);

export const parts = anatomy.build();
