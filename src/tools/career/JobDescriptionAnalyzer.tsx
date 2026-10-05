"use client";

import { useState } from "react";
import { CopyButton, DownloadTextButton } from "@/components/tool/ActionButtons";
import { ResultPanel } from "@/components/tool/ResultPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { analyzeJobDescription, type JobProfile } from "@/lib/career/job";
import { buildJobReport } from "@/lib/career/report";
import { SAMPLE_JOB_DESCRIPTION } from "@/lib/career/samples";
import { SKILL_CATEGORIES } from "@/lib/career/skills";
import {
  KeywordList,
  PlainList,
  PrivacyNote,
  ResultBlock,
  TextInputPanel,
} from "./shared";

const MIN_CHARS = 40;

export function JobDescriptionAnalyzer() {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<JobProfile | null>(null);

  function analyze() {
    if (text.trim().length < MIN_CHARS) {
      setError("Paste a job description of at least a couple of sentences.");
      setProfile(null);
      return;
    }
    setError("");
    setProfile(analyzeJobDescription(text));
  }

  const report = profile ? buildJobReport(profile) : "";
  const nothingFound =
    profile && profile.skills.length === 0 && profile.keywords.length === 0;

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <PrivacyNote />
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            analyze();
          }}
          className="space-y-4"
        >
          <TextInputPanel
            label="Job description"
            value={text}
            error={error}
            hint="Paste the full posting, including the requirements and responsibilities sections."
            example={SAMPLE_JOB_DESCRIPTION}
            onChange={(v) => {
              setText(v);
              setProfile(null);
              setError("");
            }}
          />
          <Button type="submit">Analyze job description</Button>
        </form>
      </Card>

      {nothingFound && (
        <p role="status" className="text-ink-soft">
          No known skills or repeated keywords were found. Try pasting a longer
          description.
        </p>
      )}

      {profile && !nothingFound && (
        <ResultPanel
          title="Job description analysis"
          actions={
            <>
              <CopyButton text={report} label="Copy analysis" />
              <DownloadTextButton
                filename="job-description-analysis.txt"
                content={report}
                label="Download .txt"
              />
            </>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <ResultBlock title="Required skills">
              <KeywordList
                items={profile.requiredSkills.map((label) => ({ label }))}
                empty="None detected"
              />
            </ResultBlock>
            <ResultBlock title="Preferred skills">
              <KeywordList
                items={profile.preferredSkills.map((label) => ({ label }))}
                empty="None marked as preferred"
              />
            </ResultBlock>
            <ResultBlock title="Tools and technologies">
              <KeywordList
                items={profile.technologies.map((label) => ({ label }))}
                empty="None detected"
              />
            </ResultBlock>
            <ResultBlock title="Soft skills">
              <KeywordList
                items={profile.softSkills.map((label) => ({ label }))}
                empty="None detected"
              />
            </ResultBlock>
            <ResultBlock title="Experience requirements">
              <PlainList
                items={profile.experience}
                empty="No years of experience mentioned"
              />
            </ResultBlock>
            <ResultBlock title="Education requirements">
              <PlainList
                items={profile.education}
                empty="No education requirement detected"
              />
            </ResultBlock>
          </div>

          <div className="mt-4 space-y-4">
            <ResultBlock title="Responsibilities">
              <PlainList
                items={profile.responsibilities}
                empty="No responsibilities section detected"
              />
            </ResultBlock>
            <ResultBlock title="Skills by category">
              <dl className="space-y-2 text-sm">
                {SKILL_CATEGORIES.filter((c) => profile.skillsByCategory[c]).map((c) => (
                  <div key={c}>
                    <dt className="text-ink-muted font-medium">{c}</dt>
                    <dd>{profile.skillsByCategory[c]!.join(", ")}</dd>
                  </div>
                ))}
              </dl>
            </ResultBlock>
            <ResultBlock title="Important keywords (with mentions)">
              <KeywordList
                items={profile.keywords.map((k) => ({
                  label: k.term,
                  note: String(k.count),
                }))}
                empty="No repeated keywords"
              />
            </ResultBlock>
            <ResultBlock title="Potential resume keywords">
              <KeywordList
                items={profile.resumeKeywords.map((label) => ({ label }))}
                empty="None"
              />
              <p className="text-ink-muted mt-3 text-sm">
                Use these only where they truthfully describe your experience, and show
                them in context rather than listing them repeatedly.
              </p>
            </ResultBlock>
          </div>
        </ResultPanel>
      )}
    </div>
  );
}
