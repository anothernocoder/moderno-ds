import { Pagination } from "@moderno-ui/react";

export function PaginationFirstLastDemo() {
  return (
    <Pagination.Root count={120} pageSize={10} defaultPage={6}>
      <Pagination.FirstTrigger>«</Pagination.FirstTrigger>
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
      <Pagination.LastTrigger>»</Pagination.LastTrigger>
    </Pagination.Root>
  );
}
