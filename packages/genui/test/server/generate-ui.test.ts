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

const VALID = 'root = Stack([save])\nsave = Button("primary", ["Save"])\n';
const INVALID = 'root = Stack([save])\nsave = Button("huge")\n';

/**
 * Both router calls' answers in one map: the Surface, the kind (`confirm` by
 * default), and the Nouls, by component name or by key (`block:KpiCard`).
 */
function routes(
  surface: string,
  nouls: Record<string, number> = {},
  kind = "confirm",
): Record<string, Answer> {
  const answers: Record<string, Answer> = {
    surface: { type: "choice", choice: surface, probabilities: {}, confidence: 0.9 },
    kind: { type: "choice", choice: kind, probabilities: {}, confidence: 0.9 },
  };
  for (const [name, noul] of Object.entries(nouls))
    answers[name.includes(":") ? name : `component:${name}`] = { type: "noul", noul };
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

    const [config, state, questions] = mockedJudge.mock.calls[1]!;
    expect(config).toBe(judgeConfig);
    expect(state).toEqual({ context, message: "save it" });
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
    // Toggle: Button's whenNotToUse says "use Toggle" for on/off state.
    expect(listed).toEqual(["Button", "ToggleIndicator", "Toggle", "Stack", "Grid"]);
  });

  it("adds the components a pick's whenNotToUse points to", async () => {
    mockedJudge.mockResolvedValue(routes("widget", { Field: 0.9, Button: 0.9 }, "form"));
    const { llm } = scriptedLLM([`\`\`\`openui-lang\n${VALID}\`\`\``]);

    await collect(generateUI({ message: "a form", judge: judgeConfig, llm, manifest, contract }));

    // Field: "Not for picking from a known list of options: use Select", and Checkbox or Switch.
    const names = vi.mocked(createSubLibrary).mock.calls.at(-1)![1];
    expect(names).toEqual(expect.arrayContaining(["Field", "Button", "Select", "Checkbox"]));
  });

  it("gives the router the earlier programs as a note, and the LLM the full chat", async () => {
    mockedJudge.mockResolvedValue(routes("text"));
    const { llm, calls } = scriptedLLM(["Hi!"]);
    const context: ChatMessage[] = [
      { role: "user", content: "sales" },
      { role: "assistant", content: `Here:\n\`\`\`openui-lang\n${VALID}\`\`\`\nDone.` },
    ];

    await collect(
      generateUI({ message: "hola", context, judge: judgeConfig, llm, manifest, contract }),
    );

    expect(mockedJudge.mock.calls[0]![1]).toEqual({
      context: [context[0], { role: "assistant", content: "Here:\n(UI shown)\nDone." }],
      message: "hola",
    });
    expect(calls[0]!.messages).toEqual([...context, { role: "user", content: "hola" }]);
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

  it("lints the QA chance card, retries with its usability errors, and keeps the fixed card", async () => {
    // No Noul passes, so the LLM gets the whole library.
    mockedJudge.mockResolvedValue(routes("widget"));
    // What a model wrote for "a chance bet card" in the QA of PR #319.
    const qaCard = [
      "root = Stack([card])",
      'card = Card("outline", [header, content, footer])',
      'header = CardHeader([CardTitle(["🍀 Chance"])])',
      "content = CardContent([number, lottery, amount])",
      'number = NumberInput("Número (4 cifras)", "lg")',
      'lottery = Select("Lotería", ["Lotería de Bogotá", "Lotería de Medellín"], "Elige", "lg")',
      'amount = NumberInput("Valor (COP)", 1000, 100000, 1000, 5000, "md")',
      "footer = CardFooter([play])",
      'play = Button("primary", "lg", ["Jugar"], Action([@ToAssistant("Quiero jugar mi chance con el número, la lotería y el valor que seleccioné")]))',
    ].join("\n");
    const fixedCard = [
      "root = Stack([card])",
      'card = Card("outline", [header, content, footer])',
      'header = CardHeader([CardTitle(["Chance"])])',
      "content = CardContent([number, lottery, amount])",
      'number = Field("Número", "4827", null, null, "numeric", 4)',
      'lottery = Select("Lotería", ["Lotería de Bogotá", "Lotería de Medellín"], "Elige")',
      'amount = Field("Valor (COP)", "5000", null, null, "numeric")',
      'footer = CardFooter([Button("primary", ["Jugar"])])',
    ].join("\n");
    const { llm, calls } = scriptedLLM(
      [`\`\`\`openui-lang\n${qaCard}\n\`\`\``],
      [`\`\`\`openui-lang\n${fixedCard}\n\`\`\``],
    );

    const chunks = await collect(
      generateUI({
        message: "crea un card de chance",
        judge: judgeConfig,
        llm,
        manifest,
        contract,
      }),
    );

    expect(calls[0]!.system).toContain("- Every control renders at one size");
    expect(calls).toHaveLength(2);
    const discard = chunks.find((chunk) => chunk.type === "discard")!;
    const errors = (discard as Extract<GenUIChunk, { type: "discard" }>).errors;
    // The stepper for a 4-digit code and the action that drops the values: the lint.
    expect(errors).toContainEqual(
      expect.objectContaining({ code: "usability", statementId: "number" }),
    );
    expect(errors).toContainEqual(
      expect.objectContaining({
        code: "usability",
        statementId: "play",
        message: expect.stringContaining("drops the values"),
      }),
    );
    // The mixed sizes: no control takes a size, so each one is rejected.
    for (const sized of ["number", "lottery", "amount", "play"]) {
      expect(errors, sized).toContainEqual(
        expect.objectContaining({
          code: expect.stringMatching(/excess-args|type-mismatch/),
          statementId: sized,
        }),
      );
    }
    expect(calls[1]!.messages.at(-1)!.content).toContain("drops the values");
    expect(chunks.map((chunk) => chunk.type)).toEqual(["program", "discard", "program"]);
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
      'ck([save])\nsave = Button("primary", ["Save"])\n``',
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

describe("generateUI with Blocks", () => {
  const blocks = ["KpiCard", "StatRow", "OrderSummary", "FormLayout", "LoginForm"];
  const fenced = (...lines: string[]) => [`\`\`\`openui-lang\n${lines.join("\n")}\n\`\`\``];
  const pickedNames = () => vi.mocked(createSubLibrary).mock.calls.at(-1)![1];
  const blockQuestions = () =>
    Object.keys(mockedJudge.mock.calls.at(-1)![2]).filter((key) => key.startsWith("block:"));

  it("offers no Block unless the host lists it", async () => {
    mockedJudge.mockResolvedValue(routes("widget", { Button: 0.9, "block:StatRow": 0.9 }));
    const { llm } = scriptedLLM(fenced(VALID));

    await collect(generateUI({ message: "m", judge: judgeConfig, llm, manifest, contract }));
    expect(blockQuestions()).toEqual([]);
    expect(pickedNames()).not.toContain("StatRow");

    await collect(
      generateUI({
        message: "m",
        judge: judgeConfig,
        llm,
        manifest,
        contract,
        blocks: ["KpiCard"],
      }),
    );
    expect(blockQuestions()).toEqual(["block:KpiCard"]);
    expect(pickedNames()).not.toContain("StatRow");
    expect(pickedNames()).not.toContain("KpiCard");
  });

  it('routes "ventas del mes" to StatRow and KpiCard plus a chart, with one example each', async () => {
    mockedJudge.mockResolvedValue(
      routes(
        "dashboard",
        {
          BarChart: 0.9,
          LineChart: 0.3,
          "block:StatRow": 0.9,
          "block:KpiCard": 0.8,
          "block:OrderSummary": 0.1,
          "block:FormLayout": 0.05,
          "block:LoginForm": 0.02,
        },
        "chart",
      ),
    );
    const { llm, calls } = scriptedLLM(fenced(VALID));

    await collect(
      generateUI({
        message: "ventas del mes",
        judge: judgeConfig,
        llm,
        manifest,
        contract,
        blocks,
      }),
    );

    expect(blockQuestions().sort()).toEqual(blocks.map((name) => `block:${name}`).sort());
    expect(mockedJudge.mock.calls[1]![2]["block:StatRow"]).toMatchObject({
      type: "noul",
      instructions: expect.stringContaining("ready-made StatRow block"),
    });
    const names = pickedNames();
    expect(names).toEqual(expect.arrayContaining(["BarChart", "StatRow", "KpiCard", "Card"]));
    for (const name of ["OrderSummary", "FormLayout", "LoginForm", "LineChart"])
      expect(names).not.toContain(name);

    const { system } = calls[0]!;
    expect(system).toContain(
      "- Use a Block when one fits. Compose primitives only for what no Block covers.",
    );
    expect(system).not.toContain("For a form, use");
    expect(system).toMatch(/^statRow = StatRow\(/m);
    expect(system).toMatch(/^kpiCard = KpiCard\(/m);
  });

  it("routes the chance card request to a form Block", async () => {
    mockedJudge.mockResolvedValue(
      routes(
        "widget",
        { Field: 0.9, Select: 0.9, "block:FormLayout": 0.9, "block:StatRow": 0.1 },
        "form",
      ),
    );
    const { llm, calls } = scriptedLLM(fenced(VALID));

    await collect(
      generateUI({
        message: "crea un card de apuesta de chance: número de 4 cifras, lotería y valor",
        judge: judgeConfig,
        llm,
        manifest,
        contract,
        blocks,
      }),
    );

    expect(pickedNames()).toEqual(expect.arrayContaining(["FormLayout", "Field", "Select"]));
    expect(pickedNames()).not.toContain("StatRow");
    expect(calls[0]!.system).toContain(
      "- For a form, use FormLayout rather than composing one by hand: FormLayout holds its Field, Select, NumberInput controls as children.",
    );
  });

  it("gives a form Block its fields when the router picks only the Block", async () => {
    mockedJudge.mockResolvedValue(routes("widget", { "block:FormLayout": 0.9 }, "form"));
    const { llm, calls } = scriptedLLM(fenced(VALID));

    await collect(
      generateUI({ message: "chance", judge: judgeConfig, llm, manifest, contract, blocks }),
    );

    expect(pickedNames()).toEqual(
      expect.arrayContaining(["FormLayout", "Field", "Select", "NumberInput"]),
    );
    const formLayout = calls[0]!.system.split("\n").find((line) => line.startsWith("FormLayout("));
    expect(formLayout).toMatch(/^FormLayout\(children: \(string \| [^)]*\bField\b[^)]*\)\[\]/);
    expect(formLayout).toMatch(/\bSelect\b/);
    expect(formLayout).toMatch(/\bNumberInput\b/);
  });

  it("adds no form fields for a Block that holds none", async () => {
    mockedJudge.mockResolvedValue(routes("widget", { "block:KpiCard": 0.9 }, "chart"));
    const { llm } = scriptedLLM(fenced(VALID));

    await collect(
      generateUI({ message: "ventas", judge: judgeConfig, llm, manifest, contract, blocks }),
    );

    for (const name of ["Field", "Select", "NumberInput"])
      expect(pickedNames()).not.toContain(name);
  });

  it("retries a KpiCard that omits its metric, with the parser's error", async () => {
    mockedJudge.mockResolvedValue(routes("widget", { "block:KpiCard": 0.9 }, "chart"));
    const kpi = (args: string) => fenced("root = Stack([sales])", `sales = KpiCard(${args})`);
    const { llm, calls } = scriptedLLM(
      kpi('"Ventas"'),
      kpi('"Ventas", {"value": "$48.294", "delta": "+12%", "tone": "positive"}, "Este mes"'),
    );

    const chunks = await collect(
      generateUI({ message: "ventas", judge: judgeConfig, llm, manifest, contract, blocks }),
    );

    expect(calls).toHaveLength(2);
    expect(chunks.map((chunk) => chunk.type)).toEqual(["program", "discard", "program"]);
    expect((chunks[1] as Extract<GenUIChunk, { type: "discard" }>).errors).toContainEqual(
      expect.objectContaining({ code: "missing-required", component: "KpiCard", path: "/metric" }),
    );
    expect(calls[1]!.messages.at(-1)!.content).toContain('"path": "/metric"');
  });

  it("lints a form Block: a second primary Button is retried", async () => {
    mockedJudge.mockResolvedValue(
      routes("widget", { Field: 0.9, Button: 0.9, "block:FormLayout": 0.9 }, "form"),
    );
    const form = (button: string) =>
      fenced(
        "root = Stack([form])",
        `form = FormLayout([number, ${button}], "Elige tu número", "Chance", null, null, "Jugar")`,
        'number = Field("Número", "", null, null, "numeric", 4)',
        'play = Button("primary", ["Jugar"])',
        'back = Button("outline", ["Volver"])',
      );
    const { llm, calls } = scriptedLLM(form("play"), form("back"));

    const chunks = await collect(
      generateUI({ message: "chance", judge: judgeConfig, llm, manifest, contract, blocks }),
    );

    expect(calls).toHaveLength(2);
    expect((chunks[1] as Extract<GenUIChunk, { type: "discard" }>).errors).toEqual([
      expect.objectContaining({
        code: "usability",
        message: expect.stringContaining("FormLayout sends the form itself"),
      }),
    ]);
    expect(chunks.map((chunk) => chunk.type)).toEqual(["program", "discard", "program"]);
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
