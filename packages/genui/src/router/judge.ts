// One HTTP client for `POST /v1/systemone` (https://docs.typesafe.ai/api.md).
// TypeSafe (Jev) and Ollama >= 0.35 (Nimble) expose the same endpoint, so the
// config picks the server (ADR-0011).

export interface JudgeConfig {
  /** `https://api.typesafe.ai` for Jev, `http://localhost:11434` for Nimble. */
  baseUrl: string;
  /** `jev-latest` or `nimble`. */
  model: string;
  /** Sent as `Authorization: Bearer`. TypeSafe needs it (`JEV_API_KEY`); Ollama does not. */
  apiKey?: string;
  /** Retries after a 429 or 529. Default 3. */
  retries?: number;
  /** First backoff delay; it doubles on each retry. Default 500 ms. */
  backoffMs?: number;
}

/** A question's text: a string, or structured data that names fields in backticks. */
export type Instructions = string | Record<string, unknown> | unknown[];

export type Question =
  | {
      type: "noul";
      instructions: Instructions;
      criteria?: { true?: Instructions; false?: Instructions };
    }
  | { type: "choice"; instructions: Instructions; criteria: Record<string, Instructions | null> }
  | { type: "score"; instructions: Instructions; criteria: Instructions[] };

export type Answer =
  | { type: "noul"; noul: number }
  | { type: "choice"; choice: string; probabilities: Record<string, number>; confidence: number }
  | {
      type: "score";
      score: number;
      legend: Record<string, string>;
      probabilities: Record<string, number>;
      confidence: number;
    };

/** A response the server refused: 401 (bad key), 422 (bad request), or a retry budget spent. */
export class SystemOneError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`System One request failed with ${status}: ${body}`);
    this.name = "SystemOneError";
  }
}

const RETRYABLE_STATUSES = new Set([429, 529]);

/** Asks every question about `state` in one request and returns the answers under the same keys. */
export async function judge(
  config: JudgeConfig,
  state: unknown,
  questions: Record<string, Question>,
): Promise<Record<string, Answer>> {
  const { retries = 3, backoffMs = 500 } = config;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
  const request = {
    method: "POST",
    headers,
    body: JSON.stringify({ state, model: config.model, questions }),
  };
  const url = `${config.baseUrl.replace(/\/$/, "")}/v1/systemone`;

  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, request);
    if (response.ok) {
      const { answers } = (await response.json()) as { answers: Record<string, Answer> };
      return answers;
    }
    if (!RETRYABLE_STATUSES.has(response.status) || attempt >= retries) {
      throw new SystemOneError(response.status, await response.text());
    }
    await new Promise((resolve) => setTimeout(resolve, backoffMs * 2 ** attempt));
  }
}
