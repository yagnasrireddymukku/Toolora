import { findSkills, skillTokens } from "./skillmatch";
import { ACTION_VERBS, getSkill, SKILL_CATEGORIES, type SkillCategory } from "./skills";
import {
  isBulletLine,
  JOB_NOISE,
  normalizeText,
  splitLines,
  stripBullet,
  STOPWORDS,
  tokenize,
} from "./text";

export interface JobKeyword {
  term: string;
  count: number;
  kind: "skill" | "term";
  category?: SkillCategory;
}

export interface JobSkill {
  name: string;
  category: SkillCategory;
  count: number;
  importance: "required" | "preferred";
}

export interface JobProfile {
  skills: JobSkill[];
  requiredSkills: string[];
  preferredSkills: string[];
  skillsByCategory: Partial<Record<SkillCategory, string[]>>;
  /** Technical skills: languages, frameworks, data, cloud and tools. */
  technologies: string[];
  softSkills: string[];
  experience: string[];
  education: string[];
  responsibilities: string[];
  keywords: JobKeyword[];
  /** Ordered shortlist of terms worth reflecting in a resume (only where truthful). */
  resumeKeywords: string[];
  wordCount: number;
}

type Zone = "required" | "preferred" | "responsibilities" | "other" | "unknown";

const PREFERRED_HEADING =
  /\b(preferred|nice[- ]to[- ]have|good[- ]to[- ]have|bonus|desirable|extra credit|added advantage)\b/i;
const REQUIRED_HEADING =
  /\b(requirements?|qualifications?|must[- ]have|required|what you(?:'ll| will)? need|what we(?:'re| are) looking for|who you are|skills|you have|about you|your profile|essential)\b/i;
const RESPONSIBILITY_HEADING =
  /\b(responsibilit(?:y|ies)|what you(?:'ll| will) do|duties|the role|your role|day[- ]to[- ]day|you will|key tasks|what you'll be doing)\b/i;
const OTHER_HEADING =
  /\b(benefits|perks|what we offer|about us|about the company|who we are|why join|compensation|our culture|equal opportunity|how to apply|diversity)\b/i;
const INLINE_PREFERRED =
  /\b(preferred|nice[- ]to[- ]have|good[- ]to[- ]have|is a plus|are a plus|a plus|bonus|an advantage)\b/i;

function classifyHeading(line: string): Zone | null {
  const text = stripBullet(line);
  if (text.length > 70 || /[.;]$/.test(text)) return null;
  // Headings usually end with ":" or are short title-like lines.
  const looksLikeHeading = /:$/.test(text) || text.split(/\s+/).length <= 7;
  if (!looksLikeHeading || isBulletLine(line)) return null;
  if (PREFERRED_HEADING.test(text)) return "preferred";
  if (OTHER_HEADING.test(text)) return "other";
  if (RESPONSIBILITY_HEADING.test(text)) return "responsibilities";
  if (REQUIRED_HEADING.test(text)) return "required";
  return null;
}

const EXPERIENCE_PATTERN =
  /\b\d{1,2}\s*(?:\+|plus)?\s*(?:(?:-|–|to)\s*\d{1,2}\s*\+?\s*)?years?\b/i;
const EDUCATION_PATTERN =
  /\b(bachelor'?s?|master'?s?|b\.?\s?tech|m\.?\s?tech|b\.?\s?e\b|b\.?\s?sc|m\.?\s?sc|mba|ph\.?d|doctorate|degree|diploma|graduate|undergraduate)\b/i;

function clip(line: string, max = 180): string {
  const text = stripBullet(line).replace(/\s+/g, " ");
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

const TECH_CATEGORIES: SkillCategory[] = [
  "Programming languages",
  "Frameworks and libraries",
  "Databases and data",
  "Cloud and DevOps",
  "Tools and platforms",
];

export function analyzeJobDescription(input: string): JobProfile {
  const text = normalizeText(input);
  const lines = splitLines(text);

  let zone: Zone = "unknown";
  const analysed: { line: string; zone: Zone }[] = [];
  for (const line of lines) {
    const heading = classifyHeading(line);
    if (heading) {
      zone = heading;
      continue;
    }
    if (zone === "other") continue;
    analysed.push({ line, zone: INLINE_PREFERRED.test(line) ? "preferred" : zone });
  }

  const body = analysed.map((a) => a.line).join("\n");

  // Skills, classified by the strongest zone they appear in.
  const skillMap = new Map<string, JobSkill>();
  for (const { line, zone: z } of analysed) {
    for (const { skill, count } of findSkills(line)) {
      const importance = z === "preferred" ? "preferred" : "required";
      const existing = skillMap.get(skill.name);
      if (!existing) {
        skillMap.set(skill.name, {
          name: skill.name,
          category: skill.category,
          count,
          importance,
        });
      } else {
        existing.count += count;
        if (importance === "required") existing.importance = "required";
      }
    }
  }
  const skills = [...skillMap.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );

  const requiredSkills = skills
    .filter((s) => s.importance === "required")
    .map((s) => s.name);
  const preferredSkills = skills
    .filter((s) => s.importance === "preferred")
    .map((s) => s.name);

  const skillsByCategory: JobProfile["skillsByCategory"] = {};
  for (const category of SKILL_CATEGORIES) {
    const names = skills.filter((s) => s.category === category).map((s) => s.name);
    if (names.length) skillsByCategory[category] = names;
  }

  const technologies = skills
    .filter((s) => TECH_CATEGORIES.includes(s.category))
    .map((s) => s.name);
  const softSkills = skills
    .filter((s) => s.category === "Soft skills")
    .map((s) => s.name);

  const experience = unique(
    analysed.filter((a) => EXPERIENCE_PATTERN.test(a.line)).map((a) => clip(a.line)),
  ).slice(0, 8);
  const education = unique(
    analysed.filter((a) => EDUCATION_PATTERN.test(a.line)).map((a) => clip(a.line)),
  ).slice(0, 6);

  let responsibilities = analysed
    .filter((a) => a.zone === "responsibilities")
    .map((a) => clip(a.line));
  if (responsibilities.length === 0) {
    responsibilities = analysed
      .filter((a) => {
        const first =
          stripBullet(a.line)
            .split(/\s+/)[0]
            ?.toLowerCase()
            .replace(/[^a-z]/g, "") ?? "";
        return (
          isBulletLine(a.line) &&
          (ACTION_VERBS.has(first) ||
            ACTION_VERBS.has(`${first}d`) ||
            ACTION_VERBS.has(`${first}ed`))
        );
      })
      .map((a) => clip(a.line));
  }
  responsibilities = unique(responsibilities).slice(0, 12);

  // Keyword ranking: dictionary skills plus recurring plain terms and bigrams.
  const covered = new Set(skills.flatMap((s) => skillTokens(getSkill(s.name))));
  const unigrams = new Map<string, number>();
  const bigrams = new Map<string, number>();
  for (const { line } of analysed) {
    const tokens = tokenize(line);
    const usable = (t: string) =>
      t.length >= 3 && !STOPWORDS.has(t) && !JOB_NOISE.has(t) && !/^\d+$/.test(t);
    tokens.forEach((t, i) => {
      if (usable(t) && !covered.has(t)) unigrams.set(t, (unigrams.get(t) ?? 0) + 1);
      const next = tokens[i + 1];
      if (next && usable(t) && usable(next) && !covered.has(t) && !covered.has(next)) {
        const key = `${t} ${next}`;
        bigrams.set(key, (bigrams.get(key) ?? 0) + 1);
      }
    });
  }

  const termCandidates: JobKeyword[] = [
    ...[...bigrams.entries()]
      .filter(([, c]) => c >= 2)
      .map(([term, count]) => ({
        term,
        count,
        kind: "term" as const,
        weight: count * 1.5,
      })),
    ...[...unigrams.entries()]
      .filter(([, c]) => c >= 2)
      .map(([term, count]) => ({ term, count, kind: "term" as const, weight: count })),
  ]
    .sort((a, b) => b.weight - a.weight || a.term.localeCompare(b.term))
    // Drop unigrams already inside a kept bigram.
    .reduce<{ term: string; count: number; kind: "term"; weight: number }[]>(
      (acc, cur) => {
        if (
          !cur.term.includes(" ") &&
          acc.some((a) => a.term.split(" ").includes(cur.term))
        )
          return acc;
        acc.push(cur);
        return acc;
      },
      [],
    )
    .slice(0, 20)
    .map(({ term, count, kind }) => ({ term, count, kind }));

  const keywords: JobKeyword[] = [
    ...skills.map((s) => ({
      term: s.name,
      count: s.count,
      kind: "skill" as const,
      category: s.category,
    })),
    ...termCandidates,
  ];

  const resumeKeywords = unique([
    ...requiredSkills,
    ...preferredSkills,
    ...termCandidates.slice(0, 10).map((k) => k.term),
  ]).slice(0, 30);

  return {
    skills,
    requiredSkills,
    preferredSkills,
    skillsByCategory,
    technologies,
    softSkills,
    experience,
    education,
    responsibilities,
    keywords,
    resumeKeywords,
    wordCount: body.split(/\s+/).filter(Boolean).length,
  };
}
