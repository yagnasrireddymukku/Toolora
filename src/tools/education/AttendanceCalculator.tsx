"use client";

import { useState } from "react";
import { CopyButton, ShareButton } from "@/components/tool/ActionButtons";
import { BigNumber, ResultPanel, StatGrid } from "@/components/tool/ResultPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { ResetIcon } from "@/components/ui/icons";
import { calculateAttendance, type AttendanceResult } from "@/lib/calculators/attendance";
import { formatNumber, parseNumber } from "@/lib/format";

const DEFAULT_REQUIRED = "75";

interface FieldErrors {
  total?: string;
  attended?: string;
  required?: string;
}

export function AttendanceCalculator() {
  const [total, setTotal] = useState("");
  const [attended, setAttended] = useState("");
  const [required, setRequired] = useState(DEFAULT_REQUIRED);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<AttendanceResult | null>(null);

  function submit() {
    const t = parseNumber(total);
    const a = parseNumber(attended);
    const r = parseNumber(required);
    const next: FieldErrors = {};
    if (t === null) next.total = "Please enter the total classes held.";
    if (a === null) next.attended = "Please enter the classes you attended.";
    if (r === null) next.required = "Please enter the required percentage.";
    if (t !== null && a !== null && r !== null) {
      const outcome = calculateAttendance({ total: t, attended: a, required: r });
      if (!outcome.ok) {
        // Attach the message to the most relevant field.
        if (/total/i.test(outcome.error) && !/attended/i.test(outcome.error))
          next.total = outcome.error;
        else if (/required/i.test(outcome.error)) next.required = outcome.error;
        else next.attended = outcome.error;
      } else {
        setErrors({});
        setResult(outcome.result);
        return;
      }
    }
    setErrors(next);
    setResult(null);
  }

  const summary = result
    ? result.meetsRequirement
      ? `Attendance ${formatNumber(result.currentPercent)}% meets the ${required}% requirement. You can miss up to ${result.canMiss} more ${result.canMiss === 1 ? "class" : "classes"}.`
      : result.mustAttend === null
        ? `Attendance ${formatNumber(result.currentPercent)}%. A requirement of 100% cannot be reached after a missed class.`
        : `Attendance ${formatNumber(result.currentPercent)}% is below ${required}%. Attend the next ${result.mustAttend} classes in a row to reach it.`
    : "";

  return (
    <div className="space-y-6">
      <Card>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Total classes held so far"
              inputMode="numeric"
              value={total}
              error={errors.total}
              onChange={(e) => {
                setTotal(e.target.value);
                setResult(null);
              }}
            />
            <TextField
              label="Classes attended"
              inputMode="numeric"
              value={attended}
              error={errors.attended}
              onChange={(e) => {
                setAttended(e.target.value);
                setResult(null);
              }}
            />
            <TextField
              label="Required attendance (%)"
              inputMode="decimal"
              value={required}
              error={errors.required}
              hint="Most institutions require 75%."
              onChange={(e) => {
                setRequired(e.target.value);
                setResult(null);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Calculate attendance</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setTotal("");
                setAttended("");
                setRequired(DEFAULT_REQUIRED);
                setErrors({});
                setResult(null);
              }}
            >
              <ResetIcon />
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {!result && Object.keys(errors).length === 0 && (
        <p className="text-ink-muted text-sm">
          Enter your class counts and choose &ldquo;Calculate attendance&rdquo;.
        </p>
      )}

      {result && (
        <ResultPanel
          title="Your attendance"
          actions={
            <>
              <CopyButton text={summary} label="Copy result" />
              <ShareButton title="My attendance" text={`${summary} (Toolora)`} />
            </>
          }
        >
          <BigNumber
            label="Current attendance"
            value={`${formatNumber(result.currentPercent)}%`}
          />
          <div className="mt-4 space-y-4">
            <Alert
              tone={result.meetsRequirement ? "success" : "warning"}
              title={result.meetsRequirement ? "Requirement met" : "Below requirement"}
            >
              {summary}
            </Alert>
            <StatGrid
              items={[
                {
                  label: "Required attendance",
                  value: `${required}%`,
                },
                result.meetsRequirement
                  ? { label: "Classes you can still miss", value: String(result.canMiss) }
                  : {
                      label: "Classes to attend in a row",
                      value:
                        result.mustAttend === null
                          ? "Not possible"
                          : String(result.mustAttend),
                    },
              ]}
            />
          </div>
        </ResultPanel>
      )}
    </div>
  );
}
