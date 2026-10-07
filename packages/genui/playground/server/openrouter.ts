// The demo's `llm`: OpenRouter's OpenAI-compatible chat completions, streamed
// over SSE with plain `fetch`.
import type { LLM } from "../../src/server.ts";

const URL = "https://openrouter.ai/api/v1/chat/completions";

export function openRouterLLM(apiKey: string, model: string): LLM {
  return async function* (system, messages) {
    const response = await fetch(URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!response.ok || !response.body) {
      throw new Error(
        `OpenRouter request failed with ${response.status}: ${await response.text()}`,
      );
    }
    yield* contentDeltas(response.body);
  };
}

/** Yields `choices[0].delta.content` of each `data:` event until `[DONE]`. Comment lines are keep-alives. */
export async function* contentDeltas(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop()!;
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") return;
      const event = JSON.parse(data) as {
        error?: { message?: string };
        choices?: { delta?: { content?: string | null } }[];
      };
      if (event.error) throw new Error(`OpenRouter stream failed: ${event.error.message}`);
      const content = event.choices?.[0]?.delta?.content;
      if (content) yield content;
    }
  }
}
