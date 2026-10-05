import { parseNumber } from "@/lib/format";

export interface GradeOption {
  label: string;
  points: number;
}

export interface GradeScale {
  id: string;
  name: string;
  maxPoints: number;
  grades: GradeOption[];
  /** Documented assumption shown to the user. */
  note: string;
}

/**
 * Built-in grade-point scales. These are common defaults, not any one
 * university's official table, so the UI states the mapping and lets users
 * enter grade points directly ("custom"). Add institution-specific scales here.
 */
export const GRADE_SCALES: GradeScale[] = [
  {
    id: "10-point",
    name: "10-point scale (O, A+, A, B+, B, C, P, F)",
    maxPoints: 10,
    grades: [
      { label: "O", points: 10 },
      { label: "A+", points: 9 },
      { label: "A", points: 8 },
      { label: "B+", points: 7 },
      { label: "B", points: 6 },
      { label: "C", points: 5 },
      { label: "P", points: 4 },
      { label: "F", points: 0 },
    ],
    note: "A widely used 10-point mapping. Some universities use different points for the same letters, so check your own grade table and use custom grade points if it differs.",
  },
  {
    id: "4-point",
    name: "4.0 scale (A, A-, B+, B, B-, C+, C, D, F)",
    maxPoints: 4,
    grades: [
      { label: "A", points: 4 },
      { label: "A-", points: 3.7 },
      { label: "B+", points: 3.3 },
      { label: "B", points: 3 },
      { label: "B-", points: 2.7 },
      { label: "C+", points: 2.3 },
      { label: "C", points: 2 },
      { label: "D", points: 1 },
      { label: "F", points: 0 },
    ],
    note: "The common US-style 4.0 mapping. Some institutions omit plus/minus grades or weight them differently.",
  },
];

export const CUSTOM_SCALE_ID = "custom";
export const MAX_CREDITS = 30;
export const MAX_CUSTOM_POINTS = 100;

export interface SubjectRow {
  id: string;
  name: string;
  credits: string;
  /** Grade label for built-in scales, or a numeric string for the custom scale. */
  grade: string;
}

export interface RowErrors {
  credits?: string;
  grade?: string;
}

export interface GpaLine {
  name: string;
  credits: number;
  points: number;
  weighted: number;
}

export interface GpaResult {
  gpa: number;
  totalCredits: number;
  totalWeighted: number;
  lines: GpaLine[];
}

export type GpaOutcome =
  | { ok: true; result: GpaResult }
  | { ok: false; rowErrors: Record<string, RowErrors>; message?: string };

export function getScale(id: string): GradeScale | undefined {
  return GRADE_SCALES.find((s) => s.id === id);
}

function isBlank(row: SubjectRow): boolean {
  return row.credits.trim() === "" && row.grade.trim() === "";
}

/** Resolve a row's grade into grade points for the given scale, or null if invalid. */
export function resolvePoints(scaleId: string, grade: string): number | null {
  if (scaleId === CUSTOM_SCALE_ID) {
    const n = parseNumber(grade);
    return n !== null && n >= 0 && n <= MAX_CUSTOM_POINTS ? n : null;
  }
  const found = getScale(scaleId)?.grades.find((g) => g.label === grade);
  return found ? found.points : null;
}

/**
 * GPA = Σ(credits × grade points) / Σ(credits).
 * Fully blank rows are ignored; partially filled rows are reported as errors.
 */
export function calculateGpa(rows: SubjectRow[], scaleId: string): GpaOutcome {
  const rowErrors: Record<string, RowErrors> = {};
  const lines: GpaLine[] = [];

  rows.forEach((row, index) => {
    if (isBlank(row)) return;
    const errors: RowErrors = {};
    const credits = parseNumber(row.credits);
    if (credits === null || credits <= 0 || credits > MAX_CREDITS) {
      errors.credits = `Enter credits greater than 0 and up to ${MAX_CREDITS}.`;
    }
    const points = resolvePoints(scaleId, row.grade);
    if (points === null) {
      errors.grade =
        scaleId === CUSTOM_SCALE_ID
          ? `Enter grade points between 0 and ${MAX_CUSTOM_POINTS}.`
          : "Choose a grade.";
    }
    if (errors.credits || errors.grade) {
      rowErrors[row.id] = errors;
      return;
    }
    lines.push({
      name: row.name.trim() || `Subject ${index + 1}`,
      credits: credits as number,
      points: points as number,
      weighted: (credits as number) * (points as number),
    });
  });

  if (Object.keys(rowErrors).length > 0) return { ok: false, rowErrors };
  if (lines.length === 0) {
    return {
      ok: false,
      rowErrors: {},
      message: "Add at least one subject with credits and a grade.",
    };
  }

  const totalCredits = lines.reduce((s, l) => s + l.credits, 0);
  const totalWeighted = lines.reduce((s, l) => s + l.weighted, 0);
  return {
    ok: true,
    result: { gpa: totalWeighted / totalCredits, totalCredits, totalWeighted, lines },
  };
}

export interface SemesterRow {
  id: string;
  name: string;
  sgpa: string;
  credits: string;
}

export interface SemesterErrors {
  sgpa?: string;
  credits?: string;
}

export interface CgpaFromSemestersResult {
  cgpa: number;
  totalCredits: number;
  lines: { name: string; sgpa: number; credits: number }[];
}

export type CgpaFromSemestersOutcome =
  | { ok: true; result: CgpaFromSemestersResult }
  | { ok: false; rowErrors: Record<string, SemesterErrors>; message?: string };

/** CGPA = Σ(SGPA × semester credits) / Σ(semester credits). */
export function calculateCgpaFromSemesters(
  rows: SemesterRow[],
  maxPoints: number,
): CgpaFromSemestersOutcome {
  const rowErrors: Record<string, SemesterErrors> = {};
  const lines: CgpaFromSemestersResult["lines"] = [];

  rows.forEach((row, index) => {
    if (row.sgpa.trim() === "" && row.credits.trim() === "") return;
    const errors: SemesterErrors = {};
    const sgpa = parseNumber(row.sgpa);
    const credits = parseNumber(row.credits);
    if (sgpa === null || sgpa < 0 || sgpa > maxPoints) {
      errors.sgpa = `Enter an SGPA between 0 and ${maxPoints}.`;
    }
    if (credits === null || credits <= 0 || credits > 200) {
      errors.credits = "Enter semester credits greater than 0 and up to 200.";
    }
    if (errors.sgpa || errors.credits) {
      rowErrors[row.id] = errors;
      return;
    }
    lines.push({
      name: row.name.trim() || `Semester ${index + 1}`,
      sgpa: sgpa as number,
      credits: credits as number,
    });
  });

  if (Object.keys(rowErrors).length > 0) return { ok: false, rowErrors };
  if (lines.length === 0) {
    return {
      ok: false,
      rowErrors: {},
      message: "Add at least one semester with an SGPA and credits.",
    };
  }
  const totalCredits = lines.reduce((s, l) => s + l.credits, 0);
  const cgpa = lines.reduce((s, l) => s + l.sgpa * l.credits, 0) / totalCredits;
  return { ok: true, result: { cgpa, totalCredits, lines } };
}

/** Common CGPA→percentage approximation for 10-point systems. Institutions differ. */
export const CGPA_TO_PERCENT_FACTOR = 9.5;

export function cgpaToPercentage(cgpa: number): number {
  return cgpa * CGPA_TO_PERCENT_FACTOR;
}
