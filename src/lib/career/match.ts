import { analyzeJobDescription, type JobProfile } from "./job";
import { countSkill } from "./skillmatch";
import { getSkill, SKILL_CATEGORIES, type SkillCategory } from "./skills";
import { countTerm, countWords, normalizeText } from "./text";

export interface MatchedKeyword {
  term: string;
  kind: "skill" | "term";
  category?: SkillCategory;
  importance: "required" | "preferred" | "term";
  /** Occurrences in the resume. */
  resumeCount: number;
}

export interface MatchResult {
  matched: MatchedKeyword[];
  missing: MatchedKeyword[];
  /** Weighted overall match (0–100): required skills 3, preferred 2, plain terms 1. */
  matchPercent: number;
  /** Share of the job's skills (required + preferred) found in the resume. */
  skillMatchPercent: number | null;
  byCategory: { category: SkillCategory; matched: string[]; missing: string[] }[];
  /** Keywords repeated enough to look like stuffing. */
  overused: { term: string; count: number }[];
  recommendations: string[];
  profile: JobProfile;
}

const WEIGHT = { required: 3, preferred: 2, term: 1 } as const;
/** A keyword used this often (or taking this share of all words) reads as stuffing. */
const OVERUSE_COUNT = 8;
const OVERUSE_DENSITY = 0.03;

export function matchResumeToJob(
  resumeInput: string,
  jobInput: string,
): MatchResult | null {
  const resume = normalizeText(resumeInput);
  const profile = analyzeJobDescription(jobInput);
  const words = Math.max(1, countWords(resume));

  const targets: Omit<MatchedKeyword, "resumeCount">[] = [
    ...profile.skills.map((s) => ({
      term: s.name,
      kind: "skill" as const,
      category: s.category,
      importance: s.importance,
    })),
    ...profile.keywords
      .filter((k) => k.kind === "term")
      .slice(0, 12)
      .map((k) => ({ term: k.term, kind: "term" as const, importance: "term" as const })),
  ];

  if (targets.length === 0) return null;

  const scored: MatchedKeyword[] = targets.map((t) => ({
    ...t,
    resumeCount:
      t.kind === "skill"
        ? countSkill(resume, getSkill(t.term))
        : countTerm(resume, t.term),
  }));

  const matched = scored
    .filter((k) => k.resumeCount > 0)
    .sort((a, b) => b.resumeCount - a.resumeCount);
  const missing = scored.filter((k) => k.resumeCount === 0);

  const totalWeight = scored.reduce((s, k) => s + WEIGHT[k.importance], 0);
  const matchedWeight = matched.reduce((s, k) => s + WEIGHT[k.importance], 0);
  const matchPercent = Math.round((matchedWeight / totalWeight) * 100);

  const skillTargets = scored.filter((k) => k.kind === "skill");
  const skillMatchPercent = skillTargets.length
    ? Math.round(
        (skillTargets.filter((k) => k.resumeCount > 0).length / skillTargets.length) *
          100,
      )
    : null;

  const byCategory = SKILL_CATEGORIES.map((category) => ({
    category,
    matched: matched.filter((k) => k.category === category).map((k) => k.term),
    missing: missing.filter((k) => k.category === category).map((k) => k.term),
  })).filter((c) => c.matched.length + c.missing.length > 0);

  const overused = matched
    .filter(
      (k) => k.resumeCount >= OVERUSE_COUNT || k.resumeCount / words >= OVERUSE_DENSITY,
    )
    .map((k) => ({ term: k.term, count: k.resumeCount }));

  const recommendations: string[] = [];
  const missingRequired = missing
    .filter((k) => k.importance === "required")
    .map((k) => k.term);
  if (missingRequired.length > 0) {
    recommendations.push(
      `The job asks for ${missingRequired.slice(0, 6).join(", ")} but your resume does not mention ${missingRequired.length === 1 ? "it" : "them"}. If you genuinely have this experience, add it inside a bullet that shows how you used it.`,
    );
  }
  const missingPreferred = missing
    .filter((k) => k.importance === "preferred")
    .map((k) => k.term);
  if (missingPreferred.length > 0) {
    recommendations.push(
      `Nice-to-have skills not found: ${missingPreferred.slice(0, 6).join(", ")}. Only add what is true for you.`,
    );
  }
  if (overused.length > 0) {
    recommendations.push(
      `${overused.map((o) => `"${o.term}"`).join(", ")} appear${overused.length === 1 ? "s" : ""} very often. Repeating keywords does not help and can look like keyword stuffing, so mention each one in context a couple of times at most.`,
    );
  }
  if (matchPercent >= 70) {
    recommendations.push(
      "Your resume already covers most of the job's keywords. Focus on quantified results rather than adding more keywords.",
    );
  } else if (missingRequired.length === 0 && missing.length > 0) {
    recommendations.push(
      "Use the job's own wording where it accurately describes your work, for example the same name for a tool or a duty.",
    );
  }
  recommendations.push(
    "Keywords are only one signal. Clear, specific, quantified bullets matter more to the people who read your resume.",
  );

  return {
    matched,
    missing,
    matchPercent,
    skillMatchPercent,
    byCategory,
    overused,
    recommendations,
    profile,
  };
}
