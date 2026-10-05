import type { ToolDefinition } from "@/lib/tools/types";

export const DEVELOPER_TOOLS: ToolDefinition[] = [
  {
    slug: "json-formatter",
    category: "developer",
    name: "JSON Formatter",
    h1: "JSON Formatter and Validator",
    description:
      "Format, minify and validate JSON in your browser with exact line and column error locations. Copy or download the result. Your data never leaves your device.",
    intro:
      "Paste JSON to pretty-print it, shrink it to one line, or find out exactly where it is invalid. Processing happens locally in your browser, so private data stays private.",
    keywords: [
      "json",
      "formatter",
      "beautify",
      "pretty print",
      "minify",
      "validator",
      "lint",
      "parse",
      "format json",
    ],
    popular: true,
    addedAt: "2026-10-05",
    related: ["qr-code-generator", "ats-resume-checker"],
    howItWorks: [
      "Paste your JSON into the input box, or choose Load example.",
      "Choose Format to pretty-print it (2 spaces, 4 spaces or tabs, with optional key sorting), Minify to remove all extra whitespace, or Validate to only check it.",
      "If the JSON is invalid you will see the line, column and a plain-English reason, with a caret under the problem and a button that jumps to it.",
      "Copy the output or download it as a .json file.",
    ],
    formula: {
      title: "What the validator checks",
      body: [
        "The tool follows the JSON specification (RFC 8259) strictly. Property names and strings need double quotes, trailing commas are not allowed, and the only values are objects, arrays, strings, numbers, true, false and null.",
        "Numbers and strings are re-printed exactly as you wrote them. Large integers keep every digit, 1.0 stays 1.0, and duplicate keys are preserved, instead of being silently changed the way a plain parse-and-stringify would.",
        "Nesting deeper than 500 levels and inputs over 5 million characters are rejected to keep your browser responsive.",
      ],
    },
    example: {
      title: "Worked example",
      body: [
        'Input {"name":"Toolora","tags":["a","b"]} formats to a multi-line version with each property on its own line, and minifies back to {"name":"Toolora","tags":["a","b"]}.',
        'Input {"a": 1,} is reported as "Line 1, column 9: Trailing comma before }". JSON does not allow a comma after the last property.',
      ],
    },
    tips: [
      "Use Minify before sending JSON in a request body or storing it, and Format when reading or reviewing it.",
      "Common errors: trailing commas, single quotes, unquoted keys, comments and missing commas between items.",
      "Sorting keys is handy for comparing two JSON documents, but it changes the order of properties.",
      "Do not paste secrets into any online tool you do not trust. Here nothing is uploaded, but be careful about sharing the result.",
    ],
    limitations: [
      "Comments, trailing commas and single quotes are not part of standard JSON, so they are reported as errors. JSON5 and JSONC are not supported.",
      "Very large documents (several megabytes) can take a moment and use a lot of memory in the browser.",
    ],
    faqs: [
      {
        q: "Is my JSON sent to a server?",
        a: "No. Parsing and formatting run entirely in your browser. Nothing you paste is uploaded.",
      },
      {
        q: "Why does it say my JSON is invalid when it works in JavaScript?",
        a: "JSON is stricter than JavaScript object syntax. Keys must be in double quotes, strings cannot use single quotes, and there can be no trailing commas, comments or undefined values.",
      },
      {
        q: "Does formatting change my data?",
        a: "No. Numbers, strings and the order of properties are kept exactly as written (unless you choose to sort keys), so formatting never alters values.",
      },
      {
        q: "What is the difference between format and minify?",
        a: "Format adds line breaks and indentation so people can read it. Minify removes all unnecessary whitespace to make it as small as possible. Both represent exactly the same data.",
      },
    ],
  },
];
