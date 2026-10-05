import { describe, expect, it } from "vitest";
import {
  calculateCtc,
  calculateHike,
  calculateHikeFromNew,
  newRegimeTax,
  slabTax,
  type CtcInput,
} from "./salary";

const base: CtcInput = {
  annualCtc: 1_200_000,
  basicPercent: 40,
  hraPercent: 40,
  employerPfInCtc: true,
  capPfWage: false,
  gratuityInCtc: false,
  otherEmployerBenefits: 0,
  professionalTaxMonthly: 200,
  otherDeductionsMonthly: 0,
  taxMode: "estimate",
  manualAnnualTax: 0,
};

const ok = (input: CtcInput) => {
  const out = calculateCtc(input);
  if (!out.ok) throw new Error(JSON.stringify(out.errors));
  return out.result;
};

describe("tax slabs", () => {
  it("computes new-regime slab tax", () => {
    expect(slabTax(400_000)).toBe(0);
    expect(slabTax(800_000)).toBe(20_000);
    expect(slabTax(1_500_000)).toBe(105_000); // 20k + 40k + 3L×15%
    expect(slabTax(2_500_000)).toBe(20_000 + 40_000 + 60_000 + 80_000 + 100_000 + 30_000);
  });

  it("applies rebate, marginal relief and cess", () => {
    expect(newRegimeTax(1_200_000)).toBe(0);
    expect(newRegimeTax(1_210_000)).toBeCloseTo(10_000 * 1.04, 6); // marginal relief caps tax at the excess
    expect(newRegimeTax(1_500_000)).toBeCloseTo(105_000 * 1.04, 6);
    expect(newRegimeTax(0)).toBe(0);
  });
});

describe("calculateCtc", () => {
  it("produces a transparent breakdown for a ₹12 lakh CTC", () => {
    const r = ok(base);
    expect(r.earnings[0].annual).toBe(480_000); // basic
    expect(r.earnings[1].annual).toBe(192_000); // HRA
    expect(r.grossAnnual).toBeCloseTo(1_142_400, 6); // CTC - employer PF 57,600
    expect(r.earnings[2].annual).toBeCloseTo(470_400, 6); // balancing special allowance
    expect(r.annualTax).toBe(0); // taxable 10,67,400 is within the rebate
    expect(r.netAnnual).toBeCloseTo(1_142_400 - 57_600 - 2_400, 6);
    expect(r.netMonthly).toBeCloseTo(90_200, 6);
  });

  it("earnings add up to gross and gross + employer costs add up to CTC", () => {
    const r = ok({ ...base, gratuityInCtc: true, otherEmployerBenefits: 24_000 });
    const earnings = r.earnings.reduce((s, l) => s + l.annual, 0);
    const employer = r.employerCosts.reduce((s, l) => s + l.annual, 0);
    expect(earnings).toBeCloseTo(r.grossAnnual, 6);
    expect(r.grossAnnual + employer).toBeCloseTo(base.annualCtc, 6);
  });

  it("caps PF at the wage ceiling when asked", () => {
    const r = ok({ ...base, capPfWage: true });
    expect(r.deductions[0].annual).toBeCloseTo(0.12 * 15_000 * 12, 6); // 21,600
  });

  it("estimates income tax above the rebate limit", () => {
    const r = ok({ ...base, annualCtc: 2_500_000 });
    expect(r.annualTax).toBeGreaterThan(0);
    expect(r.netAnnual).toBeCloseTo(
      r.grossAnnual - r.deductions.reduce((s, l) => s + l.annual, 0),
      6,
    );
  });

  it("supports manual tax and no-tax modes", () => {
    expect(ok({ ...base, taxMode: "manual", manualAnnualTax: 50_000 }).annualTax).toBe(
      50_000,
    );
    expect(ok({ ...base, annualCtc: 3_000_000, taxMode: "none" }).annualTax).toBe(0);
  });

  it("rejects invalid inputs with field-level messages", () => {
    const bad = calculateCtc({ ...base, annualCtc: 0, basicPercent: 5, hraPercent: 150 });
    expect(bad.ok).toBe(false);
    if (!bad.ok)
      expect(Object.keys(bad.errors).sort()).toEqual([
        "annualCtc",
        "basicPercent",
        "hraPercent",
      ]);
  });

  it("rejects basic + HRA that exceed the available gross", () => {
    const bad = calculateCtc({ ...base, basicPercent: 100, hraPercent: 50 });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors.basicPercent).toMatch(/Lower the basic/);
  });
});

describe("salary hike", () => {
  it("computes new salary and differences from a percentage", () => {
    const out = calculateHike(1_000_000, 10, "annual");
    expect(out.ok && out.result.newAnnual).toBeCloseTo(1_100_000, 6);
    expect(out.ok && out.result.hikeAnnual).toBeCloseTo(100_000, 6);
    expect(out.ok && out.result.hikeMonthly).toBeCloseTo(100_000 / 12, 6);
    expect(out.ok && out.result.newMonthly).toBeCloseTo(1_100_000 / 12, 6);
  });

  it("accepts monthly salaries", () => {
    const out = calculateHike(50_000, 20, "monthly");
    expect(out.ok && out.result.currentAnnual).toBe(600_000);
    expect(out.ok && out.result.newMonthly).toBeCloseTo(60_000, 6);
  });

  it("derives the percentage from old and new salary", () => {
    const out = calculateHikeFromNew(800_000, 920_000, "annual");
    expect(out.ok && out.result.percent).toBeCloseTo(15, 6);
    const cut = calculateHikeFromNew(800_000, 600_000, "annual");
    expect(cut.ok && cut.result.percent).toBeCloseTo(-25, 6);
  });

  it("validates", () => {
    expect(calculateHike(0, 10, "annual").ok).toBe(false);
    expect(calculateHike(100, -100, "annual").ok).toBe(false);
    expect(calculateHike(100, 5000, "annual").ok).toBe(false);
    expect(calculateHikeFromNew(100, 0, "annual").ok).toBe(false);
  });
});
