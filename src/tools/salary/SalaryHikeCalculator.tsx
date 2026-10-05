"use client";

import { useState } from "react";
import { CopyButton, ShareButton } from "@/components/tool/ActionButtons";
import { BigNumber, ResultPanel, StatGrid } from "@/components/tool/ResultPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectField, TextField } from "@/components/ui/Field";
import { ResetIcon } from "@/components/ui/icons";
import { Tabs } from "@/components/ui/Tabs";
import {
  calculateHike,
  calculateHikeFromNew,
  type HikeOutcome,
  type HikeResult,
  type SalaryPeriod,
} from "@/lib/calculators/salary";
import { formatCurrency, formatNumber, parseNumber } from "@/lib/format";

interface ModeProps {
  mode: "percent" | "new";
}

function HikeForm({ mode }: ModeProps) {
  const [current, setCurrent] = useState("");
  const [second, setSecond] = useState("");
  const [period, setPeriod] = useState<SalaryPeriod>("annual");
  const [errors, setErrors] = useState<{ current?: string; second?: string }>({});
  const [outcome, setOutcome] = useState<HikeOutcome | null>(null);

  const secondLabel = mode === "percent" ? "Hike (%)" : `New ${period} salary (₹)`;

  function submit() {
    const c = parseNumber(current);
    const s = parseNumber(second);
    const next: typeof errors = {};
    if (c === null) next.current = "Please enter your current salary.";
    if (s === null)
      next.second =
        mode === "percent"
          ? "Please enter the hike percentage."
          : "Please enter the new salary.";
    setErrors(next);
    if (c === null || s === null) {
      setOutcome(null);
      return;
    }
    setOutcome(
      mode === "percent"
        ? calculateHike(c, s, period)
        : calculateHikeFromNew(c, s, period),
    );
  }

  const result: HikeResult | null = outcome?.ok ? outcome.result : null;
  const summary = result
    ? `Salary hike of ${formatNumber(result.percent)}%: ${formatCurrency(result.currentAnnual)} to ${formatCurrency(result.newAnnual)} per year (${formatCurrency(result.hikeMonthly)} more per month).`
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
          <SelectField
            label="Salary is entered as"
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value as SalaryPeriod);
              setOutcome(null);
            }}
          >
            <option value="annual">Annual (per year)</option>
            <option value="monthly">Monthly (per month)</option>
          </SelectField>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label={`Current ${period} salary (₹)`}
              inputMode="decimal"
              value={current}
              error={errors.current}
              onChange={(e) => {
                setCurrent(e.target.value);
                setOutcome(null);
              }}
            />
            <TextField
              label={secondLabel}
              inputMode="decimal"
              value={second}
              error={errors.second}
              onChange={(e) => {
                setSecond(e.target.value);
                setOutcome(null);
              }}
            />
          </div>
          {outcome && !outcome.ok && (
            <Alert tone="error" title="Cannot calculate">
              {outcome.error}
            </Alert>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Calculate</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setCurrent("");
                setSecond("");
                setErrors({});
                setOutcome(null);
              }}
            >
              <ResetIcon />
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {result && (
        <ResultPanel
          actions={
            <>
              <CopyButton text={summary} label="Copy result" />
              <ShareButton title="Salary hike" text={`${summary} (Toolora)`} />
            </>
          }
        >
          <BigNumber
            label={
              mode === "percent"
                ? "New annual salary"
                : result.percent >= 0
                  ? "Hike percentage"
                  : "Change in salary"
            }
            value={
              mode === "percent"
                ? formatCurrency(result.newAnnual)
                : `${formatNumber(result.percent, 2)}%`
            }
          />
          <div className="mt-4">
            <StatGrid
              items={[
                {
                  label: "Hike percentage",
                  value: `${formatNumber(result.percent, 2)}%`,
                },
                {
                  label: "Hike amount (per year)",
                  value: formatCurrency(result.hikeAnnual),
                },
                {
                  label: "Hike amount (per month)",
                  value: formatCurrency(result.hikeMonthly),
                },
                {
                  label: "Current salary (per month)",
                  value: formatCurrency(result.currentMonthly),
                },
                {
                  label: "New salary (per month)",
                  value: formatCurrency(result.newMonthly),
                },
                {
                  label: "New salary (per year)",
                  value: formatCurrency(result.newAnnual),
                },
              ]}
            />
          </div>
          <p className="text-ink-soft mt-3 text-sm">
            These are gross (before tax and deductions) figures. For take-home pay use the
            CTC to in-hand calculator.
          </p>
        </ResultPanel>
      )}
    </div>
  );
}

export function SalaryHikeCalculator() {
  return (
    <Tabs
      label="Salary hike calculation type"
      items={[
        {
          id: "percent",
          label: "I know the hike %",
          content: <HikeForm mode="percent" />,
        },
        { id: "new", label: "I know the new salary", content: <HikeForm mode="new" /> },
      ]}
    />
  );
}
