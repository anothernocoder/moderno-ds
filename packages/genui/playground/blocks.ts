/**
 * The Blocks this playground renders, imported from the registry the way
 * `moderno add` copies them into an app. `<GenUI blocks>` draws them and the
 * chat route offers the same names to `generateUI({ blocks })`.
 * `tailwind.ts` compiles the utilities these files use.
 */
import { FormLayout } from "../../../registry/blocks/form-layout/react/form-layout.tsx";
import { KpiCard } from "../../../registry/blocks/kpi-card/react/kpi-card.tsx";
import { OrderSummary } from "../../../registry/blocks/order-summary/react/order-summary.tsx";
import { StatRow } from "../../../registry/blocks/stat-row/react/stat-row.tsx";

export const blocks = { FormLayout, KpiCard, OrderSummary, StatRow };
