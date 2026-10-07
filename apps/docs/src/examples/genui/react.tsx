import { GenUI } from "@moderno-ui/genui/react";

// The OpenUI Lang the LLM wrote. In an app it comes from generateUI.
const response = `root = Stack([alert])
alert = Alert("warning", [content])
content = AlertContent([title, description])
title = AlertTitle(["Payment failed"])
description = AlertDescription(["Your card was declined. Update it to keep your plan."])`;

export default function PaymentAlert() {
  return <GenUI response={response} />;
}
