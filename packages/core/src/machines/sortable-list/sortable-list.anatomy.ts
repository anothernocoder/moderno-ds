import { createAnatomy } from "@zag-js/anatomy";

/**
 * SortableList's parts: `root > item > item-handle + item-trigger`. The
 * trigger is the item's one focus target (its name button); the handle is
 * optional, and without it the whole item drags.
 */
export const anatomy = createAnatomy("sortable-list").parts(
  "root",
  "item",
  "itemHandle",
  "itemTrigger",
);

export const parts = anatomy.build();
