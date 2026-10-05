import { describe, expect, it } from "vitest";
import {
  errorSnippet,
  formatJson,
  locate,
  MAX_JSON_DEPTH,
  minifyJson,
  parseJson,
} from "./json";

const fmt = (text: string, indent: number | "\t" = 2, sortKeys = false) => {
  const out = formatJson(text, { indent, sortKeys });
  if (!out.ok) throw new Error(out.error.message);
  return out.output;
};

const errorOf = (text: string) => {
  const out = parseJson(text);
  if (out.ok) throw new Error("expected an error");
  return out.error;
};

describe("valid JSON", () => {
  it("formats with 2 spaces, 4 spaces and tabs", () => {
    const input = '{"a":1,"b":[1,2,{"c":null}],"d":{}}';
    expect(fmt(input)).toBe(
      '{\n  "a": 1,\n  "b": [\n    1,\n    2,\n    {\n      "c": null\n    }\n  ],\n  "d": {}\n}',
    );
    expect(fmt('{"a":[1]}', 4)).toBe('{\n    "a": [\n        1\n    ]\n}');
    expect(fmt('{"a":1}', "\t")).toBe('{\n\t"a": 1\n}');
  });

  it("minifies", () => {
    const out = minifyJson('{\n  "a": [1, 2, 3],\n  "b": { "c": "x y" }\n}');
    expect(out.ok && out.output).toBe('{"a":[1,2,3],"b":{"c":"x y"}}');
  });

  it("round-trips through JSON.parse", () => {
    const text = '{"a":[1,2.5,-3e2,true,false,null,"s\\n\\u00e9"],"b":{"c":{}}}';
    expect(JSON.parse(fmt(text))).toEqual(JSON.parse(text));
    const min = minifyJson(fmt(text));
    expect(min.ok && JSON.parse(min.output)).toEqual(JSON.parse(text));
  });

  it("preserves numbers and duplicate keys exactly (unlike JSON.parse)", () => {
    expect(fmt('{"id":12345678901234567890,"x":1.0,"y":1E3,"k":1,"k":2}')).toBe(
      '{\n  "id": 12345678901234567890,\n  "x": 1.0,\n  "y": 1E3,\n  "k": 1,\n  "k": 2\n}',
    );
  });

  it("preserves string escapes untouched", () => {
    expect(fmt('{"a":"\\u00e9\\/\\"q\\""}')).toContain('"\\u00e9\\/\\"q\\""');
  });

  it("sorts keys when asked", () => {
    expect(fmt('{"b":1,"a":{"d":1,"c":2}}', 2, true)).toBe(
      '{\n  "a": {\n    "c": 2,\n    "d": 1\n  },\n  "b": 1\n}',
    );
  });

  it("accepts scalars, empty containers, a BOM and surrounding whitespace", () => {
    expect(fmt("  42  ")).toBe("42");
    expect(fmt('"x"')).toBe('"x"');
    expect(fmt("[]")).toBe("[]");
    expect(fmt("\uFEFF{}")).toBe("{}");
  });

  it("reports statistics", () => {
    const out = parseJson('{"a":[1,{"b":2}],"c":3}');
    expect(out.ok && out.stats).toEqual({
      rootType: "object",
      depth: 4,
      keys: 3,
      values: 6,
    });
  });
});

describe("invalid JSON with locations", () => {
  it("empty input", () => expect(errorOf("   ").message).toMatch(/empty/));

  it("trailing comma in object and array", () => {
    const o = errorOf('{"a":1,}');
    expect(o.message).toMatch(/Trailing comma/);
    expect([o.line, o.column]).toEqual([1, 8]);
    expect(errorOf("[1,2,]").message).toMatch(/trailing comma/i);
  });

  it("single quotes and unquoted keys", () => {
    expect(errorOf("{'a':1}").message).toMatch(/double quotes/);
    expect(errorOf("{a:1}").message).toMatch(/double quotes/);
    expect(errorOf("{\"a\":'x'}").message).toMatch(/double quotes/);
  });

  it("missing comma and colon", () => {
    const e = errorOf('{\n  "a": 1\n  "b": 2\n}');
    expect(e.message).toMatch(/comma may be missing/);
    expect([e.line, e.column]).toEqual([3, 3]);
    expect(errorOf('{"a" 1}').message).toMatch(/Expected ":"/);
  });

  it("unterminated string and raw line break", () => {
    expect(errorOf('{"a":"abc').message).toMatch(/not closed/);
    expect(errorOf('{"a":"ab\ncd"}').message).toMatch(/line break|end of the line/);
  });

  it("bad numbers", () => {
    expect(errorOf("[01]").message).toMatch(/leading zeros/);
    expect(errorOf("[1.]").message).toMatch(/decimal point/);
    expect(errorOf("[-]").message).toMatch(/Invalid number/);
    expect(errorOf("[1e]").message).toMatch(/Invalid number/);
  });

  it("JavaScript-only values and bad escapes", () => {
    expect(errorOf('{"a":undefined}').message).toMatch(/undefined is not valid JSON/);
    expect(errorOf('{"a":NaN}').message).toMatch(/NaN/);
    expect(errorOf('"\\x"').message).toMatch(/escape/);
    expect(errorOf('"\\u12"').message).toMatch(/\\u/);
  });

  it("unclosed containers and trailing content", () => {
    expect(errorOf('{"a":1').message).toMatch(/Expected "," or "}"/);
    expect(errorOf("[1,2").message).toMatch(/Expected "," or "\]"/);
    expect(errorOf("{} {}").message).toMatch(/after the end/);
  });

  it("agrees with JSON.parse about validity", () => {
    const samples = [
      "{}",
      "[]",
      "1",
      '"a"',
      "true",
      "[1,2,3]",
      '{"a":{"b":[null]}}',
      "{",
      "[1,]",
      '{"a":}',
      "01",
      "'a'",
      "[1 2]",
      '{"a":1}}',
      "-0",
      "1e+5",
      ".5",
      "+1",
      "[,]",
      '"\t"',
    ];
    for (const s of samples) {
      let native = true;
      try {
        JSON.parse(s);
      } catch {
        native = false;
      }
      expect(parseJson(s).ok, s).toBe(native);
    }
  });

  it("rejects pathological nesting without crashing", () => {
    const deep = "[".repeat(MAX_JSON_DEPTH + 10) + "]".repeat(MAX_JSON_DEPTH + 10);
    expect(errorOf(deep).message).toMatch(/nested more than/);
    const ok = "[".repeat(MAX_JSON_DEPTH - 1) + "]".repeat(MAX_JSON_DEPTH - 1);
    expect(parseJson(ok).ok).toBe(true);
  });
});

describe("error display helpers", () => {
  it("locates line and column", () => {
    expect(locate("ab\ncd", 4)).toEqual({ line: 2, column: 2 });
    expect(locate("abc", 0)).toEqual({ line: 1, column: 1 });
  });

  it("renders a caret under the error", () => {
    const text = '{\n  "a": 1\n  "b": 2\n}';
    const e = errorOf(text);
    expect(errorSnippet(text, e)).toBe('3 |   "b": 2\n      ^');
  });
});
