import { GenUI } from "@moderno-ui/genui/react";

// The OpenUI Lang the LLM wrote for "sales this month".
const response = `root = Stack([card])
card = Card("outline", [header, content])
header = CardHeader([title, description])
title = CardTitle(["Sales this month"])
description = CardDescription(["Revenue per week, in thousands of dollars."])
content = CardContent([chart])
chart = BarChart(["Week 1", "Week 2", "Week 3", "Week 4"], 220, [{name: "Revenue", values: [12, 18, 15, 22]}], 360, 0.3, 4)`;

export default function SalesCard() {
  return <GenUI response={response} />;
}
