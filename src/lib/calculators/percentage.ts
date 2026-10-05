import { formatNumber } from "@/lib/format";

export type PercentageMode =
  "percent-of" | "increase" | "decrease" | "change" | "difference" | "marks";

export interface PercentageResult {
  /** Headline value, formatted. */
  headline: string;
  headlineLabel: string;
  /** Plain-language working so users can verify the maths. */
  steps: string[];
}

export type PercentageOutcome =
  { ok: true; result: PercentageResult } | { ok: false; error: string };

const fail = (error: string): PercentageOutcome => ({ ok: false, error });
const n = (v: number) => formatNumber(v, 4);

/** X% of Y. */
export function percentOf(percent: number, value: number): PercentageOutcome {
  const amount = (percent / 100) * value;
  return {
    ok: true,
    result: {
      headline: n(amount),
      headlineLabel: `${n(percent)}% of ${n(value)}`,
      steps: [`${n(percent)} ÷ 100 × ${n(value)} = ${n(amount)}`],
    },
  };
}

/** Increase `value` by `percent`%. */
export function increaseBy(value: number, percent: number): PercentageOutcome {
  const amount = (value * percent) / 100;
  const result = value + amount;
  return {
    ok: true,
    result: {
      headline: n(result),
      headlineLabel: `${n(value)} increased by ${n(percent)}%`,
      steps: [
        `Increase = ${n(value)} × ${n(percent)} ÷ 100 = ${n(amount)}`,
        `New value = ${n(value)} + ${n(amount)} = ${n(result)}`,
      ],
    },
  };
}

/** Decrease `value` by `percent`%. */
export function decreaseBy(value: number, percent: number): PercentageOutcome {
  const amount = (value * percent) / 100;
  const result = value - amount;
  return {
    ok: true,
    result: {
      headline: n(result),
      headlineLabel: `${n(value)} decreased by ${n(percent)}%`,
      steps: [
        `Decrease = ${n(value)} × ${n(percent)} ÷ 100 = ${n(amount)}`,
        `New value = ${n(value)} − ${n(amount)} = ${n(result)}`,
      ],
    },
  };
}

/** Percentage change from `from` to `to` (signed). */
export function percentChange(from: number, to: number): PercentageOutcome {
  if (from === 0)
    return fail(
      "The starting value cannot be 0, because a change from 0 has no percentage.",
    );
  const change = ((to - from) / Math.abs(from)) * 100;
  const direction = change > 0 ? "increase" : change < 0 ? "decrease" : "no change";
  return {
    ok: true,
    result: {
      headline: `${n(Math.abs(change))}%`,
      headlineLabel: direction === "no change" ? "No change" : `Percentage ${direction}`,
      steps: [
        `Change = ${n(to)} − ${n(from)} = ${n(to - from)}`,
        `${n(to - from)} ÷ ${n(Math.abs(from))} × 100 = ${n(change)}%`,
      ],
    },
  };
}

/** Symmetric percentage difference: |a − b| ÷ average(a, b) × 100. */
export function percentDifference(a: number, b: number): PercentageOutcome {
  const average = (Math.abs(a) + Math.abs(b)) / 2;
  if (average === 0) return fail("At least one value must be non-zero.");
  const diff = (Math.abs(a - b) / average) * 100;
  return {
    ok: true,
    result: {
      headline: `${n(diff)}%`,
      headlineLabel: "Percentage difference",
      steps: [
        `Average = (${n(Math.abs(a))} + ${n(Math.abs(b))}) ÷ 2 = ${n(average)}`,
        `Difference = |${n(a)} − ${n(b)}| = ${n(Math.abs(a - b))}`,
        `${n(Math.abs(a - b))} ÷ ${n(average)} × 100 = ${n(diff)}%`,
      ],
    },
  };
}

/** Marks percentage: obtained ÷ total × 100. */
export function marksPercentage(obtained: number, total: number): PercentageOutcome {
  if (total <= 0) return fail("Total marks must be greater than 0.");
  if (obtained < 0) return fail("Marks obtained cannot be negative.");
  if (obtained > total) return fail("Marks obtained cannot be more than total marks.");
  const pct = (obtained / total) * 100;
  return {
    ok: true,
    result: {
      headline: `${n(pct)}%`,
      headlineLabel: "Marks percentage",
      steps: [`${n(obtained)} ÷ ${n(total)} × 100 = ${n(pct)}%`],
    },
  };
}
