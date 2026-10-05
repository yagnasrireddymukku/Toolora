import type { JobProfile } from "./job";
import type { MatchResult } from "./match";
import type { ResumeAnalysis } from "./resume";
import type { EstimatedScore } from "./score";

export const ESTIMATE_NOTICE =
  "This is an estimated analysis based on keyword overlap and common formatting guidance. It is not the result of any real company's applicant tracking system.";

const list = (items: string[], empty = "None found") =>
  items.length ? items.map((i) => `- ${i}`).join("\n") : `- ${empty}`;

export function buildJobReport(p: JobProfile): string {
  const parts = [
    "JOB DESCRIPTION ANALYSIS (Toolora)",
    "",
    "Required skills",
    list(p.requiredSkills),
    "",
    "Preferred skills",
    list(p.preferredSkills),
    "",
    "Tools and technologies",
    list(p.technologies),
    "",
    "Soft skills",
    list(p.softSkills),
    "",
    "Experience requirements",
    list(p.experience),
    "",
    "Education requirements",
    list(p.education),
    "",
    "Responsibilities",
    list(p.responsibilities),
    "",
    "Important keywords",
    list(p.keywords.map((k) => `${k.term} (${k.count})`)),
    "",
    "Potential resume keywords (add only where they truthfully apply)",
    list(p.resumeKeywords),
  ];
  return parts.join("\n");
}

export function buildMatchReport(m: MatchResult): string {
  return [
    "RESUME KEYWORD MATCH (Toolora)",
    "",
    `Weighted keyword match: ${m.matchPercent}%`,
    m.skillMatchPercent === null ? "" : `Skills found: ${m.skillMatchPercent}%`,
    "",
    "Matching keywords",
    list(m.matched.map((k) => `${k.term} (${k.resumeCount}x in resume)`)),
    "",
    "Missing keywords",
    list(m.missing.map((k) => `${k.term} [${k.importance}]`)),
    "",
    "Recommendations",
    list(m.recommendations),
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");
}

export function buildAtsReport(
  a: ResumeAnalysis,
  score: EstimatedScore,
  match: MatchResult | null,
): string {
  const parts = [
    "ATS RESUME CHECK (Toolora)",
    ESTIMATE_NOTICE,
    "",
    `Estimated score: ${score.total}/100 (${score.band})`,
    ...score.components.map((c) => `- ${c.label}: ${c.score}/${c.max}. ${c.detail}`),
    "",
    "Sections",
    ...a.sections.map((s) => `- ${s.label}: ${s.found ? "found" : "not found"}`),
    "",
    "Issues to review",
    list(
      a.warnings.map((w) => `[${w.severity}] ${w.message}`),
      "No issues flagged",
    ),
    "",
    "Measurable achievements found",
    list(a.metrics.examples, "None found"),
    "",
    `Words: ${a.wordCount}. Reading ease: ${a.readability.fleschReadingEase} (${a.readability.label}).`,
  ];
  if (match) {
    parts.push(
      "",
      `Job keyword match: ${match.matchPercent}%`,
      "Missing keywords",
      list(match.missing.map((k) => k.term)),
    );
  }
  return parts.join("\n");
}
