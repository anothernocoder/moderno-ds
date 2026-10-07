/**
 * The assistant message as the dev server streams it: chat text with the
 * OpenUI Lang program in ```openui-lang fences, the way an inline-mode model
 * writes it. Both the server and the page read it.
 */

/** Marks a discarded attempt: everything before it was an invalid program, a new answer follows. */
export const DISCARD = "\u001e";

export const OPEN_FENCE = "```openui-lang\n";
export const CLOSE_FENCE = "\n```\n";

/** The message without the attempts the server discarded. */
export function lastAttempt(content: string): string {
  return content.slice(content.lastIndexOf(DISCARD) + 1);
}

export interface AnswerPart {
  type: "text" | "program";
  text: string;
}

/** Splits an answer into its text and its programs, in order. A program still streaming has no closing fence yet. */
export function splitAnswer(content: string): AnswerPart[] {
  return lastAttempt(content)
    .split(/```[^\n]*\n?/)
    .map((text, index): AnswerPart => ({ type: index % 2 ? "program" : "text", text }))
    .filter((part) => part.text.trim() !== "");
}
