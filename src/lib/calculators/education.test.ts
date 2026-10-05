import { describe, expect, it } from "vitest";
import { calculateAttendance } from "./attendance";
import {
  calculateCgpaFromSemesters,
  calculateGpa,
  cgpaToPercentage,
  type SubjectRow,
} from "./grades";
import {
  decreaseBy,
  increaseBy,
  marksPercentage,
  percentChange,
  percentDifference,
  percentOf,
} from "./percentage";

const row = (id: string, credits: string, grade: string, name = ""): SubjectRow => ({
  id,
  name,
  credits,
  grade,
});

describe("calculateGpa", () => {
  it("computes the credit-weighted GPA on the 10-point scale", () => {
    // (4×9 + 3×8 + 2×10) / 9 = 80 / 9
    const out = calculateGpa(
      [row("1", "4", "A+"), row("2", "3", "A"), row("3", "2", "O")],
      "10-point",
    );
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.result.gpa).toBeCloseTo(80 / 9, 10);
      expect(out.result.totalCredits).toBe(9);
      expect(out.result.totalWeighted).toBe(80);
    }
  });

  it("supports the 4.0 scale", () => {
    const out = calculateGpa([row("1", "3", "A"), row("2", "3", "B")], "4-point");
    expect(out.ok && out.result.gpa).toBeCloseTo(3.5, 10);
  });

  it("supports custom grade points", () => {
    const out = calculateGpa([row("1", "2", "7.5"), row("2", "2", "8.5")], "custom");
    expect(out.ok && out.result.gpa).toBeCloseTo(8, 10);
  });

  it("ignores fully blank rows but flags partial ones", () => {
    const ok = calculateGpa([row("1", "3", "A"), row("2", "", "")], "10-point");
    expect(ok.ok).toBe(true);
    const bad = calculateGpa([row("1", "3", ""), row("2", "abc", "A")], "10-point");
    expect(bad.ok).toBe(false);
    if (!bad.ok) {
      expect(bad.rowErrors["1"].grade).toBeDefined();
      expect(bad.rowErrors["2"].credits).toBeDefined();
    }
  });

  it("rejects zero, negative and absurd credits", () => {
    for (const credits of ["0", "-2", "31", "1e3"]) {
      expect(calculateGpa([row("1", credits, "A")], "10-point").ok).toBe(false);
    }
  });

  it("asks for at least one subject when everything is blank", () => {
    const out = calculateGpa([row("1", "", "")], "10-point");
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.message).toMatch(/at least one subject/i);
  });
});

describe("calculateCgpaFromSemesters", () => {
  it("weights each SGPA by its credits", () => {
    const out = calculateCgpaFromSemesters(
      [
        { id: "1", name: "", sgpa: "8", credits: "20" },
        { id: "2", name: "", sgpa: "9", credits: "30" },
      ],
      10,
    );
    // (8×20 + 9×30) / 50 = 8.6
    expect(out.ok && out.result.cgpa).toBeCloseTo(8.6, 10);
  });

  it("rejects an SGPA above the scale maximum", () => {
    const out = calculateCgpaFromSemesters(
      [{ id: "1", name: "", sgpa: "11", credits: "20" }],
      10,
    );
    expect(out.ok).toBe(false);
  });
});

describe("cgpaToPercentage", () => {
  it("applies the documented 9.5 multiplier", () => {
    expect(cgpaToPercentage(8)).toBeCloseTo(76, 10);
  });
});

describe("percentage calculations", () => {
  const headline = (o: ReturnType<typeof percentOf>) =>
    o.ok ? o.result.headline : o.error;

  it("percent of a number", () => expect(headline(percentOf(15, 200))).toBe("30"));
  it("increase", () => expect(headline(increaseBy(200, 15))).toBe("230"));
  it("decrease", () => expect(headline(decreaseBy(200, 15))).toBe("170"));
  it("change reports increase and decrease", () => {
    expect(headline(percentChange(50, 75))).toBe("50%");
    const down = percentChange(80, 60);
    expect(down.ok && down.result.headlineLabel).toBe("Percentage decrease");
    expect(down.ok && down.result.headline).toBe("25%");
  });
  it("change from zero is rejected", () => expect(percentChange(0, 5).ok).toBe(false));
  it("difference is symmetric", () => {
    expect(headline(percentDifference(50, 100))).toBe(
      headline(percentDifference(100, 50)),
    );
    expect(headline(percentDifference(50, 100))).toBe("66.6667%");
  });
  it("difference of two zeros is rejected", () =>
    expect(percentDifference(0, 0).ok).toBe(false));
  it("marks percentage", () => expect(headline(marksPercentage(432, 500))).toBe("86.4%"));
  it("marks validation", () => {
    expect(marksPercentage(10, 0).ok).toBe(false);
    expect(marksPercentage(600, 500).ok).toBe(false);
    expect(marksPercentage(-1, 500).ok).toBe(false);
  });
});

describe("calculateAttendance", () => {
  const run = (total: number, attended: number, required = 75) => {
    const out = calculateAttendance({ total, attended, required });
    if (!out.ok) throw new Error(out.error);
    return out.result;
  };

  it("computes the current percentage", () => {
    expect(run(40, 30).currentPercent).toBe(75);
  });

  it("exactly at the requirement means 0 spare classes", () => {
    const r = run(40, 30);
    expect(r.meetsRequirement).toBe(true);
    expect(r.canMiss).toBe(0);
  });

  it("counts how many classes can be missed", () => {
    // 36/40 = 90%. Missing m: 36/(40+m) >= 0.75 -> m <= 8
    const r = run(40, 36);
    expect(r.canMiss).toBe(8);
    expect(36 / (40 + 8)).toBeGreaterThanOrEqual(0.75);
    expect(36 / (40 + 9)).toBeLessThan(0.75);
  });

  it("counts classes needed when below the requirement", () => {
    // 20/40 = 50%. Need (20+x)/(40+x) >= 0.75 -> x >= 40
    const r = run(40, 20);
    expect(r.meetsRequirement).toBe(false);
    expect(r.mustAttend).toBe(40);
    expect((20 + 40) / (40 + 40)).toBeGreaterThanOrEqual(0.75);
    expect((20 + 39) / (40 + 39)).toBeLessThan(0.75);
  });

  it("100% requirement cannot be reached after missing a class", () => {
    expect(run(10, 9, 100).mustAttend).toBeNull();
    expect(run(10, 10, 100).canMiss).toBe(0);
  });

  it("validates input", () => {
    expect(calculateAttendance({ total: 0, attended: 0, required: 75 }).ok).toBe(false);
    expect(calculateAttendance({ total: 10, attended: 11, required: 75 }).ok).toBe(false);
    expect(calculateAttendance({ total: 10, attended: 5, required: 0 }).ok).toBe(false);
    expect(calculateAttendance({ total: 10, attended: 5, required: 101 }).ok).toBe(false);
    expect(calculateAttendance({ total: 10.5, attended: 5, required: 75 }).ok).toBe(
      false,
    );
  });
});
