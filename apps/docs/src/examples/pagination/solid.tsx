/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { Pagination } from "@moderno-ui/solid";

export function PaginationDemo() {
  return (
    <Pagination.Root count={120} pageSize={10}>
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
  );
}
