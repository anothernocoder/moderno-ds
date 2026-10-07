import { beforeEach, describe, expect, it, vi } from "vitest";
import { judge, type Answer } from "../../src/router/judge.ts";
import { route, type RouteOptions } from "../../src/router/route.ts";

vi.mock("../../src/router/judge.ts", () => ({ judge: vi.fn() }));
const mockedJudge = vi.mocked(judge);

const library = {
  components: {
    Chart: { description: "Plots numbers over time." },
    Button: { description: "A clickable action." },
    Alert: { description: "A short status message." },
  },
};
const options: RouteOptions = { judge: { baseUrl: "http://localhost:11434", model: "nimble" } };

function answers(surface: string, confidence: number, nouls: Record<string, number> = {}) {
  const result: Record<string, Answer> = {
    surface: { type: "choice", choice: surface, probabilities: {}, confidence },
  };
  for (const [name, noul] of Object.entries(nouls))
    result[`component:${name}`] = { type: "noul", noul };
  return result;
}

beforeEach(() => mockedJudge.mockReset());

describe("route", () => {
  it("asks the surface Choice and one Noul per component in one judge call", async () => {
    mockedJudge.mockResolvedValue(answers("widget", 0.9, { Chart: 0.8 }));
    const context = [{ role: "user", content: "hi" }];

    await route("sales this month", context, library, options);

    expect(mockedJudge).toHaveBeenCalledTimes(1);
    const [config, state, questions] = mockedJudge.mock.calls[0]!;
    expect(config).toBe(options.judge);
    expect(state).toEqual({ message: "sales this month", context });
    expect(Object.keys(questions)).toEqual([
      "surface",
      "component:Chart",
      "component:Button",
      "component:Alert",
    ]);
    expect(questions.surface).toMatchObject({ type: "choice" });
    expect(Object.keys(questions.surface!.criteria!)).toEqual([
      "text",
      "widget",
      "screen",
      "dashboard",
    ]);
    expect(questions["component:Chart"]).toEqual({
      type: "noul",
      instructions: "Would a Chart — Plots numbers over time. — help answer `message`?",
    });
  });

  it("keeps only the components at or above the threshold", async () => {
    mockedJudge.mockResolvedValue(answers("widget", 0.9, { Chart: 0.8, Button: 0.5, Alert: 0.2 }));
    await expect(route("m", [], library, options)).resolves.toEqual({
      surface: "widget",
      components: ["Chart", "Button"],
    });
    await expect(route("m", [], library, { ...options, threshold: 0.7 })).resolves.toEqual({
      surface: "widget",
      components: ["Chart"],
    });
  });

  it("returns no components for a text surface", async () => {
    mockedJudge.mockResolvedValue(answers("text", 0.9, { Chart: 0.9 }));
    await expect(route("hola", [], library, options)).resolves.toEqual({
      surface: "text",
      components: [],
    });
  });

  it("falls back to the full library when the surface confidence is low", async () => {
    mockedJudge.mockResolvedValue(answers("text", 0.3, { Chart: 0.9 }));
    await expect(route("m", [], library, options)).resolves.toEqual({
      surface: "text",
      components: ["Chart", "Button", "Alert"],
    });
  });

  it("falls back to the full library when no component passes", async () => {
    mockedJudge.mockResolvedValue(
      answers("dashboard", 0.9, { Chart: 0.1, Button: 0.1, Alert: 0.1 }),
    );
    await expect(route("m", [], library, options)).resolves.toEqual({
      surface: "dashboard",
      components: ["Chart", "Button", "Alert"],
    });
  });
});
