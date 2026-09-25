import { describe, expect, it } from "vitest";
import { hexToOklch, oklchToHex } from "./color.ts";

describe("oklchToHex", () => {
  it("converts the contract's greys and brand colours", () => {
    expect(oklchToHex("oklch(1 0 0)")).toBe("#ffffff");
    expect(oklchToHex("oklch(0 0 0)")).toBe("#000000");
    expect(oklchToHex("oklch(0.628 0.2577 29.23)")).toBe("#ff0000");
  });

  it("accepts percentages and an alpha channel", () => {
    expect(oklchToHex("oklch(100% 0 0 / 0.5)")).toBe("#ffffff");
  });

  it("returns null for anything that is not OKLCH", () => {
    expect(oklchToHex("#fff")).toBeNull();
    expect(oklchToHex("")).toBeNull();
  });
});

describe("hexToOklch", () => {
  it("writes greys as achromatic `L 0 0`", () => {
    expect(hexToOklch("#ffffff")).toBe("oklch(1 0 0)");
    expect(hexToOklch("#000000")).toBe("oklch(0 0 0)");
  });

  // The 3-decimal OKLCH the contract uses can nudge a channel by a step or two —
  // invisible, and it keeps picked values as short as hand-written ones.
  it("round-trips through oklchToHex within two channel steps", () => {
    const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    for (const hex of ["#ff0000", "#1e6fd9", "#0a8f5a", "#f2a516", "#343434"]) {
      const back = channels(oklchToHex(hexToOklch(hex))!);
      channels(hex).forEach((v, i) => expect(Math.abs(v - back[i]!)).toBeLessThanOrEqual(2));
    }
  });
});
