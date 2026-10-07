import { GenUI } from "@moderno-ui/genui/react";
// Installed with `npx @moderno-ui/cli add stat-row-react`.
import { StatRow } from "@/components/blocks/stat-row";

// The OpenUI Lang the LLM wrote for "sales this month", with your StatRow Block.
const response = `root = Stack([stats])
stats = StatRow("May against April.", "Sales this month", [{"id": "revenue", "label": "Revenue", "value": "$67,000", "delta": "+12.5%", "tone": "positive"}, {"id": "orders", "label": "Orders", "value": "1,240", "delta": "+4.1%", "tone": "positive"}])`;

export default function SalesStats() {
  return <GenUI blocks={{ StatRow }} response={response} />;
}
