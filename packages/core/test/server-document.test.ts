// @vitest-environment node
import { describe, expect, it } from "vitest";
import { serverDocument } from "../src/server-document.js";

describe("serverDocument", () => {
  it("reads as a document to zag and holds no elements", () => {
    // zag's dom-query takes anything with nodeType 9 for a document.
    expect(serverDocument.nodeType).toBe(9);
    expect(serverDocument.getElementById("splitter:1:global-cursor")).toBeNull();
  });
});
