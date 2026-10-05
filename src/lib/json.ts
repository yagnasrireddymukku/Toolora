/**
 * Strict RFC 8259 JSON parser used by the formatter.
 *
 * Why not JSON.parse? (1) Error messages and positions differ between Chrome, Firefox
 * and Safari, so precise "line 3, column 5" errors need our own scanner. (2) Re-printing
 * a JSON.parse result silently changes data: 12345678901234567890 loses digits, 1.0 becomes 1,
 * and duplicate keys vanish. This parser keeps every number and string exactly as written.
 */

export interface JsonError {
  message: string;
  /** 0-based character offset of the problem. */
  index: number;
  /** 1-based. */
  line: number;
  column: number;
}

type JsonNode =
  | { type: "object"; entries: { key: string; value: JsonNode }[] }
  | { type: "array"; items: JsonNode[] }
  /** Raw source text of a string (with quotes), number, true, false or null. */
  | { type: "primitive"; raw: string };

export interface JsonStats {
  rootType: "object" | "array" | "string" | "number" | "boolean" | "null";
  depth: number;
  keys: number;
  values: number;
}

export type ParseOutcome =
  { ok: true; node: JsonNode; stats: JsonStats } | { ok: false; error: JsonError };

/** Maximum nesting depth. Prevents stack overflow on hostile input. */
export const MAX_JSON_DEPTH = 500;
/** Largest input we try to process in the browser. */
export const MAX_JSON_CHARS = 5_000_000;

class ParseFailure extends Error {
  constructor(
    message: string,
    readonly index: number,
  ) {
    super(message);
  }
}

const WHITESPACE = new Set([" ", "\t", "\n", "\r"]);
const NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;

function describeChar(ch: string | undefined): string {
  if (ch === undefined) return "the end of the text";
  if (ch === "\n") return "a line break";
  if (ch === "'") return "a single quote";
  return `"${ch}"`;
}

class Parser {
  private pos = 0;
  private maxDepth = 0;
  keys = 0;
  values = 0;

  constructor(private readonly text: string) {}

  get depth() {
    return this.maxDepth;
  }

  parseDocument(): JsonNode {
    this.skipWs();
    if (this.pos >= this.text.length)
      throw new ParseFailure("The input is empty. Paste some JSON.", 0);
    const node = this.parseValue(1);
    this.skipWs();
    if (this.pos < this.text.length) {
      throw new ParseFailure(
        `Unexpected ${describeChar(this.text[this.pos])} after the end of the JSON value. A JSON document has one top-level value.`,
        this.pos,
      );
    }
    return node;
  }

  private skipWs() {
    while (this.pos < this.text.length && WHITESPACE.has(this.text[this.pos])) this.pos++;
  }

  private parseValue(depth: number): JsonNode {
    if (depth > MAX_JSON_DEPTH)
      throw new ParseFailure(
        `The JSON is nested more than ${MAX_JSON_DEPTH} levels deep.`,
        this.pos,
      );
    this.maxDepth = Math.max(this.maxDepth, depth);
    this.values++;
    const ch = this.text[this.pos];
    if (ch === "{") return this.parseObject(depth);
    if (ch === "[") return this.parseArray(depth);
    if (ch === '"') return { type: "primitive", raw: this.parseString() };
    if (ch === "-" || (ch !== undefined && ch >= "0" && ch <= "9"))
      return this.parseNumber();
    for (const word of ["true", "false", "null"]) {
      if (this.text.startsWith(word, this.pos)) {
        this.pos += word.length;
        return { type: "primitive", raw: word };
      }
    }
    if (ch === undefined)
      throw new ParseFailure("Unexpected end of JSON. A value is missing.", this.pos);
    if (ch === "'")
      throw new ParseFailure(
        'Strings must use double quotes ("), not single quotes.',
        this.pos,
      );
    if (/[A-Za-z_]/.test(ch)) {
      const word = /^[A-Za-z_][\w$]*/.exec(this.text.slice(this.pos))?.[0] ?? ch;
      const hint =
        word === "undefined" || word === "NaN" || word === "Infinity"
          ? ` ${word} is not valid JSON.`
          : " Text values must be in double quotes.";
      throw new ParseFailure(`Unexpected "${word}".${hint}`, this.pos);
    }
    if (ch === "]" || ch === "}")
      throw new ParseFailure(
        `Unexpected ${describeChar(ch)}. A value is missing or there is a trailing comma, which JSON does not allow.`,
        this.pos,
      );
    throw new ParseFailure(
      `Unexpected ${describeChar(ch)}. Expected a value such as a string, number, object or array.`,
      this.pos,
    );
  }

  private parseObject(depth: number): JsonNode {
    this.pos++; // {
    const entries: { key: string; value: JsonNode }[] = [];
    this.skipWs();
    if (this.text[this.pos] === "}") {
      this.pos++;
      return { type: "object", entries };
    }
    for (;;) {
      this.skipWs();
      const ch = this.text[this.pos];
      if (ch !== '"') {
        if (ch === "}")
          throw new ParseFailure(
            'Trailing comma before "}". JSON does not allow a comma after the last property.',
            this.pos,
          );
        if (ch === "'")
          throw new ParseFailure(
            'Property names must use double quotes ("), not single quotes.',
            this.pos,
          );
        if (ch !== undefined && /[A-Za-z_$]/.test(ch))
          throw new ParseFailure("Property names must be in double quotes.", this.pos);
        throw new ParseFailure(
          `Expected a property name in double quotes but found ${describeChar(ch)}.`,
          this.pos,
        );
      }
      const key = this.parseString();
      this.keys++;
      this.skipWs();
      if (this.text[this.pos] !== ":") {
        throw new ParseFailure(
          `Expected ":" after the property name but found ${describeChar(this.text[this.pos])}.`,
          this.pos,
        );
      }
      this.pos++;
      this.skipWs();
      const value = this.parseValue(depth + 1);
      entries.push({ key, value });
      this.skipWs();
      const next = this.text[this.pos];
      if (next === ",") {
        this.pos++;
        continue;
      }
      if (next === "}") {
        this.pos++;
        return { type: "object", entries };
      }
      throw new ParseFailure(
        `Expected "," or "}" after the property value but found ${describeChar(next)}. A comma may be missing.`,
        this.pos,
      );
    }
  }

  private parseArray(depth: number): JsonNode {
    this.pos++; // [
    const items: JsonNode[] = [];
    this.skipWs();
    if (this.text[this.pos] === "]") {
      this.pos++;
      return { type: "array", items };
    }
    for (;;) {
      this.skipWs();
      items.push(this.parseValue(depth + 1));
      this.skipWs();
      const next = this.text[this.pos];
      if (next === ",") {
        this.pos++;
        continue;
      }
      if (next === "]") {
        this.pos++;
        return { type: "array", items };
      }
      throw new ParseFailure(
        `Expected "," or "]" after the array item but found ${describeChar(next)}. A comma may be missing.`,
        this.pos,
      );
    }
  }

  /** Returns the raw string including its quotes after validating escapes and control characters. */
  private parseString(): string {
    const start = this.pos;
    this.pos++; // opening quote
    for (;;) {
      const ch = this.text[this.pos];
      if (ch === undefined)
        throw new ParseFailure(
          "This string is not closed. A closing double quote is missing.",
          start,
        );
      if (ch === '"') {
        this.pos++;
        return this.text.slice(start, this.pos);
      }
      if (ch === "\n" || ch === "\r")
        throw new ParseFailure(
          "This string is not closed before the end of the line. Strings cannot contain raw line breaks; use \\n instead.",
          start,
        );
      if (ch < " ")
        throw new ParseFailure(
          "Control characters such as tabs must be escaped inside strings (for example \\t).",
          this.pos,
        );
      if (ch === "\\") {
        const esc = this.text[this.pos + 1];
        if (esc === "u") {
          if (!/^[0-9a-fA-F]{4}$/.test(this.text.slice(this.pos + 2, this.pos + 6))) {
            throw new ParseFailure(
              "Invalid \\u escape. It must be followed by four hexadecimal digits.",
              this.pos,
            );
          }
          this.pos += 6;
          continue;
        }
        if (esc === undefined || !'"\\/bfnrt'.includes(esc)) {
          throw new ParseFailure(
            `Invalid escape sequence "\\${esc ?? ""}". Use \\\\ for a literal backslash.`,
            this.pos,
          );
        }
        this.pos += 2;
        continue;
      }
      this.pos++;
    }
  }

  private parseNumber(): JsonNode {
    NUMBER.lastIndex = this.pos;
    const match = NUMBER.exec(this.text);
    if (!match)
      throw new ParseFailure(
        'Invalid number. A "-" must be followed by digits.',
        this.pos,
      );
    const raw = match[0];
    const after = this.text[this.pos + raw.length];
    if (after !== undefined && /[\w.+-]/.test(after) && !WHITESPACE.has(after)) {
      if (raw === "0" && /\d/.test(after))
        throw new ParseFailure("Numbers cannot have leading zeros.", this.pos);
      if (after === ".")
        throw new ParseFailure(
          "A decimal point must be followed by digits.",
          this.pos + raw.length,
        );
      throw new ParseFailure(
        `Invalid number: unexpected ${describeChar(after)} after "${raw}".`,
        this.pos + raw.length,
      );
    }
    this.pos += raw.length;
    return { type: "primitive", raw };
  }
}

export function locate(text: string, index: number): { line: number; column: number } {
  const clamped = Math.max(0, Math.min(index, text.length));
  let line = 1;
  let lastBreak = -1;
  for (let i = 0; i < clamped; i++) {
    if (text[i] === "\n") {
      line++;
      lastBreak = i;
    }
  }
  return { line, column: clamped - lastBreak };
}

function rootType(node: JsonNode): JsonStats["rootType"] {
  if (node.type !== "primitive") return node.type;
  if (node.raw.startsWith('"')) return "string";
  if (node.raw === "null") return "null";
  if (node.raw === "true" || node.raw === "false") return "boolean";
  return "number";
}

export function parseJson(text: string): ParseOutcome {
  if (text.length > MAX_JSON_CHARS) {
    return {
      ok: false,
      error: {
        message: `The input is larger than ${MAX_JSON_CHARS / 1_000_000} million characters, which is too big to process in the browser.`,
        index: 0,
        line: 1,
        column: 1,
      },
    };
  }
  // A leading byte-order mark is common in files saved on Windows and is safe to ignore.
  const source = text.replace(/^﻿/, "");
  const parser = new Parser(source);
  try {
    const node = parser.parseDocument();
    return {
      ok: true,
      node,
      stats: {
        rootType: rootType(node),
        depth: parser.depth,
        keys: parser.keys,
        values: parser.values,
      },
    };
  } catch (e) {
    if (e instanceof ParseFailure) {
      return {
        ok: false,
        error: { message: e.message, index: e.index, ...locate(source, e.index) },
      };
    }
    return {
      ok: false,
      error: { message: "The JSON could not be read.", index: 0, line: 1, column: 1 },
    };
  }
}

export type Indent = number | "\t";

export interface PrintOptions {
  indent: Indent;
  sortKeys?: boolean;
}

/** Decoded key text, used only for sorting. */
function keyText(rawKey: string): string {
  try {
    return JSON.parse(rawKey) as string;
  } catch {
    return rawKey;
  }
}

function print(node: JsonNode, opts: PrintOptions, level: number): string {
  if (node.type === "primitive") return node.raw;
  const unit = opts.indent === "\t" ? "\t" : " ".repeat(opts.indent);
  const pad = unit.repeat(level + 1);
  const closePad = unit.repeat(level);
  if (node.type === "array") {
    if (node.items.length === 0) return "[]";
    return `[\n${node.items.map((i) => pad + print(i, opts, level + 1)).join(",\n")}\n${closePad}]`;
  }
  if (node.entries.length === 0) return "{}";
  const entries = opts.sortKeys
    ? [...node.entries].sort((a, b) =>
        keyText(a.key) < keyText(b.key) ? -1 : keyText(a.key) > keyText(b.key) ? 1 : 0,
      )
    : node.entries;
  return `{\n${entries.map((e) => `${pad}${e.key}: ${print(e.value, opts, level + 1)}`).join(",\n")}\n${closePad}}`;
}

function printMin(node: JsonNode): string {
  if (node.type === "primitive") return node.raw;
  if (node.type === "array") return `[${node.items.map(printMin).join(",")}]`;
  return `{${node.entries.map((e) => `${e.key}:${printMin(e.value)}`).join(",")}}`;
}

export type FormatOutcome =
  { ok: true; output: string; stats: JsonStats } | { ok: false; error: JsonError };

export function formatJson(text: string, opts: PrintOptions): FormatOutcome {
  const parsed = parseJson(text);
  if (!parsed.ok) return parsed;
  return { ok: true, output: print(parsed.node, opts, 0), stats: parsed.stats };
}

export function minifyJson(text: string): FormatOutcome {
  const parsed = parseJson(text);
  if (!parsed.ok) return parsed;
  return { ok: true, output: printMin(parsed.node), stats: parsed.stats };
}

/** The offending line with a caret under the error column, for display. */
export function errorSnippet(text: string, error: JsonError): string {
  const source = text.replace(/^﻿/, "");
  const lines = source.split("\n");
  const raw = lines[error.line - 1] ?? "";
  const MAX = 80;
  // Window long lines around the error so the caret stays visible.
  const start = Math.max(0, error.column - 1 - Math.floor(MAX / 2));
  const shown = raw.slice(start, start + MAX).replace(/\r$/, "");
  const caretAt = Math.max(0, error.column - 1 - start);
  const prefix = `${error.line} | `;
  return `${prefix}${start > 0 ? "…" : ""}${shown}\n${" ".repeat(prefix.length + (start > 0 ? 1 : 0) + caretAt)}^`;
}
