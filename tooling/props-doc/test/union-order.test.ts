import { describe, expect, it } from "vitest";
import { orderUnionMembers } from "../src/union-order.ts";

describe("orderUnionMembers", () => {
  it("puts the members a recipe declares first, in its order", () => {
    expect(
      orderUnionMembers('"outline" | "primary" | "ghost"', ["primary", "outline", "ghost"]),
    ).toBe('"primary" | "outline" | "ghost"');
  });

  it("sorts the members no recipe declares, after the declared ones", () => {
    expect(orderUnionMembers('"end" | string | "center" | number', ["center"])).toBe(
      '"center" | "end" | number | string',
    );
  });

  it("sorts every member when there is no declared order", () => {
    expect(orderUnionMembers('"vertical" | "horizontal"')).toBe('"horizontal" | "vertical"');
  });

  it("gives the same text whatever order the members come in", () => {
    const order = ["start", "center", "end"];
    expect(orderUnionMembers('"end" | "start" | "center"', order)).toBe(
      orderUnionMembers('"center" | "end" | "start"', order),
    );
  });

  it("reorders only top-level members", () => {
    expect(
      orderUnionMembers('Record<string, "b" | "a"> | ((value: "y" | "x") => void) | "a|b"'),
    ).toBe('"a|b" | ((value: "y" | "x") => void) | Record<string, "b" | "a">');
  });

  it("leaves text that is not a union alone", () => {
    expect(orderUnionMembers("CurveFactory")).toBe("CurveFactory");
    expect(orderUnionMembers('(value: "b" | "a") => "d" | "c"')).toBe(
      '(value: "b" | "a") => "d" | "c"',
    );
  });
});
