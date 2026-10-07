import { GenUI, type ActionEvent } from "@moderno-ui/genui/react";

// Each button sends a message back to the assistant with @ToAssistant.
const response = `root = Stack([card])
card = Card("outline", "md", [header, footer])
header = CardHeader([title, description])
title = CardTitle(["Confirm your order"])
description = CardDescription(["3 items, $84.00, delivered on Friday."])
footer = CardFooter([actions])
actions = Stack([cancel, confirm], "row", "2")
cancel = Button("outline", "md", ["Cancel"], Action([@ToAssistant("Cancel my order")]))
confirm = Button("primary", "md", ["Confirm order"], Action([@ToAssistant("Confirm my order")]))`;

export default function ConfirmCard({ send }: { send?: (message: string) => void }) {
  // Send the button's message as the user's next turn.
  const onAction = (event: ActionEvent) => {
    if (event.type === "continue_conversation") send?.(event.humanFriendlyMessage);
  };
  return <GenUI response={response} onAction={onAction} />;
}
