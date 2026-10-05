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
  calculateGpa,
  cgpaToPercentage,
  CUSTOM_SCALE_ID,
  getScale,
  GRADE_SCALES,
  type GpaOutcome,
  type SubjectRow,
} from "@/lib/calculators/grades";
import { formatFixed, formatNumber } from "@/lib/format";

const INITIAL_ROWS = 4;
const MAX_ROWS = 40;

interface Props {
  /** "SGPA" for one semester, "CGPA" for all subjects combined. */
  kind: "SGPA" | "CGPA";
}

export function SubjectGradeCalculator({ kind }: Props) {
  const nextId = useRef(INITIAL_ROWS + 1);
  const makeRow = (id: number): SubjectRow => ({
    id: String(id),
    name: "",
    credits: "",
    grade: "",
  });
  const initialRows = () =>
    Array.from({ length: INITIAL_ROWS }, (_, i) => makeRow(i + 1));

  const [scaleId, setScaleId] = useState(GRADE_SCALES[0].id);
  const [rows, setRows] = useState<SubjectRow[]>(initialRows);
  const [outcome, setOutcome] = useState<GpaOutcome | null>(null);

  const scale = getScale(scaleId);
  const isCustom = scaleId === CUSTOM_SCALE_ID;
  const rowErrors = outcome && !outcome.ok ? outcome.rowErrors : {};
  const topMessage = outcome && !outcome.ok ? outcome.message : undefined;
  const hasRowErrors = Object.keys(rowErrors).length > 0;

  function updateRow(id: string, patch: Partial<SubjectRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setOutcome(null);
  }

  function changeScale(next: string) {
    setScaleId(next);
    // Grades from one scale are meaningless in another, so clear them.
    setRows((prev) => prev.map((r) => ({ ...r, grade: "" })));
    setOutcome(null);
  }

  function addRow() {
    setRows((prev) =>
      prev.length >= MAX_ROWS ? prev : [...prev, makeRow(nextId.current++)],
    );
    setOutcome(null);
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
    setOutcome(null);
  }

  function reset() {
    nextId.current = INITIAL_ROWS + 1;
    setRows(initialRows());
    setScaleId(GRADE_SCALES[0].id);
    setOutcome(null);
  }

  const result = outcome?.ok ? outcome.result : null;
  const shareText = result
    ? `My ${kind} is ${formatFixed(result.gpa)} (${formatNumber(result.totalCredits)} credits), calculated with Toolora.`
    : "";
  const copyText = result
    ? [
        `${kind}: ${formatFixed(result.gpa)}`,
        `Total credits: ${formatNumber(result.totalCredits)}`,
        ...result.lines.map(
          (l) =>
            `${l.name}: ${formatNumber(l.credits)} credits × ${formatNumber(l.points)} = ${formatNumber(l.weighted)}`,
        ),
        `Formula: ${formatNumber(result.totalWeighted)} ÷ ${formatNumber(result.totalCredits)} = ${formatFixed(result.gpa, 4)}`,
      ].join("\n")
    : "";

  return (
    <div className="space-y-6">
      <Card>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setOutcome(calculateGpa(rows, scaleId));
          }}
          className="space-y-5"
        >
          <SelectField
            label="Grading scale"
            value={scaleId}
            onChange={(e) => changeScale(e.target.value)}
            hint={
              isCustom
                ? "Enter the grade points your university assigns to each subject (0 to 100)."
                : scale?.note
            }
          >
            {GRADE_SCALES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
            <option value={CUSTOM_SCALE_ID}>Custom: enter grade points directly</option>
          </SelectField>

          {!isCustom && scale && (
            <details className="bg-surface rounded-lg p-3 text-sm">
              <summary className="flex min-h-11 cursor-pointer items-center font-medium">
                Grade point mapping used
              </summary>
              <p className="text-ink-soft mt-2">
                {scale.grades.map((g) => `${g.label} = ${g.points}`).join(", ")}
              </p>
            </details>
          )}

          <fieldset>
            <legend className="mb-2 text-base font-semibold">Subjects</legend>
            <ul className="space-y-3">
              {rows.map((row, i) => {
                const errors = rowErrors[row.id];
                return (
                  <li
                    key={row.id}
                    className="border-line grid grid-cols-2 gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_7rem_10rem_auto] sm:items-start"
                  >
                    <div className="col-span-2 sm:col-span-1">
                      <TextField
                        label={`Subject ${i + 1} name (optional)`}
                        value={row.name}
                        maxLength={60}
                        placeholder={`Subject ${i + 1}`}
                        onChange={(e) => updateRow(row.id, { name: e.target.value })}
                      />
                    </div>
                    <TextField
                      label={`Subject ${i + 1} credits`}
                      inputMode="decimal"
                      value={row.credits}
                      error={errors?.credits}
                      onChange={(e) => updateRow(row.id, { credits: e.target.value })}
                    />
                    {isCustom ? (
                      <TextField
                        label={`Subject ${i + 1} grade points`}
                        inputMode="decimal"
                        value={row.grade}
                        error={errors?.grade}
                        onChange={(e) => updateRow(row.id, { grade: e.target.value })}
                      />
                    ) : (
                      <SelectField
                        label={`Subject ${i + 1} grade`}
                        value={row.grade}
                        error={errors?.grade}
                        onChange={(e) => updateRow(row.id, { grade: e.target.value })}
                      >
                        <option value="">Select</option>
                        {scale?.grades.map((g) => (
                          <option key={g.label} value={g.label}>
                            {g.label} ({g.points})
                          </option>
                        ))}
                      </SelectField>
                    )}
                    <div className="col-span-2 sm:col-span-1 sm:pt-6">
                      <Button
                        variant="ghost"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length <= 1}
                        aria-label={`Remove subject ${i + 1}`}
                        className="w-full sm:w-auto"
                      >
                        <TrashIcon />
                        <span className="sm:sr-only">Remove</span>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          {(hasRowErrors || topMessage) && (
            <Alert tone="error" title="Please fix the highlighted fields">
              {topMessage ??
                "Each subject needs credits greater than 0 and a grade. Leave a row completely empty to skip it."}
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit">Calculate {kind}</Button>
            <Button
              variant="secondary"
              onClick={addRow}
              disabled={rows.length >= MAX_ROWS}
            >
              <PlusIcon />
              Add subject
            </Button>
            <Button variant="ghost" onClick={reset}>
              <ResetIcon />
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {!result && !hasRowErrors && !topMessage && (
        <p className="text-ink-muted text-sm">
          Enter credits and grades for your subjects, then choose &ldquo;Calculate {kind}
          &rdquo;.
        </p>
      )}

      {result && (
        <ResultPanel
          title={`Your ${kind}`}
          actions={
            <>
              <CopyButton text={copyText} label="Copy result" />
              <ShareButton title={`My ${kind}`} text={shareText} />
            </>
          }
        >
          <BigNumber label={kind} value={formatFixed(result.gpa)} />
          <div className="mt-4">
            <StatGrid
              items={[
                { label: "Total credits", value: formatNumber(result.totalCredits) },
                {
                  label: "Total grade points earned",
                  value: formatNumber(result.totalWeighted),
                },
                ...(scaleId === "10-point"
                  ? [
                      {
                        label: `Approx. percentage (${kind} × 9.5)`,
                        value: `${formatNumber(cgpaToPercentage(result.gpa), 2)}%`,
                      },
                    ]
                  : []),
              ]}
            />
          </div>
          <h3 className="mt-5 font-semibold">Calculation breakdown</h3>
          <div className="mt-2 overflow-x-auto rounded-lg bg-white">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <caption className="sr-only">
                Credits, grade points and weighted points per subject
              </caption>
              <thead className="border-line text-ink-muted border-b">
                <tr>
                  <th scope="col" className="p-2">
                    Subject
                  </th>
                  <th scope="col" className="p-2">
                    Credits
                  </th>
                  <th scope="col" className="p-2">
                    Grade points
                  </th>
                  <th scope="col" className="p-2">
                    Credits × points
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((l, i) => (
                  <tr key={i} className="border-line border-b last:border-0">
                    <th scope="row" className="p-2 font-medium">
                      {l.name}
                    </th>
                    <td className="p-2">{formatNumber(l.credits)}</td>
                    <td className="p-2">{formatNumber(l.points)}</td>
                    <td className="p-2">{formatNumber(l.weighted)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="font-semibold">
                <tr>
                  <th scope="row" className="p-2">
                    Total
                  </th>
                  <td className="p-2">{formatNumber(result.totalCredits)}</td>
                  <td className="p-2" />
                  <td className="p-2">{formatNumber(result.totalWeighted)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-ink-soft mt-3 text-sm">
            {kind} = {formatNumber(result.totalWeighted)} ÷{" "}
            {formatNumber(result.totalCredits)} ={" "}
            <strong>{formatFixed(result.gpa, 4)}</strong>, shown as{" "}
            {formatFixed(result.gpa)}.
          </p>
        </ResultPanel>
      )}
    </div>
  );
}
