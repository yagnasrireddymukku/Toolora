/** Strict numeric parsing and formatting shared by all calculators. */

/**
 * Parses user input into a finite number. Accepts thousands separators
 * (commas or spaces, so "1,00,000" works). Returns null for empty or invalid input.
 */
export function parseNumber(input: string): number | null {
  const cleaned = input.trim().replace(/[,\s]/g, "");
  if (cleaned === "") return null;
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Rounds to `digits` decimals and drops needless trailing zeros. */
export function formatNumber(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "–";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(n);
}

/** Fixed decimals, e.g. 8.50 (used for GPA/CGPA where trailing zeros are meaningful). */
export function formatFixed(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "–";
  return n.toFixed(digits);
}

export function formatCurrency(n: number, currency = "INR"): string {
  if (!Number.isFinite(n)) return "–";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPercent(n: number, digits = 2): string {
  return `${formatNumber(n, digits)}%`;
}
