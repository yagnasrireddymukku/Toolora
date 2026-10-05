"use client";

import { useState } from "react";
import { CopyButton, DownloadTextButton } from "@/components/tool/ActionButtons";
import { BigNumber, ResultPanel, StatGrid } from "@/components/tool/ResultPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { matchResumeToJob, type MatchResult } from "@/lib/career/match";
import { buildAtsReport, ESTIMATE_NOTICE } from "@/lib/career/report";
import { analyzeResume, type ResumeAnalysis } from "@/lib/career/resume";
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_RESUME } from "@/lib/career/samples";
import { estimateScore, type EstimatedScore } from "@/lib/career/score";
import {
  KeywordList,
  PlainList,
  PrivacyNote,
  ResultBlock,
  TextInputPanel,
} from "./shared";

const MIN_CHARS = 40;

interface Analysis {
  resume: ResumeAnalysis;
  score: EstimatedScore;
  match: MatchResult | null;
  jobGiven: boolean;
}

const SEVERITY_LABEL = { high: "High", medium: "Medium", low: "Low" } as const;

export function AtsResumeChecker() {
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  function run() {
    if (resume.trim().length < MIN_CHARS) {
      setError("Paste or upload your resume text first.");
      setAnalysis(null);
      return;
    }
    setError("");
    const resumeAnalysis = analyzeResume(resume);
    const jobGiven = job.trim().length >= MIN_CHARS;
    const match = jobGiven ? matchResumeToJob(resume, job) : null;
    setAnalysis({
      resume: resumeAnalysis,
      score: estimateScore(resumeAnalysis, match),
      match,
      jobGiven,
    });
  }

  const report = analysis
    ? buildAtsReport(analysis.resume, analysis.score, analysis.match)
    : "";

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
              error={error}
              allowUpload
              example={SAMPLE_RESUME}
              hint="Paste your resume text or upload a PDF, DOCX or TXT file."
              onChange={(v) => {
                setResume(v);
                setAnalysis(null);
                setError("");
              }}
            />
            <TextInputPanel
              label="Job description (optional)"
              value={job}
              example={SAMPLE_JOB_DESCRIPTION}
              hint="Add a job description to get a keyword match and missing keywords."
              onChange={(v) => {
                setJob(v);
                setAnalysis(null);
              }}
            />
          </div>
          <Button type="submit">Check my resume</Button>
        </form>
      </Card>

      {analysis && (
        <ResultPanel
          title="Estimated ATS analysis"
          actions={
            <>
              <CopyButton text={report} label="Copy report" />
              <DownloadTextButton
                filename="ats-resume-check.txt"
                content={report}
                label="Download .txt"
              />
            </>
          }
        >
          <Alert tone="info" title="Estimate only">
            {ESTIMATE_NOTICE}
          </Alert>

          <div className="mt-4">
            <BigNumber
              label={`Estimated score: ${analysis.score.band}`}
              value={`${analysis.score.total} / 100`}
            />
          </div>

          {analysis.jobGiven && !analysis.match && (
            <div className="mt-4">
              <Alert tone="warning" title="No job keywords found">
                The job description did not contain recognisable skills or repeated
                keywords, so the score is based on the resume alone.
              </Alert>
            </div>
          )}

          <div className="mt-4 space-y-4">
            <ResultBlock title="How the score is made">
              <ul className="space-y-3">
                {analysis.score.components.map((c) => (
                  <li key={c.key}>
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="font-medium">{c.label}</span>
                      <span>
                        {c.score} / {c.max}
                      </span>
                    </div>
                    <div
                      className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200"
                      aria-hidden="true"
                    >
                      <div
                        className="bg-brand-700 h-full"
                        style={{ width: `${(c.score / c.max) * 100}%` }}
                      />
                    </div>
                    <p className="text-ink-muted mt-1 text-sm">{c.detail}</p>
                  </li>
                ))}
              </ul>
            </ResultBlock>

            {analysis.match && (
              <ResultBlock title={`Job match: ${analysis.match.matchPercent}%`}>
                <h4 className="text-ink-muted text-sm font-medium">
                  Keywords found in your resume (with frequency)
                </h4>
                <div className="mt-1 mb-3">
                  <KeywordList
                    items={analysis.match.matched.map((k) => ({
                      label: k.term,
                      note: `${k.resumeCount}×`,
                    }))}
                    empty="None yet"
                  />
                </div>
                <h4 className="text-ink-muted text-sm font-medium">Missing keywords</h4>
                <div className="mt-1">
                  <KeywordList
                    items={analysis.match.missing.map((k) => ({
                      label: k.term,
                      note: k.importance === "term" ? "keyword" : k.importance,
                    }))}
                    empty="Nothing missing"
                  />
                </div>
                <div className="mt-3">
                  <PlainList items={analysis.match.recommendations} empty="" />
                </div>
              </ResultBlock>
            )}

            <ResultBlock title="Issues to review">
              {analysis.resume.warnings.length === 0 ? (
                <p className="text-sm">No formatting or content issues were flagged.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {analysis.resume.warnings.map((w) => (
                    <li key={w.message}>
                      <span className="mr-2 font-semibold">
                        {SEVERITY_LABEL[w.severity]}:
                      </span>
                      {w.message}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-ink-muted mt-3 text-sm">
                Pasted text cannot reveal fonts, columns, images or headers. Keep the
                layout simple and test by copying your resume out of its PDF.
              </p>
            </ResultBlock>

            <ResultBlock title="Sections detected">
              <ul className="grid gap-1 text-sm sm:grid-cols-2">
                {analysis.resume.sections.map((s) => (
                  <li key={s.id}>
                    <span aria-hidden="true">{s.found ? "✓" : "✗"} </span>
                    {s.label}:{" "}
                    <span className="font-medium">{s.found ? "found" : "not found"}</span>
                  </li>
                ))}
              </ul>
            </ResultBlock>

            <ResultBlock title="Action verbs and measurable achievements">
              <StatGrid
                items={[
                  {
                    label: "Bullets opening with a strong verb",
                    value: `${Math.round(analysis.resume.actionVerbLineRatio * 100)}%`,
                  },
                  {
                    label: "Lines with measurable results",
                    value: String(analysis.resume.metrics.count),
                  },
                ]}
              />
              <h4 className="text-ink-muted mt-3 text-sm font-medium">
                Action verbs used
              </h4>
              <div className="mt-1">
                <KeywordList
                  items={analysis.resume.actionVerbs
                    .slice(0, 20)
                    .map((v) => ({ label: v.verb, note: `${v.count}×` }))}
                  empty="No strong action verbs found"
                />
              </div>
              <h4 className="text-ink-muted mt-3 text-sm font-medium">
                Measurable achievements found
              </h4>
              <div className="mt-1">
                <PlainList
                  items={analysis.resume.metrics.examples}
                  empty="None found. Add numbers where true, such as %, counts or money."
                />
              </div>
            </ResultBlock>

            <ResultBlock title="Readability and length">
              <StatGrid
                items={[
                  { label: "Word count", value: String(analysis.resume.wordCount) },
                  {
                    label: "Reading ease",
                    value: `${analysis.resume.readability.fleschReadingEase} (${analysis.resume.readability.label})`,
                  },
                  {
                    label: "Average words per line or sentence",
                    value: String(analysis.resume.readability.avgWordsPerSentence),
                  },
                  { label: "Bullet points", value: String(analysis.resume.bulletCount) },
                ]}
              />
            </ResultBlock>
          </div>
        </ResultPanel>
      )}
    </div>
  );
}
