/**
 * SortableList — the sortable-list machine from core on a <ul>: the recipe
 * on the root, the Tab stop on the first trigger, the handles' names, a
 * disabled item and a disabled list.
 */
import { h } from "vue";
import { SortableList } from "../../src/sortable-list.js";
import type { Section } from "../section.js";

const SLIDES = [
  { value: "title", label: "Title" },
  { value: "logo", label: "Logo" },
  { value: "colors", label: "Colors" },
];

const SortableListSection: Section = () =>
  h("section", { "aria-label": "sortable lists" }, [
    h(
      SortableList.Root,
      { defaultItems: SLIDES.map((slide) => slide.value), "aria-label": "Slides" },
      () =>
        SLIDES.map((slide) =>
          h(
            SortableList.Item,
            {
              key: slide.value,
              value: slide.value,
              label: slide.label,
              disabled: slide.value === "title",
            },
            () => [
              h(SortableList.ItemHandle),
              h(SortableList.ItemTrigger, null, () => slide.label),
            ],
          ),
        ),
    ),
    h(
      SortableList.Root,
      { size: "sm", disabled: true, defaultItems: ["a", "b"], "aria-label": "Layers" },
      () => [
        h(SortableList.Item, { value: "a" }, () => h(SortableList.ItemTrigger, null, () => "A")),
        h(SortableList.Item, { value: "b" }, () => h(SortableList.ItemTrigger, null, () => "B")),
      ],
    ),
  ]);

export default SortableListSection;
