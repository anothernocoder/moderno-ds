// A dev-server route that takes a JSON body. A body that does not parse gets a
// 400, and an error while handling goes to `next` (a 500), so one bad request
// never takes the playground down.
import type { IncomingMessage, ServerResponse } from "node:http";

type Next = (error?: unknown) => void;

export function jsonRoute<T>(
  handle: (body: T, request: IncomingMessage, response: ServerResponse) => Promise<void>,
) {
  return async (request: IncomingMessage, response: ServerResponse, next: Next) => {
    let body: T;
    try {
      let text = "";
      for await (const chunk of request) text += chunk;
      body = JSON.parse(text) as T;
    } catch {
      response.statusCode = 400;
      response.end("Expected a JSON body.");
      return;
    }
    try {
      await handle(body, request, response);
    } catch (error) {
      next(error);
    }
  };
}
