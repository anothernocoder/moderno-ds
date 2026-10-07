// The dev server's chat turn: `generateUI` with the real `judge` and an `llm`,
// both picked from env, streamed to the page as AG-UI events (README.md).
import type { ComponentsManifest, ContractManifest } from "@moderno-ui/lint-core";
import contract from "@moderno-ui/css/moderno.agent.json" with { type: "json" };
import reactManifest from "@moderno-ui/react/moderno.agent.json" with { type: "json" };
import { generateUI, type ChatMessage, type JudgeConfig, type LLM } from "../../src/server.ts";
import { CLOSE_FENCE, DISCARD, OPEN_FENCE } from "../answer.ts";
import { fixtureLLM } from "./fixtures.ts";
import { openRouterLLM } from "./openrouter.ts";

type Env = Record<string, string | undefined>;

export const DEFAULT_OPENROUTER_MODEL = "anthropic/claude-sonnet-5.5";

/** The System One server env names, or `undefined` for the fixture one. Ollama wins over TypeSafe. */
export function judgeFromEnv(env: Env): JudgeConfig | undefined {
  if (env.GENUI_FIXTURES === "1") return undefined;
  if (env.SYSTEMONE_BASE_URL) {
    return { baseUrl: env.SYSTEMONE_BASE_URL, model: env.SYSTEMONE_MODEL ?? "nimble" };
  }
  if (env.JEV_API_KEY) {
    return { baseUrl: "https://api.typesafe.ai", model: "jev-latest", apiKey: env.JEV_API_KEY };
  }
  return undefined;
}

/** OpenRouter when its key is set, the canned LLM otherwise. */
export function llmFromEnv(env: Env): { llm: LLM; name: string } {
  if (env.GENUI_FIXTURES === "1" || !env.OPENROUTER_API_KEY)
    return { llm: fixtureLLM, name: "fixture" };
  const model = env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;
  return { llm: openRouterLLM(env.OPENROUTER_API_KEY, model), name: `OpenRouter ${model}` };
}

export type ChatEvent =
  | { type: "TEXT_MESSAGE_START"; messageId: string; role: "assistant" }
  | { type: "TEXT_MESSAGE_CONTENT"; messageId: string; delta: string }
  | { type: "TEXT_MESSAGE_END"; messageId: string }
  | { type: "RUN_ERROR"; message: string };

/** Answers the last message of `messages` as one assistant message: text, fenced programs, and discard marks. */
export async function* chatTurn(
  messages: ChatMessage[],
  judge: JudgeConfig,
  llm: LLM,
): AsyncGenerator<ChatEvent> {
  const messageId = crypto.randomUUID();
  const content = (delta: string): ChatEvent => ({
    type: "TEXT_MESSAGE_CONTENT",
    messageId,
    delta,
  });
  yield { type: "TEXT_MESSAGE_START", messageId, role: "assistant" };
  let inProgram = false;
  try {
    for await (const chunk of generateUI({
      message: messages.at(-1)!.content,
      context: messages.slice(0, -1),
      judge,
      llm,
      manifest: reactManifest as unknown as ComponentsManifest,
      contract: contract as unknown as ContractManifest,
    })) {
      if (chunk.type === "discard") {
        yield content(DISCARD);
        inProgram = false;
        continue;
      }
      const fence = chunk.type === "program" ? OPEN_FENCE : CLOSE_FENCE;
      const opensOrCloses = (chunk.type === "program") !== inProgram;
      inProgram = chunk.type === "program";
      yield content(opensOrCloses ? fence + chunk.text : chunk.text);
    }
    if (inProgram) yield content(CLOSE_FENCE);
    yield { type: "TEXT_MESSAGE_END", messageId };
  } catch (error) {
    yield { type: "RUN_ERROR", message: error instanceof Error ? error.message : String(error) };
  }
}
