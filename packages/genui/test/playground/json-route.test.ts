import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { describe, expect, it, vi } from "vitest";
import { jsonRoute } from "../../playground/server/json-route.ts";

function request(body: string) {
  return Readable.from([body]) as unknown as IncomingMessage;
}

function response() {
  return { statusCode: 200, end: vi.fn() } as unknown as ServerResponse;
}

describe("jsonRoute", () => {
  it.each(["", "notjson"])("answers 400 to the body %j and skips the handler", async (body) => {
    const handle = vi.fn();
    const next = vi.fn();
    const res = response();
    await jsonRoute(handle)(request(body), res, next);
    expect(res.statusCode).toBe(400);
    expect(res.end).toHaveBeenCalled();
    expect(handle).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("hands the parsed body to the handler", async () => {
    const handle = vi.fn(async () => {});
    await jsonRoute(handle)(request('{"messages":[]}'), response(), vi.fn());
    expect(handle).toHaveBeenCalledWith({ messages: [] }, expect.anything(), expect.anything());
  });

  it("passes a handler error to next instead of rejecting", async () => {
    const error = new Error("boom");
    const next = vi.fn();
    const route = jsonRoute(async () => {
      throw error;
    });
    await expect(route(request("{}"), response(), next)).resolves.toBeUndefined();
    expect(next).toHaveBeenCalledWith(error);
  });
});
