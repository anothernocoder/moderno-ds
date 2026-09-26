/**
 * Pagination — Ark's pagination machine: the page list with its ellipses, the
 * current page and the triggers disabled at either end must match both ways.
 */
import { Pagination } from "../../src/pagination.js";
import type { Section } from "../section.js";

const PaginationSection: Section = () => (
  <section aria-label="pagination">
    <Pagination.Root count={100} pageSize={10} defaultPage={5}>
      <Pagination.PrevTrigger>‹</Pagination.PrevTrigger>
      <Pagination.Context>
        {(pagination) =>
          pagination.pages.map((page, index) =>
            page.type === "page" ? (
              <Pagination.Item key={index} {...page}>
                {page.value}
              </Pagination.Item>
            ) : (
              <Pagination.Ellipsis key={index} index={index}>
                …
              </Pagination.Ellipsis>
            ),
          )
        }
      </Pagination.Context>
      <Pagination.NextTrigger>›</Pagination.NextTrigger>
    </Pagination.Root>
    <Pagination.Root size="sm" count={30} pageSize={10}>
      <Pagination.PrevTrigger>‹</Pagination.PrevTrigger>
      <Pagination.Context>
        {(pagination) =>
          pagination.pages.map((page, index) =>
            page.type === "page" ? (
              <Pagination.Item key={index} {...page}>
                {page.value}
              </Pagination.Item>
            ) : (
              <Pagination.Ellipsis key={index} index={index}>
                …
              </Pagination.Ellipsis>
            ),
          )
        }
      </Pagination.Context>
      <Pagination.NextTrigger>›</Pagination.NextTrigger>
    </Pagination.Root>
  </section>
);

export default PaginationSection;
