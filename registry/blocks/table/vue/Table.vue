<script setup lang="ts">
import { computed, ref } from "vue";
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
} from "@moderno-ui/vue";

interface TableInvoice {
  id: string;
  number: string;
  customer: string;
  email: string;
  issued: string;
  amount: number;
  status: string;
  statusVariant?: BadgeVariant;
}

interface TableAction {
  value: string;
  label: string;
}

type TableSortColumn = "number" | "customer" | "amount";

type TableSortDirection = "ascending" | "descending";

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

const props = withDefaults(
  defineProps<{
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
  }>(),
  {
    heading: "Invoices",
    description: "Every invoice you have sent, with what is still owed.",
    invoices: undefined,
    pageSize: 5,
    rowActions: undefined,
    batchActions: undefined,
    formatAmount: undefined,
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  selectionChange: [ids: string[]];
  rowAction: [action: string, id: string];
  batchAction: [action: string, ids: string[]];
  retry: [];
}>();

const shownRowActions = computed(() => props.rowActions ?? defaultRowActions);
const shownBatchActions = computed(() => props.batchActions ?? defaultBatchActions);
const format = computed(() => props.formatAmount ?? euros.format);

const sort = ref<{ column: TableSortColumn; direction: TableSortDirection } | null>(null);
const page = ref(1);
const selectedIds = ref<string[]>([]);

const rows = computed(() => props.invoices ?? sampleInvoices);
const sorted = computed(() => {
  const current = sort.value;
  if (!current) return rows.value;
  return [...rows.value].sort((a, b) => {
    const order =
      current.column === "amount"
        ? a.amount - b.amount
        : a[current.column].localeCompare(b[current.column], undefined, { numeric: true });
    return current.direction === "ascending" ? order : -order;
  });
});
const pageCount = computed(() => Math.max(1, Math.ceil(rows.value.length / props.pageSize)));
const currentPage = computed(() => Math.min(page.value, pageCount.value));
const pageRows = computed(() =>
  sorted.value.slice((currentPage.value - 1) * props.pageSize, currentPage.value * props.pageSize),
);
const selected = computed(() =>
  selectedIds.value.filter((id) => rows.value.some((row) => row.id === id)),
);
const pageSelected = computed(
  () => pageRows.value.filter((row) => selected.value.includes(row.id)).length,
);
const pageChecked = computed(() =>
  pageSelected.value === 0
    ? false
    : pageSelected.value === pageRows.value.length
      ? true
      : "indeterminate",
);
const placeholders = computed(() => Array.from({ length: props.pageSize }, (_, index) => index));
const disabledAttrs = computed(() => (props.disabled ? { disabled: true } : {}));

function select(ids: string[]) {
  selectedIds.value = ids;
  emit("selectionChange", ids);
}

function selectRow(id: string, checked: boolean) {
  select(
    checked ? [...selected.value, id] : selected.value.filter((selectedId) => selectedId !== id),
  );
}

function selectPage(checked: boolean) {
  const pageIds = pageRows.value.map((row) => row.id);
  const others = selected.value.filter((id) => !pageIds.includes(id));
  select(checked ? [...others, ...pageIds] : others);
}

function sortBy(column: TableSortColumn) {
  sort.value = {
    column,
    direction:
      sort.value?.column === column && sort.value.direction === "ascending"
        ? "descending"
        : "ascending",
  };
  page.value = 1;
}

function directionOf(column: TableSortColumn) {
  return sort.value?.column === column ? sort.value.direction : undefined;
}

const leadingSortColumns: { column: TableSortColumn; label: string }[] = [
  { column: "number", label: "Invoice" },
  { column: "customer", label: "Customer" },
];
</script>

<template>
  <section class="@container moderno-block-table text-foreground">
    <div class="grid gap-6 px-4 py-12 @lg:py-16">
      <div class="grid gap-2">
        <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{{ heading }}</h2>
        <p v-if="description" class="text-body text-pretty text-muted-foreground">
          {{ description }}
        </p>
      </div>

      <Alert.Root v-if="error" variant="error">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>Your invoices are safe. Try again in a moment.</Alert.Description>
          <Alert.Action>
            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="disabled"
              @click="emit('retry')"
            >
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
      <div
        v-else-if="loading"
        role="status"
        aria-busy="true"
        class="grid divide-y divide-border rounded-lg border border-border"
      >
        <span class="sr-only">Loading your invoices…</span>
        <div
          v-for="key in placeholders"
          :key="key"
          aria-hidden="true"
          class="flex items-center gap-4 px-4 py-3"
        >
          <Skeleton shape="rect" class="size-4 shrink-0 rounded-sm" />
          <Skeleton shape="text" class="w-1/5" />
          <Skeleton shape="text" class="w-2/5" />
          <Skeleton shape="text" class="ms-auto w-1/6" />
        </div>
      </div>
      <p
        v-else-if="rows.length === 0"
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        You have not sent any invoices yet.
      </p>
      <div v-else class="grid gap-4">
        <div class="flex min-h-7 flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p class="text-ui-md text-muted-foreground tabular-nums" aria-live="polite">
            {{
              selected.length > 0
                ? `${selected.length} of ${rows.length} selected`
                : rows.length === 1
                  ? "1 invoice"
                  : `${rows.length} invoices`
            }}
          </p>
          <div v-if="selected.length > 0" class="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              :disabled="disabled"
              @click="select([])"
            >
              Clear selection
            </Button>
            <Menu.Root
              size="sm"
              @select="(details: { value: string }) => emit('batchAction', details.value, selected)"
            >
              <Menu.Trigger :disabled="disabled">
                Bulk actions <Menu.Indicator>▾</Menu.Indicator>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item
                      v-for="action in shownBatchActions"
                      :key="action.value"
                      :value="action.value"
                    >
                      {{ action.label }}
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </div>
        </div>

        <div
          role="region"
          :aria-label="heading"
          tabindex="0"
          class="relative overflow-x-auto rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <table class="w-full min-w-max border-collapse text-ui-md">
            <caption class="sr-only">
              {{
                heading
              }}
            </caption>
            <thead>
              <tr class="border-b border-border">
                <th scope="col" class="w-px py-2 ps-4 pe-2 text-start">
                  <Checkbox.Root
                    class="flex"
                    :checked="pageChecked"
                    :disabled="disabled"
                    @checked-change="
                      (details: { checked: boolean | 'indeterminate' }) =>
                        selectPage(details.checked === true)
                    "
                  >
                    <Checkbox.Control>
                      <Checkbox.Indicator>✓</Checkbox.Indicator>
                      <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
                    </Checkbox.Control>
                    <Checkbox.Label class="sr-only"
                      >Select every invoice on this page</Checkbox.Label
                    >
                    <Checkbox.HiddenInput />
                  </Checkbox.Root>
                </th>
                <th
                  v-for="header in leadingSortColumns"
                  :key="header.column"
                  scope="col"
                  :aria-sort="directionOf(header.column)"
                  class="px-2 py-2 text-start font-medium"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="px-2"
                    :disabled="disabled"
                    @click="sortBy(header.column)"
                  >
                    {{ header.label }}
                    <span
                      aria-hidden="true"
                      :class="directionOf(header.column) ? undefined : 'text-muted-foreground'"
                      >{{
                        directionOf(header.column)
                          ? sortIndicator[directionOf(header.column)!]
                          : "↕"
                      }}</span
                    >
                  </Button>
                </th>
                <th
                  scope="col"
                  class="hidden px-4 py-2 text-start text-ui-sm font-medium @lg:table-cell"
                >
                  Issued
                </th>
                <th scope="col" class="px-4 py-2 text-start text-ui-sm font-medium">Status</th>
                <th
                  scope="col"
                  :aria-sort="directionOf('amount')"
                  class="px-2 py-2 text-end font-medium"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="px-2"
                    :disabled="disabled"
                    @click="sortBy('amount')"
                  >
                    Amount
                    <span
                      aria-hidden="true"
                      :class="directionOf('amount') ? undefined : 'text-muted-foreground'"
                      >{{
                        directionOf("amount") ? sortIndicator[directionOf("amount")!] : "↕"
                      }}</span
                    >
                  </Button>
                </th>
                <th scope="col" class="w-px py-2 ps-2 pe-4">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="invoice in pageRows"
                :key="invoice.id"
                :data-selected="selected.includes(invoice.id) || undefined"
                class="border-b border-border transition-colors last:border-b-0 hover:bg-muted data-selected:bg-muted"
              >
                <td class="w-px py-3 ps-4 pe-2">
                  <Checkbox.Root
                    class="flex"
                    :checked="selected.includes(invoice.id)"
                    :disabled="disabled"
                    @checked-change="
                      (details: { checked: boolean | 'indeterminate' }) =>
                        selectRow(invoice.id, details.checked === true)
                    "
                  >
                    <Checkbox.Control>
                      <Checkbox.Indicator>✓</Checkbox.Indicator>
                    </Checkbox.Control>
                    <Checkbox.Label class="sr-only">Select {{ invoice.number }}</Checkbox.Label>
                    <Checkbox.HiddenInput />
                  </Checkbox.Root>
                </td>
                <th
                  scope="row"
                  class="px-4 py-3 text-start font-medium whitespace-nowrap tabular-nums"
                >
                  {{ invoice.number }}
                </th>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="block">{{ invoice.customer }}</span>
                  <span class="hidden text-ui-sm text-muted-foreground @lg:block">{{
                    invoice.email
                  }}</span>
                </td>
                <td class="hidden px-4 py-3 whitespace-nowrap text-muted-foreground @lg:table-cell">
                  {{ invoice.issued }}
                </td>
                <td class="px-4 py-3">
                  <Badge :variant="invoice.statusVariant ?? 'neutral'" size="sm" dot>{{
                    invoice.status
                  }}</Badge>
                </td>
                <td class="px-4 py-3 text-end font-medium whitespace-nowrap tabular-nums">
                  {{ format(invoice.amount) }}
                </td>
                <td class="w-px py-3 ps-2 pe-4 text-end">
                  <Menu.Root
                    size="sm"
                    @select="
                      (details: { value: string }) => emit('rowAction', details.value, invoice.id)
                    "
                  >
                    <Menu.Trigger :aria-label="`Actions for ${invoice.number}`" :disabled="disabled"
                      >⋯</Menu.Trigger
                    >
                    <Portal>
                      <Menu.Positioner>
                        <Menu.Content>
                          <Menu.Item
                            v-for="action in shownRowActions"
                            :key="action.value"
                            :value="action.value"
                          >
                            {{ action.label }}
                          </Menu.Item>
                        </Menu.Content>
                      </Menu.Positioner>
                    </Portal>
                  </Menu.Root>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Pagination.Root
          v-if="pageCount > 1"
          class="justify-self-center @sm:justify-self-end"
          :count="rows.length"
          :page-size="pageSize"
          :page="currentPage"
          @page-change="(details: { page: number }) => (page = details.page)"
        >
          <Pagination.PrevTrigger v-bind="disabledAttrs">‹</Pagination.PrevTrigger>
          <Pagination.Context v-slot="{ pages }">
            <template v-for="(item, index) in pages" :key="index">
              <Pagination.Item v-if="item.type === 'page'" v-bind="{ ...item, ...disabledAttrs }">{{
                item.value
              }}</Pagination.Item>
              <Pagination.Ellipsis v-else :index="index">…</Pagination.Ellipsis>
            </template>
          </Pagination.Context>
          <Pagination.NextTrigger v-bind="disabledAttrs">›</Pagination.NextTrigger>
        </Pagination.Root>
      </div>
    </div>
  </section>
</template>
