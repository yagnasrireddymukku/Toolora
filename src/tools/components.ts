import type { ComponentType } from "react";
import { AtsResumeChecker } from "./career/AtsResumeChecker";
import { JobDescriptionAnalyzer } from "./career/JobDescriptionAnalyzer";
import { KeywordMatcher } from "./career/KeywordMatcher";
import { AttendanceCalculator } from "./education/AttendanceCalculator";
import { CgpaCalculator } from "./education/CgpaCalculator";
import { PercentageCalculator } from "./education/PercentageCalculator";
import { SgpaCalculator } from "./education/SgpaCalculator";
import { CtcCalculator } from "./salary/CtcCalculator";
import { SalaryHikeCalculator } from "./salary/SalaryHikeCalculator";

/** Maps "category/slug" to the interactive component rendered inside the tool page template. */
export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "education/cgpa-calculator": CgpaCalculator,
  "education/sgpa-calculator": SgpaCalculator,
  "education/percentage-calculator": PercentageCalculator,
  "education/attendance-calculator": AttendanceCalculator,
  "career/ats-resume-checker": AtsResumeChecker,
  "career/job-description-analyzer": JobDescriptionAnalyzer,
  "career/resume-keyword-matcher": KeywordMatcher,
  "salary/ctc-to-inhand-calculator": CtcCalculator,
  "salary/salary-hike-calculator": SalaryHikeCalculator,
};
