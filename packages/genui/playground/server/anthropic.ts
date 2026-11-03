// The demo's `llm`: Claude through the Anthropic SDK, streamed.
import Anthropic from "@anthropic-ai/sdk";
import type { LLM } from "../../src/server.ts";

export function anthropicLLM(apiKey: string, model: string): LLM {
  const client = new Anthropic({ apiKey });
  return async function* (system, messages) {
    const stream = client.beta.messages.stream({
      model,
      max_tokens: 16000,
      output_config: { effort: "medium" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system,
      messages,
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
      if (event.type === "message_delta" && event.delta.stop_reason === "refusal") {
        throw new Error("Claude declined this request.");
      }
    }
  };
}
