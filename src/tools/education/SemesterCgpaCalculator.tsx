"use client";

import { useRef, useState } from "react";
import { CopyButton, ShareButton } from "@/components/tool/ActionButtons";
import { BigNumber, ResultPanel, StatGrid } from "@/components/tool/ResultPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectField, TextField } from "@/components/ui/Field";
import { PlusIcon, ResetIcon, TrashIcon } from "@/components/ui/icons";
import {
  calculateCgpaFromSemesters,
  cgpaToPercentage,
  type CgpaFromSemestersOutcome,
  type SemesterRow,
} from "@/lib/calculators/grades";
import { formatFixed, formatNumber } from "@/lib/format";

const INITIAL_ROWS = 2;
const MAX_ROWS = 16;

export function SemesterCgpaCalculator() {
  const nextId = useRef(INITIAL_ROWS + 1);
  const makeRow = (id: number): SemesterRow => ({
    id: String(id),
    name: "",
    sgpa: "",
    credits: "",
  });
  const initialRows = () =>
    Array.from({ length: INITIAL_ROWS }, (_, i) => makeRow(i + 1));

  const [maxPoints, setMaxPoints] = useState("10");
  const [rows, setRows] = useState<SemesterRow[]>(initialRows);
  const [outcome, setOutcome] = useState<CgpaFromSemestersOutcome | null>(null);

  const rowErrors = outcome && !outcome.ok ? outcome.rowErrors : {};
  const topMessage = outcome && !outcome.ok ? outcome.message : undefined;
  const hasErrors = Object.keys(rowErrors).length > 0 || Boolean(topMessage);
  const result = outcome?.ok ? outcome.result : null;

  function update(id: string, patch: Partial<SemesterRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setOutcome(null);
  }

  function reset() {
    nextId.current = INITIAL_ROWS + 1;
    setRows(initialRows());
    setMaxPoints("10");
    setOutcome(null);
  }

  const copyText = result
    ? [
        `CGPA: ${formatFixed(result.cgpa)}`,
        `Total credits: ${formatNumber(result.totalCredits)}`,
        ...result.lines.map(
          (l) =>
            `${l.name}: SGPA ${formatNumber(l.sgpa)} × ${formatNumber(l.credits)} credits`,
        ),
      ].join("\n")
    : "";

  return (
    <div className="space-y-6">
      <Card>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setOutcome(calculateCgpaFromSemesters(rows, Number(maxPoints)));
          }}
          className="space-y-5"
        >
          <SelectField
            label="Maximum grade points"
            value={maxPoints}
            onChange={(e) => {
              setMaxPoints(e.target.value);
              setOutcome(null);
            }}
            hint="SGPA values are checked against this maximum."
          >
            <option value="10">10 (10-point scale)</option>
            <option value="4">4 (4.0 scale)</option>
          </SelectField>

          <fieldset>
            <legend className="mb-2 text-base font-semibold">Semesters</legend>
            <ul className="space-y-3">
              {rows.map((row, i) => (
                <li
                  key={row.id}
                  className="border-line grid grid-cols-2 gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_8rem_8rem_auto] sm:items-start"
                >
                  <div className="col-span-2 sm:col-span-1">
                    <TextField
                      label={`Semester ${i + 1} name (optional)`}
                      value={row.name}
                      maxLength={40}
                      placeholder={`Semester ${i + 1}`}
                      onChange={(e) => update(row.id, { name: e.target.value })}
                    />
                  </div>
                  <TextField
                    label={`Semester ${i + 1} SGPA`}
                    inputMode="decimal"
                    value={row.sgpa}
                    error={rowErrors[row.id]?.sgpa}
                    onChange={(e) => update(row.id, { sgpa: e.target.value })}
                  />
                  <TextField
                    label={`Semester ${i + 1} credits`}
                    inputMode="decimal"
                    value={row.credits}
                    error={rowErrors[row.id]?.credits}
                    onChange={(e) => update(row.id, { credits: e.target.value })}
                  />
                  <div className="col-span-2 sm:col-span-1 sm:pt-6">
                    <Button
                      variant="ghost"
                      disabled={rows.length <= 1}
                      aria-label={`Remove semester ${i + 1}`}
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setRows((prev) => prev.filter((r) => r.id !== row.id));
                        setOutcome(null);
                      }}
                    >
                      <TrashIcon />
                      <span className="sm:sr-only">Remove</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </fieldset>

          {hasErrors && (
            <Alert tone="error" title="Please fix the highlighted fields">
              {topMessage ??
                "Each semester needs an SGPA and credits. Leave a row completely empty to skip it."}
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit">Calculate CGPA</Button>
            <Button
              variant="secondary"
              disabled={rows.length >= MAX_ROWS}
              onClick={() => {
                setRows((prev) => [...prev, makeRow(nextId.current++)]);
                setOutcome(null);
              }}
            >
              <PlusIcon />
              Add semester
            </Button>
            <Button variant="ghost" onClick={reset}>
              <ResetIcon />
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {!result && !hasErrors && (
        <p className="text-ink-muted text-sm">
          Enter each semester&rsquo;s SGPA and total credits, then choose &ldquo;Calculate
          CGPA&rdquo;.
        </p>
      )}

      {result && (
        <ResultPanel
          title="Your CGPA"
          actions={
            <>
              <CopyButton text={copyText} label="Copy result" />
              <ShareButton
                title="My CGPA"
                text={`My CGPA is ${formatFixed(result.cgpa)}, calculated with Toolora.`}
              />
            </>
          }
        >
          <BigNumber label="CGPA" value={formatFixed(result.cgpa)} />
          <div className="mt-4">
            <StatGrid
              items={[
                { label: "Total credits", value: formatNumber(result.totalCredits) },
                ...(maxPoints === "10"
                  ? [
                      {
                        label: "Approx. percentage (CGPA × 9.5)",
                        value: `${formatNumber(cgpaToPercentage(result.cgpa), 2)}%`,
                      },
                    ]
                  : []),
              ]}
            />
          </div>
          <p className="text-ink-soft mt-3 text-sm">
            CGPA = Σ(SGPA × credits) ÷ Σ(credits) ={" "}
            {formatNumber(
              result.lines.reduce((s, l) => s + l.sgpa * l.credits, 0),
              4,
            )}{" "}
            ÷ {formatNumber(result.totalCredits)} ={" "}
            <strong>{formatFixed(result.cgpa, 4)}</strong>.
          </p>
        </ResultPanel>
      )}
    </div>
  );
}
