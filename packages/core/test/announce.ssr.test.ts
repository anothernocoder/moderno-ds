// @vitest-environment node
import { describe, expect, it } from "vitest";
import { announce } from "../src/announce.js";

describe("announce on the server", () => {
  it("does nothing where there is no document", () => {
    expect(typeof document).toBe("undefined");
    expect(() => announce("Dropped.")).not.toThrow();
  });
});
