import type { MatchResult } from "./match";
import type { ResumeAnalysis } from "./resume";

export interface ScoreComponent {
  key: string;
  label: string;
  score: number;
  max: number;
  detail: string;
}

export interface EstimatedScore {
  /** 0–100. Always an estimate, never a real ATS result. */
  total: number;
  components: ScoreComponent[];
  band: "Needs work" | "Fair" | "Good" | "Strong";
}

const MAX = {
  keywords: 45,
  sections: 15,
  contact: 5,
  writing: 15,
  readability: 10,
  formatting: 10,
} as const;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * Transparent heuristic score. Weights: job keywords 45, sections 15, contact 5,
 * action verbs and measurable results 15, readability and length 10, formatting 10.
 * Without a job description the keyword weight is removed and the rest is rescaled to 100.
 */
export function estimateScore(
  analysis: ResumeAnalysis,
  match: MatchResult | null,
): EstimatedScore {
  const components: ScoreComponent[] = [];

  if (match) {
    components.push({
      key: "keywords",
      label: "Job keyword match",
      score: Math.round((match.matchPercent / 100) * MAX.keywords),
      max: MAX.keywords,
      detail: `${match.matchPercent}% of the job's weighted keywords were found.`,
    });
  }

  const has = (id: string) => analysis.sections.find((s) => s.id === id)?.found ?? false;
  const sectionPoints =
    (has("experience") || has("projects") ? 6 : 0) +
    (has("education") ? 3 : 0) +
    (has("skills") ? 4 : 0) +
    (has("summary") ? 2 : 0);
  components.push({
    key: "sections",
    label: "Standard sections",
    score: sectionPoints,
    max: MAX.sections,
    detail: "Experience (or projects), education, skills and a summary were checked.",
  });

  const contactPoints =
    (analysis.contact.email ? 3 : 0) + (analysis.contact.phone ? 2 : 0);
  components.push({
    key: "contact",
    label: "Contact details",
    score: contactPoints,
    max: MAX.contact,
    detail: "Email and phone were checked.",
  });

  const verbPoints = Math.round(analysis.actionVerbLineRatio * 8);
  const metricPoints = Math.round(clamp(analysis.metrics.count / 5, 0, 1) * 7);
  components.push({
    key: "writing",
    label: "Action verbs and measurable results",
    score: verbPoints + metricPoints,
    max: MAX.writing,
    detail: `${Math.round(analysis.actionVerbLineRatio * 100)}% of bullets open with a strong verb; ${analysis.metrics.count} line(s) contain numbers.`,
  });

  const wc = analysis.wordCount;
  const lengthOk = wc >= 300 && wc <= 900 ? 1 : wc >= 200 && wc <= 1100 ? 0.6 : 0.2;
  const read = analysis.readability.fleschReadingEase;
  const readOk = read >= 30 && read <= 80 ? 1 : 0.6;
  components.push({
    key: "readability",
    label: "Readability and length",
    score: Math.round(lengthOk * 6 + readOk * 4),
    max: MAX.readability,
    detail: `${wc} words; reading ease ${read} (${analysis.readability.label}).`,
  });

  const penalty = analysis.warnings.reduce(
    (s, w) => s + (w.severity === "high" ? 3 : w.severity === "medium" ? 2 : 1),
    0,
  );
  components.push({
    key: "formatting",
    label: "Formatting and completeness",
    score: clamp(MAX.formatting - penalty, 0, MAX.formatting),
    max: MAX.formatting,
    detail: `${analysis.warnings.length} issue(s) flagged.`,
  });

  const earned = components.reduce((s, c) => s + c.score, 0);
  const possible = components.reduce((s, c) => s + c.max, 0);
  const total = Math.round((earned / possible) * 100);
  const band =
    total >= 80 ? "Strong" : total >= 65 ? "Good" : total >= 45 ? "Fair" : "Needs work";
  return { total, components, band };
}
