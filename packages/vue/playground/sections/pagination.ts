/**
 * Pagination — Ark's pagination machine: each root reaches the server as a
 * named `<nav>` with its page list, the current page marked, and prev already
 * disabled on the first page.
 */
import { h } from "vue";
import { Pagination } from "../../src/pagination.js";
import type { Section } from "../section.js";

type Page = { type: "page"; value: number } | { type: "ellipsis" };

// A Pagination row: prev, the page list Ark's Context hands back (pages and
// ellipses), next.
const pageRow = () => [
  h(Pagination.PrevTrigger, {}, () => "‹"),
  h(Pagination.Context, null, {
    default: ({ pages }: { pages: Page[] }) =>
      pages.map((page, index) =>
        page.type === "page"
          ? h(Pagination.Item, { key: index, ...page }, () => String(page.value))
          : h(Pagination.Ellipsis, { key: index, index }, () => "…"),
      ),
  }),
  h(Pagination.NextTrigger, {}, () => "›"),
];

const PaginationSection: Section = () =>
  h("section", { "aria-label": "pagination" }, [
    h(Pagination.Root, { count: 100, pageSize: 10, defaultPage: 5 }, () => pageRow()),
    h(Pagination.Root, { size: "sm", count: 30, pageSize: 10 }, () => pageRow()),
  ]);

export default PaginationSection;
