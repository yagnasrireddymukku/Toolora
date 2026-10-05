"use client";

import { useState } from "react";
import { CopyButton, DownloadTextButton } from "@/components/tool/ActionButtons";
import { BigNumber, ResultPanel, StatGrid } from "@/components/tool/ResultPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { matchResumeToJob, type MatchResult } from "@/lib/career/match";
import { buildMatchReport } from "@/lib/career/report";
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_RESUME } from "@/lib/career/samples";
import {
  KeywordList,
  PlainList,
  PrivacyNote,
  ResultBlock,
  TextInputPanel,
} from "./shared";

const MIN_CHARS = 40;
type Errors = { resume?: string; job?: string };
type Outcome = { kind: "result"; result: MatchResult } | { kind: "empty" } | null;

export function KeywordMatcher() {
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [outcome, setOutcome] = useState<Outcome>(null);

  function run() {
    const next: Errors = {};
    if (resume.trim().length < MIN_CHARS)
      next.resume = "Paste or upload your resume text.";
    if (job.trim().length < MIN_CHARS) next.job = "Paste the job description.";
    setErrors(next);
    if (next.resume || next.job) {
      setOutcome(null);
      return;
    }
    const result = matchResumeToJob(resume, job);
    setOutcome(result ? { kind: "result", result } : { kind: "empty" });
  }

  const result = outcome?.kind === "result" ? outcome.result : null;
  const report = result ? buildMatchReport(result) : "";

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <PrivacyNote />
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
          className="space-y-6"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <TextInputPanel
              label="Your resume"
              value={resume}
              error={errors.resume}
              allowUpload
              example={SAMPLE_RESUME}
              onChange={(v) => {
                setResume(v);
                setOutcome(null);
              }}
            />
            <TextInputPanel
              label="Job description"
              value={job}
              error={errors.job}
              example={SAMPLE_JOB_DESCRIPTION}
              onChange={(v) => {
                setJob(v);
                setOutcome(null);
              }}
            />
          </div>
          <Button type="submit">Match keywords</Button>
        </form>
      </Card>

      {outcome?.kind === "empty" && (
        <Alert tone="warning" title="Nothing to match">
          No known skills or repeated keywords were found in the job description. Try
          pasting the full posting.
        </Alert>
      )}

      {result && (
        <ResultPanel
          title="Keyword match"
          actions={
            <>
              <CopyButton text={report} label="Copy report" />
              <DownloadTextButton
                filename="resume-keyword-match.txt"
                content={report}
                label="Download .txt"
              />
            </>
          }
        >
          <BigNumber
            label="Weighted keyword match (estimate)"
            value={`${result.matchPercent}%`}
          />
          <div className="mt-4">
            <StatGrid
              items={[
                { label: "Matching keywords", value: String(result.matched.length) },
                { label: "Missing keywords", value: String(result.missing.length) },
                ...(result.skillMatchPercent !== null
                  ? [
                      {
                        label: "Job skills found in resume",
                        value: `${result.skillMatchPercent}%`,
                      },
                    ]
                  : []),
              ]}
            />
          </div>
          <p className="text-ink-soft mt-3 text-sm">
            Required skills count 3×, preferred skills 2× and other repeated terms 1×.
            This is an estimate for guidance, not the output of any real applicant
            tracking system.
          </p>

          <div className="mt-5 space-y-4">
            <ResultBlock title="Matching keywords">
              <KeywordList
                items={result.matched.map((k) => ({
                  label: k.term,
                  note: `${k.resumeCount}×`,
                }))}
                empty="No keywords matched yet"
              />
            </ResultBlock>
            <ResultBlock title="Missing keywords">
              <KeywordList
                items={result.missing.map((k) => ({
                  label: k.term,
                  note: k.importance === "term" ? "keyword" : k.importance,
                }))}
                empty="Nothing missing. Every keyword was found."
              />
            </ResultBlock>
            {result.byCategory.length > 0 && (
              <ResultBlock title="Skills by category">
                <div className="space-y-3">
                  {result.byCategory.map((c) => (
                    <div key={c.category}>
                      <h4 className="text-ink-muted text-sm font-medium">{c.category}</h4>
                      <p className="text-sm">
                        <span className="font-medium">Matched: </span>
                        {c.matched.length ? c.matched.join(", ") : "none"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Missing: </span>
                        {c.missing.length ? c.missing.join(", ") : "none"}
                      </p>
                    </div>
                  ))}
                </div>
              </ResultBlock>
            )}
            {result.overused.length > 0 && (
              <Alert tone="warning" title="Possible keyword stuffing">
                {result.overused.map((o) => `${o.term} (${o.count}×)`).join(", ")} appear
                very often. Repeating a keyword does not improve a resume.
              </Alert>
            )}
            <ResultBlock title="Recommendations">
              <PlainList items={result.recommendations} empty="No recommendations" />
            </ResultBlock>
          </div>
        </ResultPanel>
      )}
    </div>
  );
}
