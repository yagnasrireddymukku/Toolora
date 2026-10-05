"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Maps "category/slug" to a tool's interactive component. This is a client module on
 * purpose: next/dynamic only code-splits from client code, so each tool page downloads
 * just its own tool (while still being pre-rendered into the static HTML).
 */
const COMPONENTS: Record<string, ComponentType> = {
  "education/cgpa-calculator": dynamic(() =>
    import("./education/CgpaCalculator").then((m) => m.CgpaCalculator),
  ),
  "education/sgpa-calculator": dynamic(() =>
    import("./education/SgpaCalculator").then((m) => m.SgpaCalculator),
  ),
  "education/percentage-calculator": dynamic(() =>
    import("./education/PercentageCalculator").then((m) => m.PercentageCalculator),
  ),
  "education/attendance-calculator": dynamic(() =>
    import("./education/AttendanceCalculator").then((m) => m.AttendanceCalculator),
  ),
  "career/ats-resume-checker": dynamic(() =>
    import("./career/AtsResumeChecker").then((m) => m.AtsResumeChecker),
  ),
  "career/job-description-analyzer": dynamic(() =>
    import("./career/JobDescriptionAnalyzer").then((m) => m.JobDescriptionAnalyzer),
  ),
  "career/resume-keyword-matcher": dynamic(() =>
    import("./career/KeywordMatcher").then((m) => m.KeywordMatcher),
  ),
  "salary/ctc-to-inhand-calculator": dynamic(() =>
    import("./salary/CtcCalculator").then((m) => m.CtcCalculator),
  ),
  "salary/salary-hike-calculator": dynamic(() =>
    import("./salary/SalaryHikeCalculator").then((m) => m.SalaryHikeCalculator),
  ),
  "developer/json-formatter": dynamic(() =>
    import("./developer/JsonFormatter").then((m) => m.JsonFormatter),
  ),
  "utility/qr-code-generator": dynamic(() =>
    import("./utility/QrGenerator").then((m) => m.QrGenerator),
  ),
};

/** Ids with a registered component. Used by tests to keep the registry and loader in sync. */
export const LOADER_IDS = Object.keys(COMPONENTS);

export function ToolLoader({ id }: { id: string }) {
  const Component = COMPONENTS[id];
  return Component ? <Component /> : null;
}
