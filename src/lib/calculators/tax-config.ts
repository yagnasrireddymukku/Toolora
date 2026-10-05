/**
 * Indian income-tax and provident-fund parameters used by the CTC calculator.
 *
 * These are PUBLISHED RATES AT THE TIME OF WRITING and tax law changes often.
 * They are isolated here so they can be updated without touching calculation code,
 * and the UI shows them to the user as assumptions. They are not tax advice.
 */

export const TAX_ASSUMPTION_LABEL =
  "New tax regime, FY 2025-26 slabs (resident individual under 60)";

export interface TaxSlab {
  /** Upper bound of the slab in rupees (Infinity for the last slab). */
  upTo: number;
  /** Rate in percent. */
  rate: number;
}

export const NEW_REGIME_SLABS: TaxSlab[] = [
  { upTo: 400_000, rate: 0 },
  { upTo: 800_000, rate: 5 },
  { upTo: 1_200_000, rate: 10 },
  { upTo: 1_600_000, rate: 15 },
  { upTo: 2_000_000, rate: 20 },
  { upTo: 2_400_000, rate: 25 },
  { upTo: Infinity, rate: 30 },
];

/** Standard deduction for salaried individuals in the new regime. */
export const STANDARD_DEDUCTION = 75_000;

/** Taxable income up to which the section 87A rebate makes tax nil. */
export const REBATE_INCOME_LIMIT = 1_200_000;

/** Health and education cess on income tax. */
export const CESS_RATE = 0.04;

export const PF_RATE = 0.12;
/** Monthly basic-pay ceiling for the optional "capped" PF calculation. */
export const PF_WAGE_CEILING_MONTHLY = 15_000;
/** Employer gratuity accrual as a share of basic pay (15/26 × 1/12). */
export const GRATUITY_RATE = 0.0481;
