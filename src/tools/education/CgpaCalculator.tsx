"use client";

import { Tabs } from "@/components/ui/Tabs";
import { SemesterCgpaCalculator } from "./SemesterCgpaCalculator";
import { SubjectGradeCalculator } from "./SubjectGradeCalculator";

export function CgpaCalculator() {
  return (
    <Tabs
      label="CGPA calculation method"
      items={[
        {
          id: "subjects",
          label: "From subjects",
          content: <SubjectGradeCalculator kind="CGPA" />,
        },
        {
          id: "semesters",
          label: "From semester SGPAs",
          content: <SemesterCgpaCalculator />,
        },
      ]}
    />
  );
}
