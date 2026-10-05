import type { ComponentType } from "react";
import { AttendanceCalculator } from "./education/AttendanceCalculator";
import { CgpaCalculator } from "./education/CgpaCalculator";
import { PercentageCalculator } from "./education/PercentageCalculator";
import { SgpaCalculator } from "./education/SgpaCalculator";

/** Maps "category/slug" to the interactive component rendered inside the tool page template. */
export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "education/cgpa-calculator": CgpaCalculator,
  "education/sgpa-calculator": SgpaCalculator,
  "education/percentage-calculator": PercentageCalculator,
  "education/attendance-calculator": AttendanceCalculator,
};
