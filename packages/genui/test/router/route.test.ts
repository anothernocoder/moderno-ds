import { fileURLToPath } from "node:url";
import { discoverManifests, type AgentComponent } from "@moderno-ui/lint-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { judge, type Answer, type Question } from "../../src/router/judge.ts";
import { route, type RouteOptions } from "../../src/router/route.ts";
import nimble from "./fixtures/nimble.json" with { type: "json" };

vi.mock("../../src/router/judge.ts", () => ({ judge: vi.fn() }));
const mockedJudge = vi.mocked(judge);

const reactComponents = discoverManifests(
  fileURLToPath(new URL("../..", import.meta.url)),
).components.find((manifest) => manifest.framework === "react")!.components;

function component(name: string, intent = ""): AgentComponent {
  return { name, scope: name.toLowerCase(), guidance: { intent } } as AgentComponent;
}

const library = [
  component("BarChart", "Magnitude compared across categories."),
  component("Button", "A single click action."),
  component("Alert", "An inline status message."),
];
const names = library.map((c) => c.name);
const options: RouteOptions = { judge: { baseUrl: "http://localhost:11434", model: "nimble" } };

function choice(choice: string, confidence: number, probabilities: Record<string, number> = {}) {
  return { type: "choice", choice, probabilities, confidence } as const;
}

/** The first call's answers: the Surface and the kind. */
function firstAnswers(surface: Answer, kind = "chart"): Record<string, Answer> {
  return { surface, kind: choice(kind, 0.9) };
}

/** The second call's answers: one Noul per name. */
function nouls(values: Record<string, number>): Record<string, Answer> {
  return Object.fromEntries(
    Object.entries(values).map(([name, noul]) => [`component:${name}`, { type: "noul", noul }]),
  );
}

function askedQuestions(): Record<string, Question>[] {
  return mockedJudge.mock.calls.map((call) => call[2]);
}

beforeEach(() => mockedJudge.mockReset());

describe("route", () => {
  it("asks the Surface and the kind, then one short Noul per shortlisted component", async () => {
    mockedJudge
      .mockResolvedValueOnce(firstAnswers(choice("widget", 0.9)))
      .mockResolvedValueOnce(nouls({ BarChart: 0.8 }));
    const context = [{ role: "user", content: "hi" }];

    await route("sales this month", context, library, options);

    expect(mockedJudge).toHaveBeenCalledTimes(2);
    for (const [config, state] of mockedJudge.mock.calls) {
      expect(config).toBe(options.judge);
      expect(state).toEqual({ context, message: "sales this month" });
    }
    const [first, second] = askedQuestions();
    expect(Object.keys(first!)).toEqual(["surface", "kind"]);
    expect(Object.keys(first!.surface!.criteria!)).toEqual([
      "text",
      "widget",
      "screen",
      "dashboard",
    ]);
    expect(first!.kind).toMatchObject({ type: "choice" });
    expect(Object.keys(second!)).toContain("component:BarChart");
    expect(second!["component:BarChart"]).toEqual({
      type: "noul",
      instructions: "Does a BarChart help answer `message`?",
    });
  });

  it("keeps only the components at or above the threshold", async () => {
    const answers = nouls({ BarChart: 0.8, Button: 0.5, Alert: 0.2 });
    for (let turn = 0; turn < 2; turn++)
      mockedJudge
        .mockResolvedValueOnce(firstAnswers(choice("widget", 0.9)))
        .mockResolvedValueOnce(answers);
    await expect(route("m", [], library, options)).resolves.toEqual({
      surface: "widget",
      components: ["BarChart", "Button"],
      blocks: [],
    });
    await expect(route("m", [], library, { ...options, threshold: 0.7 })).resolves.toEqual({
      surface: "widget",
      components: ["BarChart"],
      blocks: [],
    });
  });

  it("prunes on the Nouls even when the Surface confidence is low", async () => {
    mockedJudge
      .mockResolvedValueOnce(
        firstAnswers(choice("widget", 0.25, { widget: 0.49, dashboard: 0.38 })),
      )
      .mockResolvedValueOnce(nouls({ BarChart: 0.93, Button: 0.1, Alert: 0.2 }));
    await expect(route("ventas del mes", [], library, options)).resolves.toEqual({
      surface: "widget",
      components: ["BarChart"],
      blocks: [],
    });
  });

  it("treats a doubtful text Surface as its likeliest UI one", async () => {
    mockedJudge
      .mockResolvedValueOnce(
        firstAnswers(
          choice("text", 0.3, { text: 0.6, widget: 0.1, screen: 0.05, dashboard: 0.25 }),
        ),
      )
      .mockResolvedValueOnce(nouls({ BarChart: 0.9 }));
    await expect(route("m", [], library, options)).resolves.toEqual({
      surface: "dashboard",
      components: ["BarChart"],
      blocks: [],
    });
  });

  it("returns no components for a confident text Surface, after one call", async () => {
    mockedJudge.mockResolvedValueOnce(firstAnswers(choice("text", 0.9)));
    await expect(route("hola", [], library, options)).resolves.toEqual({
      surface: "text",
      components: [],
      blocks: [],
    });
    expect(mockedJudge).toHaveBeenCalledTimes(1);
  });

  it("falls back to the full library when no component passes", async () => {
    mockedJudge
      .mockResolvedValueOnce(firstAnswers(choice("dashboard", 0.2)))
      .mockResolvedValueOnce(nouls({ BarChart: 0.1, Button: 0.1, Alert: 0.1 }));
    await expect(route("m", [], library, options)).resolves.toEqual({
      surface: "dashboard",
      components: names,
      blocks: [],
    });
  });

  it("asks at most ten questions whatever the library size", async () => {
    const big = Array.from({ length: 200 }, (_, i) => component(`Chart${i}`, "A chart."));
    mockedJudge
      .mockResolvedValueOnce(firstAnswers(choice("widget", 0.9)))
      .mockResolvedValueOnce(nouls({ Chart0: 0.9 }));
    await route("m", [], big, options);
    const total = askedQuestions().reduce(
      (sum, questions) => sum + Object.keys(questions).length,
      0,
    );
    expect(total).toBeLessThanOrEqual(10);
  });
});

describe("route with Blocks", () => {
  const blocks = [
    { name: "StatRow", guidance: { intent: "A row of headline numbers." } },
    { name: "OrderSummary", guidance: { intent: "A read-only order summary." } },
  ] as RouteOptions["blocks"];

  it("asks one Noul per Block the host renders, worded so a fitting Block wins", async () => {
    mockedJudge
      .mockResolvedValueOnce(firstAnswers(choice("dashboard", 0.9)))
      .mockResolvedValueOnce({
        ...nouls({ BarChart: 0.9 }),
        "block:StatRow": { type: "noul", noul: 0.9 },
      });

    await expect(route("ventas del mes", [], library, { ...options, blocks })).resolves.toEqual({
      surface: "dashboard",
      components: ["BarChart"],
      blocks: ["StatRow"],
    });
    const questions = askedQuestions()[1]!;
    expect(Object.keys(questions)).toEqual(
      expect.arrayContaining(["block:StatRow", "block:OrderSummary"]),
    );
    expect(questions["block:StatRow"]).toEqual({
      type: "noul",
      instructions:
        "Does the ready-made StatRow block show what `message` asks for, or a part of it? A row of headline numbers.",
      criteria: {
        true: "It fits: a ready-made block beats building the same thing from smaller components.",
      },
    });
  });

  it("keeps a picked Block without falling back to every primitive", async () => {
    mockedJudge
      .mockResolvedValueOnce(firstAnswers(choice("widget", 0.9)))
      .mockResolvedValueOnce({ "block:OrderSummary": { type: "noul", noul: 0.8 } });

    await expect(route("mi pedido", [], library, { ...options, blocks })).resolves.toEqual({
      surface: "widget",
      components: [],
      blocks: ["OrderSummary"],
    });
  });
});

describe("route's shortlist on the react library", () => {
  it.each([
    ["chart", ["BarChart", "BarList", "LineChart", "AreaChart", "SparkChart", "Card"]],
    ["confirm", ["Card", "Button", "Dialog"]],
    ["form", ["Field", "Select", "DatePicker", "Checkbox", "Button"]],
  ])("puts the %s components in the top 8", async (kind, relevant) => {
    mockedJudge
      .mockResolvedValueOnce(firstAnswers(choice("widget", 0.9), kind))
      .mockResolvedValueOnce({});
    await route("m", [], reactComponents, options);
    const shortlist = Object.keys(askedQuestions()[1]!).map((key) =>
      key.slice("component:".length),
    );
    expect(shortlist).toHaveLength(8);
    expect(shortlist).toEqual(expect.arrayContaining(relevant));
  });
});

describe("route on recorded Nimble answers", () => {
  const cases = Object.values(nimble);

  it.each([
    ["ventas del mes", "dashboard", ["BarChart", "BarList", "LineChart", "AreaChart"]],
    ["confirma mi pedido", "screen", ["Button"]],
    ["quiero registrarme: nombre, email y fecha de nacimiento", "widget", ["Field", "DatePicker"]],
  ])("prunes %j", async (message, surface, expected) => {
    const recorded = cases.find((c) => c.message === message)!;
    for (const answers of recorded.answers)
      mockedJudge.mockResolvedValueOnce(answers as Record<string, Answer>);
    const result = await route(message, recorded.context, reactComponents, options);
    expect(result.surface).toBe(surface);
    expect(result.components).toEqual(expect.arrayContaining(expected));
    expect(result.components.length).toBeLessThanOrEqual(8);
  });

  it("answers 'hola' after a sales turn in text", async () => {
    const recorded = cases.find((c) => c.message === "hola")!;
    mockedJudge.mockResolvedValueOnce(recorded.answers[0] as Record<string, Answer>);
    await expect(route("hola", recorded.context, reactComponents, options)).resolves.toEqual({
      surface: "text",
      components: [],
      blocks: [],
    });
  });
});
