/**
 * Pagination — Ark's pagination machine: the page list with its ellipses, the
 * current page and the triggers disabled at either end must reach the server.
 */
import { For } from "solid-js";
import { Pagination } from "../../src/pagination.jsx";
import type { Section } from "../section.js";

const PaginationSection: Section = () => (
  <section aria-label="pagination">
    <Pagination.Root count={100} pageSize={10} defaultPage={5}>
      <Pagination.PrevTrigger>‹</Pagination.PrevTrigger>
      <Pagination.Context>
        {(pagination) => (
          <For each={pagination().pages}>
            {(page, index) =>
              page.type === "page" ? (
                <Pagination.Item {...page}>{page.value}</Pagination.Item>
              ) : (
                <Pagination.Ellipsis index={index()}>…</Pagination.Ellipsis>
              )
            }
          </For>
        )}
      </Pagination.Context>
      <Pagination.NextTrigger>›</Pagination.NextTrigger>
    </Pagination.Root>
    <Pagination.Root size="sm" count={30} pageSize={10}>
      <Pagination.PrevTrigger>‹</Pagination.PrevTrigger>
      <Pagination.Context>
        {(pagination) => (
          <For each={pagination().pages}>
            {(page, index) =>
              page.type === "page" ? (
                <Pagination.Item {...page}>{page.value}</Pagination.Item>
              ) : (
                <Pagination.Ellipsis index={index()}>…</Pagination.Ellipsis>
              )
            }
          </For>
        )}
      </Pagination.Context>
      <Pagination.NextTrigger>›</Pagination.NextTrigger>
    </Pagination.Root>
  </section>
);

export default PaginationSection;
