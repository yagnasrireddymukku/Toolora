import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(toCsv([["a,b", 'say "hi"', "line\nbreak"]])).toBe(
      '"a,b","say ""hi""","line\nbreak"',
    );
  });
  it("neutralises formula injection in text but keeps negative numbers", () => {
    expect(toCsv([["=SUM(A1)", "@x", -5]])).toBe("'=SUM(A1),'@x,-5");
  });
  it("joins rows with CRLF", () => {
    expect(
      toCsv([
        [1, 2],
        [3, 4],
      ]),
    ).toBe("1,2\r\n3,4");
  });
});
