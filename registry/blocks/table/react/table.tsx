import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Menu,
  Pagination,
  Portal,
  Skeleton,
  type BadgeVariant,
} from "@moderno-ui/react";

export interface TableInvoice {
  id: string;
  number: string;
  customer: string;
  email: string;
  issued: string;
  amount: number;
  status: string;
  statusVariant?: BadgeVariant;
}

export interface TableAction {
  value: string;
  label: string;
}

export type TableSortColumn = "number" | "customer" | "amount";

export type TableSortDirection = "ascending" | "descending";

const sampleInvoices: TableInvoice[] = [
  {
    id: "inv-1042",
    number: "INV-1042",
    customer: "Acme Studio",
    email: "billing@acme.example",
    issued: "12 Jan 2026",
    amount: 2400,
    status: "Paid",
    statusVariant: "success",
  },
  {
    id: "inv-1041",
    number: "INV-1041",
    customer: "Northwind Traders",
    email: "ap@northwind.example",
    issued: "9 Jan 2026",
    amount: 1250.5,
    status: "Pending",
    statusVariant: "warning",
  },
  {
    id: "inv-1040",
    number: "INV-1040",
    customer: "Lumen Labs",
    email: "finance@lumen.example",
    issued: "5 Jan 2026",
    amount: 860,
    status: "Overdue",
    statusVariant: "error",
  },
  {
    id: "inv-1039",
    number: "INV-1039",
    customer: "Bluebird Coffee",
    email: "hello@bluebird.example",
    issued: "2 Jan 2026",
    amount: 320,
    status: "Paid",
    statusVariant: "success",
  },
  {
    id: "inv-1038",
    number: "INV-1038",
    customer: "Oak & Iron",
    email: "accounts@oakiron.example",
    issued: "28 Dec 2025",
    amount: 5400,
    status: "Paid",
    statusVariant: "success",
  },
  {
    id: "inv-1037",
    number: "INV-1037",
    customer: "Parcel Post",
    email: "billing@parcel.example",
    issued: "22 Dec 2025",
    amount: 1980,
    status: "Draft",
  },
  {
    id: "inv-1036",
    number: "INV-1036",
    customer: "Fjord Design",
    email: "studio@fjord.example",
    issued: "18 Dec 2025",
    amount: 740,
    status: "Paid",
    statusVariant: "success",
  },
  {
    id: "inv-1035",
    number: "INV-1035",
    customer: "Kite Analytics",
    email: "ops@kite.example",
    issued: "15 Dec 2025",
    amount: 3100,
    status: "Overdue",
    statusVariant: "error",
  },
  {
    id: "inv-1034",
    number: "INV-1034",
    customer: "Marlow Books",
    email: "orders@marlow.example",
    issued: "11 Dec 2025",
    amount: 450,
    status: "Paid",
    statusVariant: "success",
  },
  {
    id: "inv-1033",
    number: "INV-1033",
    customer: "Sable Health",
    email: "finance@sable.example",
    issued: "6 Dec 2025",
    amount: 2750,
    status: "Pending",
    statusVariant: "warning",
  },
  {
    id: "inv-1032",
    number: "INV-1032",
    customer: "Tern Mobility",
    email: "ap@tern.example",
    issued: "2 Dec 2025",
    amount: 1120,
    status: "Paid",
    statusVariant: "success",
  },
  {
    id: "inv-1031",
    number: "INV-1031",
    customer: "Quill Legal",
    email: "billing@quill.example",
    issued: "27 Nov 2025",
    amount: 690,
    status: "Paid",
    statusVariant: "success",
  },
];

const defaultRowActions: TableAction[] = [
  { value: "view", label: "View" },
  { value: "download", label: "Download PDF" },
  { value: "delete", label: "Delete" },
];

const defaultBatchActions: TableAction[] = [
  { value: "mark-paid", label: "Mark as paid" },
  { value: "download", label: "Download PDFs" },
  { value: "delete", label: "Delete" },
];

const euros = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" });

const sortIndicator = { ascending: "↑", descending: "↓" };

export interface TableProps {
  heading?: string;
  description?: string;
  invoices?: TableInvoice[];
  pageSize?: number;
  rowActions?: TableAction[];
  batchActions?: TableAction[];
  formatAmount?: (amount: number) => string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  onRowAction?: (action: string, id: string) => void;
  onBatchAction?: (action: string, ids: string[]) => void;
  onRetry?: () => void;
}

export function Table({
  heading = "Invoices",
  description = "Every invoice you have sent, with what is still owed.",
  invoices,
  pageSize = 5,
  rowActions = defaultRowActions,
  batchActions = defaultBatchActions,
  formatAmount = (amount) => euros.format(amount),
  error,
  loading = false,
  disabled = false,
  onSelectionChange,
  onRowAction,
  onBatchAction,
  onRetry,
}: TableProps) {
  const [sort, setSort] = useState<{
    column: TableSortColumn;
    direction: TableSortDirection;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const rows = invoices ?? sampleInvoices;
  const sorted = sort
    ? [...rows].sort((a, b) => {
        const order =
          sort.column === "amount"
            ? a.amount - b.amount
            : a[sort.column].localeCompare(b[sort.column], undefined, { numeric: true });
        return sort.direction === "ascending" ? order : -order;
      })
    : rows;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selected = selectedIds.filter((id) => rows.some((row) => row.id === id));
  const pageSelected = pageRows.filter((row) => selected.includes(row.id)).length;
  const pageChecked =
    pageSelected === 0 ? false : pageSelected === pageRows.length ? true : "indeterminate";

  function select(ids: string[]) {
    setSelectedIds(ids);
    onSelectionChange?.(ids);
  }

  function selectRow(id: string, checked: boolean) {
    select(checked ? [...selected, id] : selected.filter((selectedId) => selectedId !== id));
  }

  function selectPage(checked: boolean) {
    const pageIds = pageRows.map((row) => row.id);
    const others = selected.filter((id) => !pageIds.includes(id));
    select(checked ? [...others, ...pageIds] : others);
  }

  function sortBy(column: TableSortColumn) {
    setSort((current) => ({
      column,
      direction:
        current?.column === column && current.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
    setPage(1);
  }

  function sortableHeader(column: TableSortColumn, label: string, align: "start" | "end") {
    const direction = sort?.column === column ? sort.direction : undefined;
    return (
      <th
        scope="col"
        aria-sort={direction}
        className={`px-2 py-2 font-medium ${align === "end" ? "text-end" : "text-start"}`}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-2"
          disabled={disabled}
          onClick={() => sortBy(column)}
        >
          {label}
          <span aria-hidden="true" className={direction ? undefined : "text-muted-foreground"}>
            {direction ? sortIndicator[direction] : "↕"}
          </span>
        </Button>
      </th>
    );
  }

  return (
    <section className="@container moderno-block-table text-foreground">
      <div className="grid gap-6 px-4 py-12 @lg:py-16">
        <div className="grid gap-2">
          <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
          {description ? (
            <p className="text-body text-pretty text-muted-foreground">{description}</p>
          ) : null}
        </div>

        {error ? (
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>Your invoices are safe. Try again in a moment.</Alert.Description>
              <Alert.Action>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={onRetry}
                >
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        ) : loading ? (
          <div
            role="status"
            aria-busy="true"
            className="grid divide-y divide-border rounded-lg border border-border"
          >
            <span className="sr-only">Loading your invoices…</span>
            {Array.from({ length: pageSize }, (_, key) => (
              <div key={key} aria-hidden="true" className="flex items-center gap-4 px-4 py-3">
                <Skeleton shape="rect" className="size-4 shrink-0 rounded-sm" />
                <Skeleton shape="text" className="w-1/5" />
                <Skeleton shape="text" className="w-2/5" />
                <Skeleton shape="text" className="ms-auto w-1/6" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
            You have not sent any invoices yet.
          </p>
        ) : (
          <div className="grid gap-4">
            <div className="flex min-h-7 flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <p className="text-ui-md text-muted-foreground tabular-nums" aria-live="polite">
                {selected.length > 0
                  ? `${selected.length} of ${rows.length} selected`
                  : rows.length === 1
                    ? "1 invoice"
                    : `${rows.length} invoices`}
              </p>
              {selected.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() => select([])}
                  >
                    Clear selection
                  </Button>
                  <Menu.Root
                    size="sm"
                    onSelect={(details) => onBatchAction?.(details.value, selected)}
                  >
                    <Menu.Trigger disabled={disabled}>
                      Bulk actions <Menu.Indicator>▾</Menu.Indicator>
                    </Menu.Trigger>
                    <Portal>
                      <Menu.Positioner>
                        <Menu.Content>
                          {batchActions.map((action) => (
                            <Menu.Item key={action.value} value={action.value}>
                              {action.label}
                            </Menu.Item>
                          ))}
                        </Menu.Content>
                      </Menu.Positioner>
                    </Portal>
                  </Menu.Root>
                </div>
              ) : null}
            </div>

            <div
              role="region"
              aria-label={heading}
              tabIndex={0}
              className="relative overflow-x-auto rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <table className="w-full min-w-max border-collapse text-ui-md">
                <caption className="sr-only">{heading}</caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="w-px py-2 ps-4 pe-2 text-start">
                      <Checkbox.Root
                        className="flex"
                        checked={pageChecked}
                        disabled={disabled}
                        onCheckedChange={(details) => selectPage(details.checked === true)}
                      >
                        <Checkbox.Control>
                          <Checkbox.Indicator>✓</Checkbox.Indicator>
                          <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
                        </Checkbox.Control>
                        <Checkbox.Label className="sr-only">
                          Select every invoice on this page
                        </Checkbox.Label>
                        <Checkbox.HiddenInput />
                      </Checkbox.Root>
                    </th>
                    {sortableHeader("number", "Invoice", "start")}
                    {sortableHeader("customer", "Customer", "start")}
                    <th
                      scope="col"
                      className="hidden px-4 py-2 text-start text-ui-sm font-medium @lg:table-cell"
                    >
                      Issued
                    </th>
                    <th scope="col" className="px-4 py-2 text-start text-ui-sm font-medium">
                      Status
                    </th>
                    {sortableHeader("amount", "Amount", "end")}
                    <th scope="col" className="w-px py-2 ps-2 pe-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((invoice) => {
                    const isSelected = selected.includes(invoice.id);
                    return (
                      <tr
                        key={invoice.id}
                        data-selected={isSelected || undefined}
                        className="border-b border-border transition-colors last:border-b-0 hover:bg-muted data-selected:bg-muted"
                      >
                        <td className="w-px py-3 ps-4 pe-2">
                          <Checkbox.Root
                            className="flex"
                            checked={isSelected}
                            disabled={disabled}
                            onCheckedChange={(details) =>
                              selectRow(invoice.id, details.checked === true)
                            }
                          >
                            <Checkbox.Control>
                              <Checkbox.Indicator>✓</Checkbox.Indicator>
                            </Checkbox.Control>
                            <Checkbox.Label className="sr-only">
                              Select {invoice.number}
                            </Checkbox.Label>
                            <Checkbox.HiddenInput />
                          </Checkbox.Root>
                        </td>
                        <th
                          scope="row"
                          className="px-4 py-3 text-start font-medium whitespace-nowrap tabular-nums"
                        >
                          {invoice.number}
                        </th>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="block">{invoice.customer}</span>
                          <span className="hidden text-ui-sm text-muted-foreground @lg:block">
                            {invoice.email}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 whitespace-nowrap text-muted-foreground @lg:table-cell">
                          {invoice.issued}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={invoice.statusVariant ?? "neutral"} size="sm" dot>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-end font-medium whitespace-nowrap tabular-nums">
                          {formatAmount(invoice.amount)}
                        </td>
                        <td className="w-px py-3 ps-2 pe-4 text-end">
                          <Menu.Root
                            size="sm"
                            onSelect={(details) => onRowAction?.(details.value, invoice.id)}
                          >
                            <Menu.Trigger
                              aria-label={`Actions for ${invoice.number}`}
                              disabled={disabled}
                            >
                              ⋯
                            </Menu.Trigger>
                            <Portal>
                              <Menu.Positioner>
                                <Menu.Content>
                                  {rowActions.map((action) => (
                                    <Menu.Item key={action.value} value={action.value}>
                                      {action.label}
                                    </Menu.Item>
                                  ))}
                                </Menu.Content>
                              </Menu.Positioner>
                            </Portal>
                          </Menu.Root>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pageCount > 1 ? (
              <Pagination.Root
                className="justify-self-center @sm:justify-self-end"
                count={rows.length}
                pageSize={pageSize}
                page={currentPage}
                onPageChange={(details) => setPage(details.page)}
              >
                <Pagination.PrevTrigger disabled={disabled || undefined}>‹</Pagination.PrevTrigger>
                <Pagination.Context>
                  {(pagination) =>
                    pagination.pages.map((item, index) =>
                      item.type === "page" ? (
                        <Pagination.Item key={index} {...item} disabled={disabled || undefined}>
                          {item.value}
                        </Pagination.Item>
                      ) : (
                        <Pagination.Ellipsis key={index} index={index}>
                          …
                        </Pagination.Ellipsis>
                      ),
                    )
                  }
                </Pagination.Context>
                <Pagination.NextTrigger disabled={disabled || undefined}>›</Pagination.NextTrigger>
              </Pagination.Root>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
