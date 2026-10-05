import {
  CESS_RATE,
  GRATUITY_RATE,
  NEW_REGIME_SLABS,
  PF_RATE,
  PF_WAGE_CEILING_MONTHLY,
  REBATE_INCOME_LIMIT,
  STANDARD_DEDUCTION,
} from "./tax-config";

export type TaxMode = "estimate" | "manual" | "none";

export interface CtcInput {
  annualCtc: number;
  /** Basic pay as a percentage of CTC. */
  basicPercent: number;
  /** HRA as a percentage of basic pay. */
  hraPercent: number;
  /** Employer PF is carved out of CTC (true for most offers). */
  employerPfInCtc: boolean;
  /** Limit PF to the ₹15,000/month wage ceiling instead of full basic. */
  capPfWage: boolean;
  gratuityInCtc: boolean;
  /** Annual non-cash employer cost inside CTC, e.g. insurance. */
  otherEmployerBenefits: number;
  professionalTaxMonthly: number;
  otherDeductionsMonthly: number;
  taxMode: TaxMode;
  /** Used when taxMode is "manual". */
  manualAnnualTax: number;
}

export interface SalaryLine {
  label: string;
  annual: number;
  monthly: number;
}

export interface CtcResult {
  earnings: SalaryLine[];
  grossAnnual: number;
  deductions: SalaryLine[];
  employerCosts: SalaryLine[];
  annualTax: number;
  taxableIncome: number;
  netAnnual: number;
  netMonthly: number;
  /** Net as a share of CTC. */
  netShareOfCtc: number;
}

export type CtcOutcome =
  | { ok: true; result: CtcResult }
  | { ok: false; errors: Partial<Record<keyof CtcInput, string>> };

export function slabTax(taxable: number): number {
  let tax = 0;
  let lower = 0;
  for (const { upTo, rate } of NEW_REGIME_SLABS) {
    if (taxable > lower) tax += (Math.min(taxable, upTo) - lower) * (rate / 100);
    lower = upTo;
    if (taxable <= upTo) break;
  }
  return tax;
}

/**
 * Annual income tax under the new regime: slab tax, section 87A rebate with marginal
 * relief just above the rebate limit, then 4% cess. `taxable` is income after the standard deduction.
 */
export function newRegimeTax(taxable: number): number {
  if (taxable <= 0) return 0;
  let tax = slabTax(taxable);
  if (taxable <= REBATE_INCOME_LIMIT) tax = 0;
  else tax = Math.min(tax, taxable - REBATE_INCOME_LIMIT);
  return tax * (1 + CESS_RATE);
}

const perMonth = (annual: number) => annual / 12;
const line = (label: string, annual: number): SalaryLine => ({
  label,
  annual,
  monthly: perMonth(annual),
});

export function validateCtc(input: CtcInput): Partial<Record<keyof CtcInput, string>> {
  const e: Partial<Record<keyof CtcInput, string>> = {};
  if (!(input.annualCtc > 0)) e.annualCtc = "Enter an annual CTC greater than 0.";
  else if (input.annualCtc > 1_000_000_000)
    e.annualCtc = "That amount looks too large. Please check it.";
  if (!(input.basicPercent >= 10 && input.basicPercent <= 100))
    e.basicPercent = "Enter basic pay between 10% and 100% of CTC.";
  if (!(input.hraPercent >= 0 && input.hraPercent <= 100))
    e.hraPercent = "Enter HRA between 0% and 100% of basic.";
  if (!(input.otherEmployerBenefits >= 0))
    e.otherEmployerBenefits = "Enter 0 or a positive amount.";
  if (!(input.professionalTaxMonthly >= 0 && input.professionalTaxMonthly <= 1000))
    e.professionalTaxMonthly = "Enter professional tax between 0 and 1,000 per month.";
  if (!(input.otherDeductionsMonthly >= 0))
    e.otherDeductionsMonthly = "Enter 0 or a positive amount.";
  if (input.taxMode === "manual" && !(input.manualAnnualTax >= 0))
    e.manualAnnualTax = "Enter 0 or a positive annual tax amount.";
  return e;
}

export function calculateCtc(input: CtcInput): CtcOutcome {
  const errors = validateCtc(input);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const basic = (input.annualCtc * input.basicPercent) / 100;
  const pfWageMonthly = input.capPfWage
    ? Math.min(basic / 12, PF_WAGE_CEILING_MONTHLY)
    : basic / 12;
  const employeePf = PF_RATE * pfWageMonthly * 12;
  const employerPf = input.employerPfInCtc ? employeePf : 0;
  const gratuity = input.gratuityInCtc ? basic * GRATUITY_RATE : 0;

  const grossAnnual =
    input.annualCtc - employerPf - gratuity - input.otherEmployerBenefits;
  const hra = (basic * input.hraPercent) / 100;
  const special = grossAnnual - basic - hra;

  if (grossAnnual <= 0) {
    return {
      ok: false,
      errors: {
        otherEmployerBenefits:
          "Employer contributions and benefits are as large as the whole CTC. Please reduce them.",
      },
    };
  }
  if (special < -0.005) {
    return {
      ok: false,
      errors: {
        basicPercent:
          "Basic pay plus HRA is more than the monthly pay your CTC allows. Lower the basic % or HRA %.",
      },
    };
  }

  const taxableIncome = Math.max(0, grossAnnual - STANDARD_DEDUCTION);
  const annualTax =
    input.taxMode === "estimate"
      ? newRegimeTax(taxableIncome)
      : input.taxMode === "manual"
        ? input.manualAnnualTax
        : 0;

  const professionalTax = input.professionalTaxMonthly * 12;
  const otherDeductions = input.otherDeductionsMonthly * 12;
  const totalDeductions = employeePf + professionalTax + otherDeductions + annualTax;
  const netAnnual = grossAnnual - totalDeductions;

  return {
    ok: true,
    result: {
      earnings: [
        line("Basic pay", basic),
        line("House rent allowance (HRA)", hra),
        line("Special / other allowances", Math.max(0, special)),
      ],
      grossAnnual,
      deductions: [
        line("Employee PF", employeePf),
        line("Professional tax", professionalTax),
        line("Other deductions", otherDeductions),
        line(
          input.taxMode === "none" ? "Income tax (not included)" : "Income tax (TDS)",
          annualTax,
        ),
      ],
      employerCosts: [
        line("Employer PF", employerPf),
        line("Gratuity", gratuity),
        line("Other employer benefits", input.otherEmployerBenefits),
      ].filter((l) => l.annual > 0),
      annualTax,
      taxableIncome,
      netAnnual,
      netMonthly: perMonth(netAnnual),
      netShareOfCtc: (netAnnual / input.annualCtc) * 100,
    },
  };
}

export interface HikeResult {
  currentAnnual: number;
  currentMonthly: number;
  newAnnual: number;
  newMonthly: number;
  hikeAnnual: number;
  hikeMonthly: number;
  percent: number;
}

export type HikeOutcome = { ok: true; result: HikeResult } | { ok: false; error: string };

function buildHike(currentAnnual: number, newAnnual: number): HikeResult {
  return {
    currentAnnual,
    currentMonthly: currentAnnual / 12,
    newAnnual,
    newMonthly: newAnnual / 12,
    hikeAnnual: newAnnual - currentAnnual,
    hikeMonthly: (newAnnual - currentAnnual) / 12,
    percent: ((newAnnual - currentAnnual) / currentAnnual) * 100,
  };
}

export type SalaryPeriod = "annual" | "monthly";

const toAnnual = (amount: number, period: SalaryPeriod) =>
  period === "annual" ? amount : amount * 12;

/** New salary from a hike percentage. */
export function calculateHike(
  current: number,
  percent: number,
  period: SalaryPeriod,
): HikeOutcome {
  if (!(current > 0))
    return { ok: false, error: "Enter a current salary greater than 0." };
  if (!(percent > -100 && percent <= 1000))
    return { ok: false, error: "Enter a hike between -99.99% and 1000%." };
  const currentAnnual = toAnnual(current, period);
  return {
    ok: true,
    result: buildHike(currentAnnual, currentAnnual * (1 + percent / 100)),
  };
}

/** Hike percentage implied by an old and a new salary. */
export function calculateHikeFromNew(
  current: number,
  next: number,
  period: SalaryPeriod,
): HikeOutcome {
  if (!(current > 0))
    return { ok: false, error: "Enter a current salary greater than 0." };
  if (!(next > 0)) return { ok: false, error: "Enter a new salary greater than 0." };
  return {
    ok: true,
    result: buildHike(toAnnual(current, period), toAnnual(next, period)),
  };
}
