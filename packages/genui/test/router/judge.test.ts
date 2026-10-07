import { afterEach, describe, expect, it, vi } from "vitest";
import { judge, SystemOneError, type JudgeConfig } from "../../src/router/judge.ts";

const jev: JudgeConfig = {
  baseUrl: "https://api.typesafe.ai/",
  model: "jev-latest",
  apiKey: "test-key",
  backoffMs: 0,
};
const questions = {
  is_urgent: { type: "noul" as const, instructions: "Does this convey urgency?" },
};

function reply(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), { status });
}

function mockFetch(...responses: Response[]) {
  const fetch = vi.fn<typeof globalThis.fetch>();
  for (const response of responses) fetch.mockResolvedValueOnce(response);
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

afterEach(() => vi.unstubAllGlobals());

describe("judge", () => {
  it("posts the documented request and returns the answers map", async () => {
    const answers = { is_urgent: { type: "noul", noul: 0.95 } };
    const fetch = mockFetch(
      reply(200, { model: "jev-1.13.0", answers, usage: { input_tokens: 1, output_tokens: 1 } }),
    );

    await expect(judge(jev, "Help!", questions)).resolves.toEqual(answers);

    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://api.typesafe.ai/v1/systemone");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer test-key",
    });
    expect(JSON.parse(init?.body as string)).toEqual({
      state: "Help!",
      model: "jev-latest",
      questions,
    });
  });

  it("sends no Authorization header without an apiKey (Ollama)", async () => {
    const fetch = mockFetch(reply(200, { answers: {} }));
    await judge({ baseUrl: "http://localhost:11434", model: "nimble" }, "hi", questions);
    expect(fetch.mock.calls[0]![0]).toBe("http://localhost:11434/v1/systemone");
    expect(fetch.mock.calls[0]![1]?.headers).toEqual({ "Content-Type": "application/json" });
  });

  it.each([429, 529])("retries a %i with backoff", async (status) => {
    const fetch = mockFetch(reply(status), reply(status), reply(200, { answers: {} }));
    await expect(judge(jev, "hi", questions)).resolves.toEqual({});
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("doubles the delay on each retry", async () => {
    vi.useFakeTimers();
    try {
      const fetch = mockFetch(reply(429), reply(429), reply(200, { answers: {} }));
      const result = judge({ ...jev, backoffMs: 100 }, "hi", questions);
      await vi.advanceTimersByTimeAsync(99);
      expect(fetch).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1);
      expect(fetch).toHaveBeenCalledTimes(2);
      await vi.advanceTimersByTimeAsync(199);
      expect(fetch).toHaveBeenCalledTimes(2);
      await vi.advanceTimersByTimeAsync(1);
      await expect(result).resolves.toEqual({});
    } finally {
      vi.useRealTimers();
    }
  });

  it("throws once the retries are spent", async () => {
    const fetch = mockFetch(reply(529), reply(529));
    await expect(judge({ ...jev, retries: 1 }, "hi", questions)).rejects.toMatchObject({
      status: 529,
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each([401, 422])("throws a SystemOneError on %i without retrying", async (status) => {
    const fetch = mockFetch(reply(status, { detail: "nope" }));
    const error = await judge(jev, "hi", questions).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(SystemOneError);
    expect(error).toMatchObject({ status, body: '{"detail":"nope"}' });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
