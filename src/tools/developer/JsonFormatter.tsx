"use client";

import { useState } from "react";
import { CopyButton, DownloadTextButton } from "@/components/tool/ActionButtons";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectField, TextAreaField, CheckboxField } from "@/components/ui/Field";
import { ResetIcon } from "@/components/ui/icons";
import {
  errorSnippet,
  formatJson,
  minifyJson,
  parseJson,
  type Indent,
  type JsonError,
  type JsonStats,
} from "@/lib/json";
import { formatNumber } from "@/lib/format";

const EXAMPLE =
  '{"name":"Toolora","tags":["tools","json"],"stats":{"tools":14,"free":true},"id":12345678901234567890}';
const INPUT_ID = "json-input";

type Status =
  | { kind: "idle" }
  | { kind: "ok"; message: string; stats: JsonStats }
  | { kind: "error"; error: JsonError };

type LastAction = "format" | "minify";

function describe(stats: JsonStats, chars: number): string {
  const size = chars >= 1024 ? `${formatNumber(chars / 1024, 1)} KB` : `${chars} bytes`;
  const parts = [
    stats.rootType === "object" || stats.rootType === "array"
      ? `${stats.rootType} root`
      : `${stats.rootType} value`,
  ];
  if (stats.keys > 0)
    parts.push(`${formatNumber(stats.keys)} ${stats.keys === 1 ? "key" : "keys"}`);
  parts.push(`depth ${stats.depth}`, size);
  return parts.join(" · ");
}

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState("2");
  const [sortKeys, setSortKeys] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [last, setLast] = useState<LastAction>("format");

  const indentValue: Indent = indent === "tab" ? "\t" : Number(indent);

  function run(action: LastAction | "validate") {
    if (input.trim() === "") {
      setStatus({
        kind: "error",
        error: {
          message: "The input is empty. Paste some JSON or load the example.",
          index: 0,
          line: 1,
          column: 1,
        },
      });
      setOutput("");
      return;
    }
    if (action === "validate") {
      const parsed = parseJson(input);
      setStatus(
        parsed.ok
          ? { kind: "ok", message: "Valid JSON", stats: parsed.stats }
          : { kind: "error", error: parsed.error },
      );
      return;
    }
    const result =
      action === "format"
        ? formatJson(input, { indent: indentValue, sortKeys })
        : minifyJson(input);
    if (!result.ok) {
      setStatus({ kind: "error", error: result.error });
      setOutput("");
      return;
    }
    setLast(action);
    setOutput(result.output);
    setStatus({
      kind: "ok",
      message: action === "format" ? "Formatted" : "Minified",
      stats: result.stats,
    });
  }

  function goToError(error: JsonError) {
    const el = document.getElementById(INPUT_ID) as HTMLTextAreaElement | null;
    if (!el) return;
    el.focus();
    const offset = input.startsWith("﻿") ? 1 : 0;
    el.setSelectionRange(
      error.index + offset,
      Math.min(input.length, error.index + offset + 1),
    );
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <Alert tone="info" title="Private by design">
          Your JSON is processed in your browser and is never sent to a server.
        </Alert>
        <TextAreaField
          id={INPUT_ID}
          label="JSON input"
          rows={12}
          value={input}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="font-mono text-sm"
          hint="Paste JSON here."
          onChange={(e) => {
            setInput(e.target.value);
            setStatus({ kind: "idle" });
          }}
        />

        <div className="grid items-end gap-4 sm:grid-cols-2">
          <SelectField
            label="Indentation"
            value={indent}
            onChange={(e) => setIndent(e.target.value)}
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </SelectField>
          <CheckboxField
            label="Sort keys alphabetically"
            checked={sortKeys}
            onChange={(e) => setSortKeys(e.target.checked)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => run("format")}>Format</Button>
          <Button variant="secondary" onClick={() => run("minify")}>
            Minify
          </Button>
          <Button variant="secondary" onClick={() => run("validate")}>
            Validate
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setInput(EXAMPLE);
              setOutput("");
              setStatus({ kind: "idle" });
            }}
          >
            Load example
          </Button>
          <Button
            variant="ghost"
            disabled={!input && !output}
            onClick={() => {
              setInput("");
              setOutput("");
              setStatus({ kind: "idle" });
            }}
          >
            <ResetIcon />
            Clear
          </Button>
        </div>

        <div aria-live="polite">
          {status.kind === "ok" && (
            <Alert tone="success" title={status.message}>
              {describe(status.stats, input.length)}
            </Alert>
          )}
          {status.kind === "error" && (
            <Alert tone="error" title="Invalid JSON">
              <p>
                <strong>
                  Line {status.error.line}, column {status.error.column}:
                </strong>{" "}
                {status.error.message}
              </p>
              {input.trim() !== "" && (
                <pre className="text-ink mt-2 overflow-x-auto rounded bg-white p-2 font-mono text-xs">
                  {errorSnippet(input, status.error)}
                </pre>
              )}
              {input.trim() !== "" && (
                <div className="mt-2">
                  <Button variant="secondary" onClick={() => goToError(status.error)}>
                    Go to error
                  </Button>
                </div>
              )}
            </Alert>
          )}
        </div>
      </Card>

      {output && (
        <Card className="space-y-4">
          <TextAreaField
            label={last === "format" ? "Formatted output" : "Minified output"}
            rows={12}
            value={output}
            readOnly
            className="font-mono text-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <CopyButton text={output} label="Copy output" />
            <DownloadTextButton
              filename={last === "format" ? "formatted.json" : "minified.json"}
              content={output}
              mime="application/json"
              label="Download .json"
            />
            <Button
              variant="ghost"
              onClick={() => {
                setInput(output);
                setStatus({ kind: "idle" });
              }}
            >
              Use output as input
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
