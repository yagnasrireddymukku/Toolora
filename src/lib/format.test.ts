import { describe, expect, it } from "vitest";
import { formatCurrency, formatNumber, parseNumber } from "./format";

describe("parseNumber", () => {
  it("parses plain, decimal and signed numbers", () => {
    expect(parseNumber("12")).toBe(12);
    expect(parseNumber(" 12.5 ")).toBe(12.5);
    expect(parseNumber(".5")).toBe(0.5);
    expect(parseNumber("-3")).toBe(-3);
  });
  it("accepts thousands separators", () => {
    expect(parseNumber("12,00,000")).toBe(1200000);
    expect(parseNumber("1 000")).toBe(1000);
  });
  it("rejects empty and invalid input", () => {
    for (const bad of [
      "",
      "  ",
      "abc",
      "1e3",
      "Infinity",
      "NaN",
      "1.2.3",
      "--1",
      "0x10",
    ]) {
      expect(parseNumber(bad)).toBeNull();
    }
  });
});

describe("formatting", () => {
  it("drops needless trailing zeros", () => {
    expect(formatNumber(30)).toBe("30");
    expect(formatNumber(8.5)).toBe("8.5");
    expect(formatNumber(8.88889, 2)).toBe("8.89");
  });
  it("formats rupees with Indian grouping", () => {
    expect(formatCurrency(1200000)).toContain("12,00,000");
  });
  it("handles non-finite", () => {
    expect(formatNumber(NaN)).toBe("–");
  });
});
