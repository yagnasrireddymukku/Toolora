import { describe, expect, it } from "vitest";
import { analyzeJobDescription } from "./job";
import { matchResumeToJob } from "./match";
import {
  buildAtsReport,
  buildJobReport,
  buildMatchReport,
  ESTIMATE_NOTICE,
} from "./report";
import { analyzeResume } from "./resume";
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_RESUME } from "./samples";
import { estimateScore } from "./score";

describe("report builders", () => {
  it("labels the ATS report as an estimate and includes the score", () => {
    const a = analyzeResume(SAMPLE_RESUME);
    const m = matchResumeToJob(SAMPLE_RESUME, SAMPLE_JOB_DESCRIPTION);
    const text = buildAtsReport(a, estimateScore(a, m), m);
    expect(text).toContain(ESTIMATE_NOTICE);
    expect(text).toMatch(/Estimated score: \d+\/100/);
    expect(text).toContain("Missing keywords");
  });

  it("lists job requirements", () => {
    const text = buildJobReport(analyzeJobDescription(SAMPLE_JOB_DESCRIPTION));
    expect(text).toMatch(/Required skills\n- /);
    expect(text).toContain("Next.js");
  });

  it("builds a match report", () => {
    const text = buildMatchReport(
      matchResumeToJob(SAMPLE_RESUME, SAMPLE_JOB_DESCRIPTION)!,
    );
    expect(text).toMatch(/Weighted keyword match: \d+%/);
    expect(text).toContain("Matching keywords");
  });
});
