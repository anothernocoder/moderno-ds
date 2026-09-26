import { Pagination } from "@moderno-ui/react";

export function PaginationSizesDemo() {
  return (
    <div className="demo-stack">
      <Pagination.Root size="sm" count={50} pageSize={10}>
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
      <Pagination.Root size="md" count={50} pageSize={10}>
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
      <Pagination.Root size="lg" count={50} pageSize={10}>
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
    </div>
  );
}
