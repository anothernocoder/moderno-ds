// Fixture mode: a canned System One server and a canned LLM, so the demo runs
// offline and in CI. Both read the turn the same way, so they always agree.
import type { Answer, ChatMessage, LLM, Question } from "../../src/server.ts";
import { confirmCard, salesCard } from "../examples.ts";

const WIDGETS = { sales: salesCard.response, order: confirmCard.response };
type Topic = keyof typeof WIDGETS | "text";

/** A message that matches a button of any earlier card is that button talking, so it gets a text reply. */
function topicOf(message: string, context: ChatMessage[]): Topic {
  if (/sales|ventas/i.test(message)) return "sales";
  const button = `@ToAssistant(${JSON.stringify(message)})`;
  const fromButton = context.some((turn) => turn.content.includes(button));
  if (/order|pedido/i.test(message) && !fromButton) return "order";
  return "text";
}

/** Answers the Router's questions: the Surface, and a Noul of 1 for each component the canned widget uses. */
export function fixtureAnswers(
  state: { message: string; context: ChatMessage[] },
  questions: Record<string, Question>,
): Record<string, Answer> {
  const topic = topicOf(state.message, state.context);
  const widget = topic === "text" ? "" : WIDGETS[topic];
  const answers: Record<string, Answer> = {};
  for (const key of Object.keys(questions)) {
    const name = key.slice(key.indexOf(":") + 1);
    answers[key] =
      key === "surface"
        ? {
            type: "choice",
            choice: topic === "text" ? "text" : "widget",
            probabilities: {},
            confidence: 1,
          }
        : { type: "noul", noul: new RegExp(`\\b${name}\\(`).test(widget) ? 1 : 0 };
  }
  return answers;
}

const LINE_DELAY_MS = 120;

/** Streams the canned reply line by line, the way a model would. */
export const fixtureLLM: LLM = async function* (_system, messages) {
  for (const line of cannedReply(messages).split(/(?<=\n)/)) {
    await new Promise((resolve) => setTimeout(resolve, LINE_DELAY_MS));
    yield line;
  }
};

function cannedReply(messages: ChatMessage[]): string {
  const message = messages.at(-1)!.content;
  const topic = topicOf(message, messages.slice(0, -1));
  if (topic !== "text") return `Here you go.\n\`\`\`openui-lang\n${WIDGETS[topic]}\n\`\`\``;
  if (/cancel/i.test(message)) return "Your order is cancelled.";
  if (/order/i.test(message)) return "Your order is placed. It arrives on Friday.";
  return "Hi! Ask me for “sales this month” or to “confirm my order”.";
}
