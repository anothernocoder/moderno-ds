import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createStreamingParser } from "@openuidev/lang-core";
import { discoverManifests } from "@moderno-ui/lint-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSubLibrary } from "../../src/library/sub-library.ts";
import { judge, type Answer } from "../../src/router/judge.ts";
import {
  generateUI,
  type ChatMessage,
  type GenUIChunk,
  type LLM,
} from "../../src/server/generate-ui.ts";

vi.mock("../../src/router/judge.ts", () => ({ judge: vi.fn() }));
vi.mock("../../src/library/sub-library.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/library/sub-library.ts")>();
  return { createSubLibrary: vi.fn(actual.createSubLibrary) };
});
vi.mock("@openuidev/lang-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@openuidev/lang-core")>();
  return { ...actual, createStreamingParser: vi.fn(actual.createStreamingParser) };
});

const mockedJudge = vi.mocked(judge);

const installed = discoverManifests(fileURLToPath(new URL("../..", import.meta.url)));
const manifest = installed.components.find((candidate) => candidate.framework === "react")!;
const contract = installed.contract!;
const judgeConfig = { baseUrl: "http://localhost:11434", model: "nimble" };

const VALID = 'root = Stack([save])\nsave = Button("primary", "md", ["Save"])\n';
const INVALID = 'root = Stack([save])\nsave = Button("huge")\n';

function routes(surface: string, nouls: Record<string, number> = {}): Record<string, Answer> {
  const answers: Record<string, Answer> = {
    surface: { type: "choice", choice: surface, probabilities: {}, confidence: 0.9 },
  };
  for (const [name, noul] of Object.entries(nouls))
    answers[`component:${name}`] = { type: "noul", noul };
  return answers;
}

/** An LLM that answers the nth call with the nth reply, chunk by chunk, and records each call. */
function scriptedLLM(...replies: string[][]) {
  const calls: { system: string; messages: ChatMessage[] }[] = [];
  const llm: LLM = async function* (system, messages) {
    const reply = replies[calls.length] ?? [];
    calls.push({ system, messages });
    yield* reply;
  };
  return { llm, calls };
}

async function collect(stream: AsyncIterable<GenUIChunk>): Promise<GenUIChunk[]> {
  const chunks: GenUIChunk[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return chunks;
}

function joined(chunks: GenUIChunk[], type: "text" | "program"): string {
  return chunks
    .filter((chunk) => chunk.type === type)
    .map((chunk) => (chunk as { text: string }).text)
    .join("");
}

beforeEach(() => {
  mockedJudge.mockReset();
  vi.mocked(createSubLibrary).mockClear();
  vi.mocked(createStreamingParser).mockClear();
});

describe("generateUI", () => {
  it("routes over the primitives and prompts with the routed sub-library only", async () => {
    mockedJudge.mockResolvedValue(routes("widget", { Button: 0.9, BarChart: 0.2 }));
    const { llm, calls } = scriptedLLM([`Here:\n\`\`\`openui-lang\n${VALID}\`\`\``]);
    const context: ChatMessage[] = [{ role: "assistant", content: "Hi!" }];

    await collect(
      generateUI({ message: "save it", context, judge: judgeConfig, llm, manifest, contract }),
    );

    const [config, state, questions] = mockedJudge.mock.calls[0]!;
    expect(config).toBe(judgeConfig);
    expect(state).toEqual({ message: "save it", context });
    expect(Object.keys(questions)).toContain("component:Card");
    expect(Object.keys(questions)).not.toContain("component:CardHeader");
    expect(Object.keys(questions)).not.toContain("component:Stack");

    expect(calls).toHaveLength(1);
    const { system, messages } = calls[0]!;
    expect(messages).toEqual([...context, { role: "user", content: "save it" }]);
    expect(system).toContain("Inline Mode");
    // Component signatures only; the Action section's lines are OpenUI's.
    const library = vi.mocked(createSubLibrary).mock.results.at(-1)!.value;
    const listed = system
      .split("\n")
      .filter((line) => /^[A-Z]\w*\(/.test(line))
      .map((line) => line.slice(0, line.indexOf("(")))
      .filter((name) => name in library.components);
    expect(listed).toEqual(["Button", "Stack", "Grid"]);
  });

  it("answers a text surface in plain text without a library or a program", async () => {
    mockedJudge.mockResolvedValue(routes("text"));
    const { llm, calls } = scriptedLLM(["Hello", " there!"]);

    const chunks = await collect(
      generateUI({ message: "hi", judge: judgeConfig, llm, manifest, contract }),
    );

    expect(chunks).toEqual([
      { type: "text", text: "Hello" },
      { type: "text", text: " there!" },
    ]);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.system).not.toContain("openui-lang");
    expect(createSubLibrary).not.toHaveBeenCalled();
    expect(createStreamingParser).not.toHaveBeenCalled();
  });

  it("retries an invalid program once with its errors, then falls back to text", async () => {
    mockedJudge.mockResolvedValue(routes("widget", { Button: 0.9 }));
    const invalid = [`\`\`\`openui-lang\n${INVALID}\`\`\``];
    const { llm, calls } = scriptedLLM(invalid, invalid, ["Sorry, here it is in words."]);

    const chunks = await collect(
      generateUI({ message: "save it", judge: judgeConfig, llm, manifest, contract }),
    );

    expect(calls).toHaveLength(3);
    const retry = calls[1]!;
    expect(retry.system).toBe(calls[0]!.system);
    expect(retry.messages.at(-2)).toEqual({ role: "assistant", content: invalid[0] });
    const fix = retry.messages.at(-1)!.content;
    expect(fix).toContain('"code": "type-mismatch"');
    expect(fix).toContain('"path": "/variant"');
    expect(calls[2]!.system).not.toContain("openui-lang");
    expect(calls[2]!.messages).toEqual([{ role: "user", content: "save it" }]);

    expect(chunks.map((chunk) => chunk.type)).toEqual([
      "program",
      "discard",
      "program",
      "discard",
      "text",
    ]);
    expect(chunks[1]).toMatchObject({
      type: "discard",
      errors: [expect.objectContaining({ code: "type-mismatch", path: "/variant" })],
    });
    expect(chunks.at(-1)).toEqual({ type: "text", text: "Sorry, here it is in words." });
  });

  it("stops after a retry that fixes the program", async () => {
    mockedJudge.mockResolvedValue(routes("widget", { Button: 0.9 }));
    const { llm, calls } = scriptedLLM(
      [`\`\`\`openui-lang\n${INVALID}\`\`\``],
      [`\`\`\`openui-lang\n${VALID}\`\`\``],
    );

    const chunks = await collect(
      generateUI({ message: "save it", judge: judgeConfig, llm, manifest, contract }),
    );

    expect(calls).toHaveLength(2);
    expect(chunks.map((chunk) => chunk.type)).toEqual(["program", "discard", "program"]);
    expect(joined(chunks.slice(2), "program")).toBe(VALID);
  });

  it("retries once when a chart's series has the wrong shape", async () => {
    mockedJudge.mockResolvedValue(routes("widget", { BarChart: 0.9 }));
    const chart = (series: string) =>
      `\`\`\`openui-lang\nroot = Stack([sales])\nsales = BarChart(["W1", "W2"], 240, [${series}], 480)\n\`\`\``;
    const { llm, calls } = scriptedLLM(
      [chart('{"name": "Sales", "data": [28, 31]}')],
      [chart('{"name": "Sales", "values": [28, 31]}')],
    );

    const chunks = await collect(
      generateUI({ message: "sales this month", judge: judgeConfig, llm, manifest, contract }),
    );

    expect(calls).toHaveLength(2);
    expect(calls[1]!.messages.at(-1)!.content).toContain('"path": "/series/0/values"');
    expect(chunks.map((chunk) => chunk.type)).toEqual(["program", "discard", "program"]);
  });

  it("yields text and program chunks while the LLM is still streaming", async () => {
    mockedJudge.mockResolvedValue(routes("widget", { Button: 0.9 }));
    const events: string[] = [];
    const replies = [
      "Here",
      " it is:\n``",
      "`openui-lang\nroot = Sta",
      'ck([save])\nsave = Button("primary", "md", ["Save"])\n``',
      "`\nDone.",
    ];
    const llm: LLM = async function* () {
      for (const [index, reply] of replies.entries()) {
        events.push(`llm ${index}`);
        yield reply;
      }
      events.push("llm done");
    };

    const chunks: GenUIChunk[] = [];
    for await (const chunk of generateUI({
      message: "save it",
      judge: judgeConfig,
      llm,
      manifest,
      contract,
    })) {
      events.push(chunk.type);
      chunks.push(chunk);
    }

    expect(events.indexOf("text")).toBeLessThan(events.indexOf("llm 1"));
    expect(events.indexOf("program")).toBeLessThan(events.indexOf("llm 3"));
    expect(joined(chunks, "text")).toBe("Here it is:\n\nDone.");
    expect(joined(chunks, "program")).toBe(VALID);
    expect(chunks.some((chunk) => chunk.type === "discard")).toBe(false);
  });
});

describe("src/server", () => {
  it("imports no React", () => {
    const dir = new URL("../../src/server/", import.meta.url);
    for (const file of readdirSync(dir)) {
      const source = readFileSync(new URL(file, dir), "utf8");
      expect(source, file).not.toMatch(
        /from "(react|react-dom|@openuidev\/react-lang|@moderno-ui\/react)(\/.*)?"/,
      );
    }
  });
});
