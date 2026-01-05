import { describe, expect, it } from "vitest";
import { computeVatFromGross } from "../src/vat";

describe("computeVatFromGross", () => {
  it("computes vat breakdown from gross", () => {
    const result = computeVatFromGross(112);
    expect(result.net).toBe(100);
    expect(result.vat).toBe(12);
    expect(result.gross).toBe(112);
  });
});
