import { createAnatomy } from "@zag-js/anatomy";

/**
 * Toolbar's parts. The names are the `data-part` values the stylesheet keys
 * off, under `data-scope="toolbar"`.
 */
export const anatomy = createAnatomy("toolbar").parts(
  "root",
  "button",
  "toggle",
  "group",
  "separator",
);

export const parts = anatomy.build();
