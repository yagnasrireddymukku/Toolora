"use client";

import { useState } from "react";
import {
  CopyButton,
  DownloadTextButton,
  ShareButton,
} from "@/components/tool/ActionButtons";
import { BigNumber, ResultPanel, StatGrid } from "@/components/tool/ResultPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckboxField, SelectField, TextField } from "@/components/ui/Field";
import { ResetIcon } from "@/components/ui/icons";
import {
  calculateCtc,
  type CtcInput,
  type CtcResult,
  type SalaryLine,
  type TaxMode,
} from "@/lib/calculators/salary";
import {
  CESS_RATE,
  PF_WAGE_CEILING_MONTHLY,
  STANDARD_DEDUCTION,
  TAX_ASSUMPTION_LABEL,
} from "@/lib/calculators/tax-config";
import { toCsv } from "@/lib/csv";
import { formatCurrency, formatNumber, parseNumber } from "@/lib/format";

interface FormState {
  annualCtc: string;
  basicPercent: string;
  hraPercent: string;
  employerPfInCtc: boolean;
  capPfWage: boolean;
  gratuityInCtc: boolean;
  otherEmployerBenefits: string;
  professionalTaxMonthly: string;
  otherDeductionsMonthly: string;
  taxMode: TaxMode;
  manualAnnualTax: string;
}

const DEFAULTS: FormState = {
  annualCtc: "",
  basicPercent: "40",
  hraPercent: "40",
  employerPfInCtc: true,
  capPfWage: false,
  gratuityInCtc: false,
  otherEmployerBenefits: "0",
  professionalTaxMonthly: "200",
  otherDeductionsMonthly: "0",
  taxMode: "estimate",
  manualAnnualTax: "0",
};

type Errors = Partial<Record<keyof FormState, string>>;

const NUMBER_FIELDS: (keyof FormState)[] = [
  "annualCtc",
  "basicPercent",
  "hraPercent",
  "otherEmployerBenefits",
  "professionalTaxMonthly",
  "otherDeductionsMonthly",
  "manualAnnualTax",
];

function SalaryTable({
  title,
  lines,
  total,
}: {
  title: string;
  lines: SalaryLine[];
  total?: SalaryLine;
}) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white">
      <table className="w-full min-w-[22rem] text-left text-sm">
        <caption className="text-ink p-2 text-left font-semibold">{title}</caption>
        <thead className="border-line text-ink-muted border-b">
          <tr>
            <th scope="col" className="p-2">
              Component
            </th>
            <th scope="col" className="p-2 text-right">
              Monthly
            </th>
            <th scope="col" className="p-2 text-right">
              Annual
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.label} className="border-line border-b last:border-0">
              <th scope="row" className="p-2 font-normal">
                {l.label}
              </th>
              <td className="p-2 text-right">{formatCurrency(l.monthly)}</td>
              <td className="p-2 text-right">{formatCurrency(l.annual)}</td>
            </tr>
          ))}
        </tbody>
        {total && (
          <tfoot className="font-semibold">
            <tr>
              <th scope="row" className="p-2">
                {total.label}
              </th>
              <td className="p-2 text-right">{formatCurrency(total.monthly)}</td>
              <td className="p-2 text-right">{formatCurrency(total.annual)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function buildReport(r: CtcResult, ctc: number): (string | number)[][] {
  const rows: (string | number)[][] = [["Component", "Monthly (INR)", "Annual (INR)"]];
  const add = (l: SalaryLine) =>
    rows.push([l.label, Math.round(l.monthly), Math.round(l.annual)]);
  rows.push(["Annual CTC", Math.round(ctc / 12), Math.round(ctc)]);
  rows.push(["EARNINGS", "", ""]);
  r.earnings.forEach(add);
  rows.push(["Gross salary", Math.round(r.grossAnnual / 12), Math.round(r.grossAnnual)]);
  rows.push(["DEDUCTIONS", "", ""]);
  r.deductions.forEach(add);
  rows.push(["IN-HAND SALARY", Math.round(r.netMonthly), Math.round(r.netAnnual)]);
  if (r.employerCosts.length) {
    rows.push(["EMPLOYER CONTRIBUTIONS (inside CTC)", "", ""]);
    r.employerCosts.forEach(add);
  }
  rows.push([
    "Estimate only. Actual pay depends on your employer's salary structure and tax rules.",
    "",
    "",
  ]);
  return rows;
}

export function CtcCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<CtcResult | null>(null);
  const [ctcUsed, setCtcUsed] = useState(0);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setResult(null);
  }

  function submit() {
    const nextErrors: Errors = {};
    const parsed: Partial<Record<keyof FormState, number>> = {};
    for (const key of NUMBER_FIELDS) {
      // The manual tax field only matters in manual mode.
      if (key === "manualAnnualTax" && form.taxMode !== "manual") {
        parsed[key] = 0;
        continue;
      }
      const n = parseNumber(form[key] as string);
      if (n === null) nextErrors[key] = "Please enter a valid number.";
      else parsed[key] = n;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setResult(null);
      return;
    }
    const input: CtcInput = {
      annualCtc: parsed.annualCtc!,
      basicPercent: parsed.basicPercent!,
      hraPercent: parsed.hraPercent!,
      employerPfInCtc: form.employerPfInCtc,
      capPfWage: form.capPfWage,
      gratuityInCtc: form.gratuityInCtc,
      otherEmployerBenefits: parsed.otherEmployerBenefits!,
      professionalTaxMonthly: parsed.professionalTaxMonthly!,
      otherDeductionsMonthly: parsed.otherDeductionsMonthly!,
      taxMode: form.taxMode,
      manualAnnualTax: parsed.manualAnnualTax!,
    };
    const outcome = calculateCtc(input);
    if (!outcome.ok) {
      setErrors(outcome.errors as Errors);
      setResult(null);
      return;
    }
    setErrors({});
    setCtcUsed(input.annualCtc);
    setResult(outcome.result);
  }

  const summary = result
    ? `Estimated in-hand salary: ${formatCurrency(result.netMonthly)} per month (${formatCurrency(result.netAnnual)} per year) on a CTC of ${formatCurrency(ctcUsed)}.`
    : "";
  const csv = result ? toCsv(buildReport(result, ctcUsed)) : "";
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-5"
        >
          <TextField
            label="Annual CTC (₹)"
            inputMode="decimal"
            value={form.annualCtc}
            error={errors.annualCtc}
            hint="Total yearly cost-to-company. If part of it is variable pay, enter only the fixed part."
            onChange={(e) => set("annualCtc", e.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Basic pay (% of CTC)"
              inputMode="decimal"
              value={form.basicPercent}
              error={errors.basicPercent}
              hint="Commonly 40–50%."
              onChange={(e) => set("basicPercent", e.target.value)}
            />
            <TextField
              label="HRA (% of basic)"
              inputMode="decimal"
              value={form.hraPercent}
              error={errors.hraPercent}
              hint="Commonly 40–50% of basic."
              onChange={(e) => set("hraPercent", e.target.value)}
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-base font-semibold">
              Employer contributions inside CTC
            </legend>
            <CheckboxField
              label="Employer PF is part of my CTC"
              hint="12% of basic is deducted from CTC before your gross salary."
              checked={form.employerPfInCtc}
              onChange={(e) => set("employerPfInCtc", e.target.checked)}
            />
            <CheckboxField
              label={`Calculate PF on the ₹${formatNumber(PF_WAGE_CEILING_MONTHLY)} monthly wage ceiling`}
              hint="Some employers cap PF at this ceiling instead of using full basic. Applies to both employee and employer PF."
              checked={form.capPfWage}
              onChange={(e) => set("capPfWage", e.target.checked)}
            />
            <CheckboxField
              label="Gratuity is part of my CTC"
              hint="Adds about 4.81% of basic pay as an employer cost, paid only on leaving after 5 years."
              checked={form.gratuityInCtc}
              onChange={(e) => set("gratuityInCtc", e.target.checked)}
            />
            <TextField
              label="Other employer benefits inside CTC, per year (₹)"
              inputMode="decimal"
              value={form.otherEmployerBenefits}
              error={errors.otherEmployerBenefits}
              hint="For example group insurance. These are not paid to you in cash."
              onChange={(e) => set("otherEmployerBenefits", e.target.value)}
            />
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-1 text-base font-semibold">Deductions</legend>
            <TextField
              label="Professional tax, per month (₹)"
              inputMode="decimal"
              value={form.professionalTaxMonthly}
              error={errors.professionalTaxMonthly}
              hint="Depends on your state. Often ₹200 or less."
              onChange={(e) => set("professionalTaxMonthly", e.target.value)}
            />
            <TextField
              label="Other deductions, per month (₹)"
              inputMode="decimal"
              value={form.otherDeductionsMonthly}
              error={errors.otherDeductionsMonthly}
              hint="For example insurance premiums or voluntary PF."
              onChange={(e) => set("otherDeductionsMonthly", e.target.value)}
            />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-base font-semibold">Income tax</legend>
            <SelectField
              label="How should income tax be handled?"
              value={form.taxMode}
              onChange={(e) => set("taxMode", e.target.value as TaxMode)}
              hint={
                form.taxMode === "estimate"
                  ? `Estimate uses: ${TAX_ASSUMPTION_LABEL}.`
                  : undefined
              }
            >
              <option value="estimate">Estimate it (new tax regime)</option>
              <option value="manual">I will enter my yearly tax</option>
              <option value="none">Do not include income tax</option>
            </SelectField>
            {form.taxMode === "manual" && (
              <TextField
                label="Annual income tax (₹)"
                inputMode="decimal"
                value={form.manualAnnualTax}
                error={errors.manualAnnualTax}
                hint="Use this for the old tax regime or if you know your TDS."
                onChange={(e) => set("manualAnnualTax", e.target.value)}
              />
            )}
          </fieldset>

          {hasErrors && (
            <Alert tone="error" title="Please fix the highlighted fields">
              Check the values marked above and try again.
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit">Calculate in-hand salary</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setForm(DEFAULTS);
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

      {!result && !hasErrors && (
        <p className="text-ink-muted text-sm">
          Enter your annual CTC and choose &ldquo;Calculate in-hand salary&rdquo;.
        </p>
      )}

      {result && (
        <ResultPanel
          title="Estimated in-hand salary"
          actions={
            <>
              <CopyButton text={summary} label="Copy summary" />
              <DownloadTextButton
                filename="ctc-to-inhand-salary.csv"
                content={csv}
                mime="text/csv"
                label="Download CSV"
              />
              <ShareButton
                title="My estimated in-hand salary"
                text={`${summary} (Toolora)`}
              />
            </>
          }
        >
          <BigNumber
            label="Monthly in-hand (estimate)"
            value={formatCurrency(result.netMonthly)}
          />
          <div className="mt-4">
            <StatGrid
              items={[
                { label: "Annual in-hand", value: formatCurrency(result.netAnnual) },
                {
                  label: "In-hand as share of CTC",
                  value: `${formatNumber(result.netShareOfCtc, 1)}%`,
                },
                {
                  label: "Gross salary (per year)",
                  value: formatCurrency(result.grossAnnual),
                },
                {
                  label: "Estimated income tax (per year)",
                  value: formatCurrency(result.annualTax),
                },
              ]}
            />
          </div>
          <div className="mt-5 space-y-4">
            <SalaryTable
              title="Earnings"
              lines={result.earnings}
              total={{
                label: "Gross salary",
                annual: result.grossAnnual,
                monthly: result.grossAnnual / 12,
              }}
            />
            <SalaryTable
              title="Deductions"
              lines={result.deductions}
              total={{
                label: "In-hand salary",
                annual: result.netAnnual,
                monthly: result.netMonthly,
              }}
            />
            {result.employerCosts.length > 0 && (
              <SalaryTable
                title="Employer contributions inside your CTC (not paid monthly)"
                lines={result.employerCosts}
              />
            )}
          </div>
          <div className="mt-5">
            <Alert tone="warning" title="Estimate, not tax advice">
              <p>
                Actual take-home pay depends on your employer&rsquo;s salary structure,
                your declarations and the tax rules that apply to you. Income tax here is{" "}
                {form.taxMode === "estimate"
                  ? `estimated on ${formatCurrency(result.taxableIncome)} taxable income (gross less the ₹${formatNumber(STANDARD_DEDUCTION)} standard deduction) using ${TAX_ASSUMPTION_LABEL}, with 87A rebate and ${CESS_RATE * 100}% cess`
                  : form.taxMode === "manual"
                    ? "the amount you entered"
                    : "not included"}
                . Confirm your exact figures with your employer or a qualified tax
                professional.
              </p>
            </Alert>
          </div>
        </ResultPanel>
      )}
    </div>
  );
}
