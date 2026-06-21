import { describe, expect, it } from "vitest";
import { checkParity } from "./parity.ts";

describe("checkParity — slug parity across locales", () => {
  it("passes when every slug exists in both locales", () => {
    const result = checkParity(["en/button", "es/button", "en/index", "es/index"]);
    expect(result.ok).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("reports the locale + slug that is missing a translation", () => {
    const result = checkParity(["en/button", "es/button", "en/select"]);
    expect(result.ok).toBe(false);
    expect(result.missing).toContainEqual({ locale: "es", slug: "select" });
  });

  it("ignores ids that are not under a known locale", () => {
    const result = checkParity(["en/button", "es/button", "drafts/wip"]);
    expect(result.ok).toBe(true);
  });
});
