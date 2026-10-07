import { afterEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage, Question } from "../../src/server.ts";
import { DISCARD, splitAnswer } from "../../playground/answer.ts";
import {
  chatTurn,
  judgeFromEnv,
  llmFromEnv,
  type ChatEvent,
} from "../../playground/server/chat.ts";
import { fixtureAnswers } from "../../playground/server/fixtures.ts";
import { contentDeltas } from "../../playground/server/openrouter.ts";

/** Serves `fixtureAnswers` where `judge` posts, as the dev server does. */
function stubFixtureSystemOne() {
  vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
    const { state, questions } = JSON.parse(init.body as string) as {
      state: { message: string; context: ChatMessage[] };
      questions: Record<string, Question>;
    };
    return Response.json({ answers: fixtureAnswers(state, questions) });
  });
}

async function answer(messages: ChatMessage[]): Promise<string> {
  const events: ChatEvent[] = [];
  const { llm } = llmFromEnv({});
  for await (const event of chatTurn(
    messages,
    { baseUrl: "http://fixture", model: "fixture" },
    llm,
  ))
    events.push(event);
  expect(events.at(-1)?.type).toBe("TEXT_MESSAGE_END");
  return events.map((event) => (event.type === "TEXT_MESSAGE_CONTENT" ? event.delta : "")).join("");
}

afterEach(() => vi.unstubAllGlobals());

describe("the playground chat in fixture mode", () => {
  it("answers 'sales this month' with a bar chart card", async () => {
    stubFixtureSystemOne();
    const parts = splitAnswer(await answer([{ role: "user", content: "sales this month" }]));
    expect(parts.map((part) => part.type)).toEqual(["text", "program"]);
    expect(parts[1]!.text).toContain("BarChart(");
  }, 10_000);

  it("answers 'confirm my order' with a confirm card, and its button's message in text", async () => {
    stubFixtureSystemOne();
    const card = await answer([{ role: "user", content: "confirm my order" }]);
    expect(splitAnswer(card)[1]!.text).toContain('@ToAssistant("Confirm my order")');

    const reply = await answer([
      { role: "user", content: "confirm my order" },
      { role: "assistant", content: card },
      { role: "user", content: "Confirm my order" },
    ]);
    expect(splitAnswer(reply)).toEqual([{ type: "text", text: expect.stringContaining("placed") }]);
  }, 10_000);

  it("answers a button on an earlier confirm card in text, not with the card again", async () => {
    stubFixtureSystemOne();
    const card = await answer([{ role: "user", content: "confirm my order" }]);
    const reply = await answer([
      { role: "user", content: "confirm my order" },
      { role: "assistant", content: card },
      { role: "user", content: "hello" },
      { role: "assistant", content: "Hi!" },
      { role: "user", content: "Confirm my order" },
    ]);
    expect(splitAnswer(reply)).toEqual([{ type: "text", text: expect.stringContaining("placed") }]);
  }, 10_000);
});

describe("splitAnswer", () => {
  it("keeps only the attempt after the last discard", () => {
    const content = "Here.\n```openui-lang\nbad\n```\n" + DISCARD + "Again.\n```openui-lang\ngood";
    expect(splitAnswer(content)).toEqual([
      { type: "text", text: "Again.\n" },
      { type: "program", text: "good" },
    ]);
  });
});

describe("env", () => {
  it("prefers a local System One server over TypeSafe", () => {
    expect(
      judgeFromEnv({ JEV_API_KEY: "k", SYSTEMONE_BASE_URL: "http://localhost:11434" }),
    ).toEqual({
      baseUrl: "http://localhost:11434",
      model: "nimble",
    });
    expect(judgeFromEnv({ JEV_API_KEY: "k" })).toEqual({
      baseUrl: "https://api.typesafe.ai",
      model: "jev-latest",
      apiKey: "k",
    });
    expect(judgeFromEnv({ JEV_API_KEY: "k", GENUI_FIXTURES: "1" })).toBeUndefined();
  });
});

describe("contentDeltas", () => {
  it("yields each delta's content across split chunks, skipping comments, until [DONE]", async () => {
    const sse = [
      ": OPENROUTER PROCESSING\n\n",
      'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\ndata: {"choices":[{"de',
      'lta":{"content":"lo"}}]}\n\ndata: {"choices":[{"delta":{}}]}\n\n',
      "data: [DONE]\n\n",
    ];
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of sse) controller.enqueue(new TextEncoder().encode(chunk));
        controller.close();
      },
    });
    const deltas: string[] = [];
    for await (const delta of contentDeltas(body)) deltas.push(delta);
    expect(deltas).toEqual(["Hel", "lo"]);
  });
});
