/**
 * Indian income-tax and provident-fund parameters used by the CTC calculator.
 *
 * These are PUBLISHED RATES AT THE TIME OF WRITING and tax law changes often.
 * They are isolated here so they can be updated without touching calculation code,
 * and the UI shows them to the user as assumptions. They are not tax advice.
 */

export const TAX_ASSUMPTION_LABEL =
  "New tax regime slabs for FY 2025-26 and FY 2026-27 (resident individual under 60)";

/**
 * Review status (October 2026). Checked against official Government of India documents:
 *  - Slab rates: Income Tax Department "Salaried Individuals for AY 2026-27" page (new regime
 *    under section 115BAC), and the Finance Bill, 2026 explanatory memorandum
 *    (indiabudget.gov.in/doc/memo.pdf), which lists the same seven default slabs for tax year
 *    2026-27 under section 202 of the Income-tax Act, 2025 and states "no change proposed in
 *    tax rates".
 *  - Cess: the same memorandum, 4% on income-tax including surcharge.
 *  - Rebate: Income Tax Department page for AY 2026-27 (₹60,000, taxable income up to ₹12,00,000).
 *  - Standard deduction ₹75,000: PIB release on Union Budget 2025-26 and Income Tax Department
 *    guidance. The Budget 2026-27 speech and Finance Bill memorandum propose no change to it.
 * Not explicitly restated in an official FY 2026-27 document that was read: the rebate and
 * standard deduction (no change was proposed). Surcharge above ₹50 lakh is not modelled.
 * Re-check after every Budget.
 */
export const TAX_LAST_REVIEWED = "October 2026";
export const TAX_SOURCE_NOTE =
  "Slabs, cess, rebate and standard deduction were checked in October 2026 against Income Tax Department and Union Budget documents (no change was proposed for FY 2026-27). Surcharge on incomes above ₹50 lakh and old-regime deductions are not modelled. Rules can change, so confirm with official sources.";

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
