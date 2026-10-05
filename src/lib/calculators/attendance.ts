export interface AttendanceInput {
  total: number;
  attended: number;
  /** Required attendance percentage, e.g. 75. */
  required: number;
}

export interface AttendanceResult {
  currentPercent: number;
  meetsRequirement: boolean;
  /** If meeting the requirement: most classes you can miss from now on. */
  canMiss: number;
  /** If below the requirement: consecutive classes to attend (and none missed) to reach it. null = impossible. */
  mustAttend: number | null;
}

export type AttendanceOutcome =
  { ok: true; result: AttendanceResult } | { ok: false; error: string };

const EPS = 1e-9;

export function validateAttendance(input: AttendanceInput): string | null {
  if (!Number.isInteger(input.total) || input.total < 1) {
    return "Total classes must be a whole number of at least 1.";
  }
  if (!Number.isInteger(input.attended) || input.attended < 0) {
    return "Attended classes must be a whole number, 0 or more.";
  }
  if (input.attended > input.total) {
    return "Attended classes cannot be more than total classes.";
  }
  if (!(input.required > 0 && input.required <= 100)) {
    return "Required attendance must be greater than 0 and at most 100.";
  }
  return null;
}

/**
 * Assumptions: every future class counts toward the total. Missing m more classes
 * keeps you at or above R% when attended/(total+m) ≥ R/100, i.e. m ≤ 100·attended/R − total.
 * Attending x more classes in a row reaches R% when (attended+x)/(total+x) ≥ R/100,
 * i.e. x ≥ (R·total − 100·attended)/(100 − R).
 */
export function calculateAttendance(input: AttendanceInput): AttendanceOutcome {
  const error = validateAttendance(input);
  if (error) return { ok: false, error };

  const { total, attended, required } = input;
  const currentPercent = (attended / total) * 100;
  const meetsRequirement = attended * 100 >= required * total - EPS;

  let canMiss = 0;
  let mustAttend: number | null = 0;

  if (meetsRequirement) {
    canMiss = Math.max(0, Math.floor((attended * 100) / required - total + EPS));
  } else if (required >= 100) {
    mustAttend = null; // can never reach 100% after missing a class
  } else {
    mustAttend = Math.max(
      1,
      Math.ceil((required * total - 100 * attended) / (100 - required) - EPS),
    );
  }

  return { ok: true, result: { currentPercent, meetsRequirement, canMiss, mustAttend } };
}
