"use client";

import { useState } from "react";
import { CopyButton, ShareButton } from "@/components/tool/ActionButtons";
import { BigNumber, ResultPanel } from "@/components/tool/ResultPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { ResetIcon } from "@/components/ui/icons";
import { Tabs } from "@/components/ui/Tabs";
import {
  decreaseBy,
  increaseBy,
  marksPercentage,
  percentChange,
  percentDifference,
  percentOf,
  type PercentageMode,
  type PercentageOutcome,
} from "@/lib/calculators/percentage";
import { parseNumber } from "@/lib/format";

interface ModeConfig {
  id: PercentageMode;
  tab: string;
  fields: [string, string];
  /** Per-field rule; returns an error message or null. */
  check?: [(v: number) => string | null, (v: number) => string | null];
  compute: (a: number, b: number) => PercentageOutcome;
  description: string;
}

const nonNegative = (v: number) => (v < 0 ? "Enter 0 or a positive number." : null);

const MODES: ModeConfig[] = [
  {
    id: "percent-of",
    tab: "% of a number",
    fields: ["Percentage (%)", "Number"],
    compute: percentOf,
    description: "What is X% of Y? For example, 15% of 200.",
  },
  {
    id: "increase",
    tab: "Increase by %",
    fields: ["Starting value", "Increase (%)"],
    compute: increaseBy,
    description: "Add a percentage to a value, such as a price rise or salary hike.",
  },
  {
    id: "decrease",
    tab: "Decrease by %",
    fields: ["Starting value", "Decrease (%)"],
    compute: decreaseBy,
    description: "Subtract a percentage from a value, such as a discount.",
  },
  {
    id: "change",
    tab: "% change",
    fields: ["Old value", "New value"],
    compute: percentChange,
    description: "How much did a value rise or fall between an old and a new value?",
  },
  {
    id: "difference",
    tab: "% difference",
    fields: ["First value", "Second value"],
    compute: percentDifference,
    description: "Compare two values when neither is the starting point.",
  },
  {
    id: "marks",
    tab: "Marks %",
    fields: ["Marks obtained", "Total marks"],
    check: [nonNegative, nonNegative],
    compute: marksPercentage,
    description: "Convert marks into a percentage of the total.",
  },
];

function ModeForm({ mode }: { mode: ModeConfig }) {
  const [values, setValues] = useState<[string, string]>(["", ""]);
  const [errors, setErrors] = useState<[string?, string?]>([]);
  const [outcome, setOutcome] = useState<PercentageOutcome | null>(null);

  function submit() {
    const parsed = values.map((v) => parseNumber(v));
    const nextErrors: [string?, string?] = [
      parsed[0] === null
        ? "Please enter a valid number."
        : (mode.check?.[0](parsed[0]) ?? undefined),
      parsed[1] === null
        ? "Please enter a valid number."
        : (mode.check?.[1](parsed[1]) ?? undefined),
    ];
    setErrors(nextErrors);
    if (nextErrors[0] || nextErrors[1]) {
      setOutcome(null);
      return;
    }
    setOutcome(mode.compute(parsed[0] as number, parsed[1] as number));
  }

  const result = outcome?.ok ? outcome.result : null;
  const copy = result
    ? `${result.headlineLabel}: ${result.headline}\n${result.steps.join("\n")}`
    : "";

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-ink-soft mb-4">{mode.description}</p>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <TextField
                key={i}
                label={mode.fields[i]}
                inputMode="decimal"
                value={values[i]}
                error={errors[i]}
                onChange={(e) => {
                  const next: [string, string] = [...values];
                  next[i] = e.target.value;
                  setValues(next);
                  setOutcome(null);
                }}
              />
            ))}
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
                setValues(["", ""]);
                setErrors([]);
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
              <CopyButton text={copy} label="Copy result" />
              <ShareButton
                title="Percentage result"
                text={`${result.headlineLabel}: ${result.headline} (Toolora)`}
              />
            </>
          }
        >
          <BigNumber label={result.headlineLabel} value={result.headline} />
          <h3 className="mt-4 font-semibold">Working</h3>
          <ul className="text-ink-soft mt-1 list-disc space-y-1 pl-5">
            {result.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </ResultPanel>
      )}
    </div>
  );
}

export function PercentageCalculator() {
  return (
    <Tabs
      label="Percentage calculation type"
      items={MODES.map((m) => ({
        id: m.id,
        label: m.tab,
        content: <ModeForm mode={m} />,
      }))}
    />
  );
}
