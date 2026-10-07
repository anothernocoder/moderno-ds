// `pnpm --filter @moderno-ui/genui dev`: the page, plus the chat route it
// talks to. Env comes from the repo-root `.env.local` (README.md).
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, loadEnv, type Plugin } from "vite";
import type { ChatMessage, Question } from "../src/server.ts";
import { chatTurn, judgeFromEnv, llmFromEnv } from "./server/chat.ts";
import { fixtureAnswers } from "./server/fixtures.ts";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

async function readJSON<T>(request: IncomingMessage): Promise<T> {
  let body = "";
  for await (const chunk of request) body += chunk;
  return JSON.parse(body) as T;
}

function genuiChat(env: Record<string, string>): Plugin {
  const judge = judgeFromEnv(env);
  const { llm, name } = llmFromEnv(env);
  return {
    name: "genui-chat",
    configureServer(server) {
      // The fixture System One server: `judge` asks it over HTTP like a real one.
      server.middlewares.use("/v1/systemone", async (request, response) => {
        const { state, questions } = await readJSON<{
          state: { message: string; context: ChatMessage[] };
          questions: Record<string, Question>;
        }>(request);
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ answers: fixtureAnswers(state, questions) }));
      });
      server.middlewares.use("/api/chat", async (request, response: ServerResponse) => {
        const { messages } = await readJSON<{ messages: ChatMessage[] }>(request);
        const fixtureJudge = { baseUrl: `http://${request.headers.host}`, model: "fixture" };
        response.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        });
        for await (const event of chatTurn(messages, judge ?? fixtureJudge, llm)) {
          response.write(`data: ${JSON.stringify(event)}\n\n`);
        }
        response.end();
      });
      server.httpServer?.once("listening", () => {
        const router = judge ? `${judge.model} at ${judge.baseUrl}` : "fixture";
        server.config.logger.info(`  genui chat: router ${router}, LLM ${name}`);
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [genuiChat(loadEnv(mode, repoRoot, ""))],
}));
