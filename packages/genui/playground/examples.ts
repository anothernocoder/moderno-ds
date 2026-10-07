/**
 * Fixed OpenUI Lang responses, as an LLM would write them. Fixture mode
 * answers with them (server/fixtures.ts); the tests render them.
 */
export interface Example {
  title: string;
  response: string;
}

export const salesCard: Example = {
  title: "Sales card with a bar chart",
  response: `root = Stack([card])
card = Card("outline", "md", [header, content])
header = CardHeader([title, description])
title = CardTitle(["Sales this month"])
description = CardDescription(["Revenue per week, in thousands of dollars."])
content = CardContent([chart])
chart = BarChart(["Week 1", "Week 2", "Week 3", "Week 4"], 220, [{name: "Revenue", values: [12, 18, 15, 22]}], 360, 0.3, 4)`,
};

export const confirmCard: Example = {
  title: "Confirm card with two buttons",
  response: `root = Stack([card])
card = Card("outline", "md", [header, footer])
header = CardHeader([title, description])
title = CardTitle(["Confirm your order"])
description = CardDescription(["3 items, $84.00, delivered on Friday."])
footer = CardFooter([actions])
actions = Stack([cancel, confirm], "row", "2")
cancel = Button("outline", "md", ["Cancel"], Action([@ToAssistant("Cancel my order")]))
confirm = Button("primary", "md", ["Confirm order"], Action([@ToAssistant("Confirm my order")]))`,
};

export const paymentAlert: Example = {
  title: "Alert",
  response: `root = Stack([alert])
alert = Alert("warning", "md", [content])
content = AlertContent([title, description])
title = AlertTitle(["Payment failed"])
description = AlertDescription(["Your card was declined. Update it to keep your plan."])`,
};

export const examples: Example[] = [salesCard, confirmCard, paymentAlert];
