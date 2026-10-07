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
card = Card("outline", [header, content])
header = CardHeader([title, description])
title = CardTitle(["Sales this month"])
description = CardDescription(["Revenue per week, in thousands of dollars."])
content = CardContent([chart])
chart = BarChart(["Week 1", "Week 2", "Week 3", "Week 4"], 220, [{name: "Revenue", values: [12, 18, 15, 22]}], 360, 0.3, 4)`,
};

export const confirmCard: Example = {
  title: "Confirm card with two buttons",
  response: `root = Stack([card])
card = Card("outline", [header, footer])
header = CardHeader([title, description])
title = CardTitle(["Confirm your order"])
description = CardDescription(["3 items, $84.00, delivered on Friday."])
footer = CardFooter([actions])
actions = Stack([cancel, confirm], "row", "2")
cancel = Button("outline", ["Cancel"], Action([@ToAssistant("Cancel my order")]))
confirm = Button("primary", ["Confirm order"], Action([@ToAssistant("Confirm my order")]))`,
};

export const paymentAlert: Example = {
  title: "Alert",
  response: `root = Stack([alert])
alert = Alert("warning", [content])
content = AlertContent([title, description])
title = AlertTitle(["Payment failed"])
description = AlertDescription(["Your card was declined. Update it to keep your plan."])`,
};

export const examples: Example[] = [salesCard, confirmCard, paymentAlert];

/** "ventas del mes": the StatRow Block, then a chart Card. */
export const salesBlocks: Example = {
  title: "Stat row and a chart card",
  response: `root = Stack([stats, card], "column", "4")
stats = StatRow("Mayo frente a abril.", "Ventas del mes", [{"id": "revenue", "label": "Ingresos", "value": "$67.000", "delta": "+12,5%", "tone": "positive"}, {"id": "orders", "label": "Pedidos", "value": "1.240", "delta": "+4,1%", "tone": "positive"}, {"id": "average", "label": "Ticket medio", "value": "$54", "delta": "−2,4%", "tone": "negative"}])
card = Card("outline", [header, content])
header = CardHeader([title, description])
title = CardTitle(["Ingresos por semana"])
description = CardDescription(["En miles de dólares."])
content = CardContent([chart])
chart = BarChart(["Semana 1", "Semana 2", "Semana 3", "Semana 4"], 220, [{name: "Ingresos", values: [12, 18, 15, 22]}], 360, 0.3, 4)`,
};

/** "confirma mi pedido": the OrderSummary Block, then its cancel and confirm actions. */
export const orderBlocks: Example = {
  title: "Order summary with confirm and cancel",
  response: `root = Stack([order, actions], "column", "4")
order = OrderSummary("Tu pedido", [{"id": "mug", "name": "Taza de gres", "price": "$28", "quantity": 2, "options": "Salvia · 350 ml"}, {"id": "bowl", "name": "Bol", "price": "$46", "quantity": 1}], "$102", [{"label": "Subtotal", "amount": "$102"}, {"label": "Envío", "amount": "Gratis"}])
actions = Stack([cancel, confirm], "row", "2")
cancel = Button("outline", ["Cancelar"], Action([@ToAssistant("Cancela mi pedido")]))
confirm = Button("primary", ["Confirmar pedido"], Action([@ToAssistant("Confirmo mi pedido")]))`,
};

/** "quiero jugar un chance": the FormLayout Block holding a field, a select and a number input. */
export const chanceForm: Example = {
  title: "Chance form",
  response: `root = Stack([form])
form = FormLayout([number, lottery, amount], "Elige tu número, la lotería y cuánto apuestas.", "Chance", "Cancelar", null, "Jugar")
number = Field("Número (4 cifras)", "", null, null, "numeric", 4)
lottery = Select("Lotería", ["Lotería de Bogotá", "Lotería de Medellín"], "Elige")
amount = NumberInput("Valor (COP)", 1000, 100000, 1000, 5000)`,
};
