import { ACTION_VERBS, WEAK_PHRASES } from "./skills";
import {
  countWords,
  isBulletLine,
  normalizeText,
  readability,
  splitLines,
  stripBullet,
  tokenize,
  type Readability,
} from "./text";

export type SectionId =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "achievements";

const SECTION_HEADINGS: Record<SectionId, string[]> = {
  summary: [
    "summary",
    "professional summary",
    "career summary",
    "profile",
    "professional profile",
    "objective",
    "career objective",
    "about me",
  ],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment history",
    "work history",
    "employment",
    "internships",
    "internship experience",
  ],
  education: [
    "education",
    "academic background",
    "academics",
    "education and training",
    "academic qualifications",
    "qualifications",
  ],
  skills: [
    "skills",
    "technical skills",
    "core competencies",
    "key skills",
    "skills and tools",
    "technologies",
    "tools and technologies",
    "skills and technologies",
    "areas of expertise",
  ],
  projects: [
    "projects",
    "personal projects",
    "academic projects",
    "key projects",
    "selected projects",
  ],
  certifications: [
    "certifications",
    "certificates",
    "licenses",
    "licenses and certifications",
    "courses",
    "training",
  ],
  achievements: [
    "achievements",
    "awards",
    "honors",
    "honours",
    "accomplishments",
    "awards and achievements",
    "awards and honors",
  ],
};

export const SECTION_LABELS: Record<SectionId, string> = {
  summary: "Summary / Profile",
  experience: "Work experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  achievements: "Achievements / Awards",
};

export interface Warning {
  severity: "high" | "medium" | "low";
  message: string;
}

export interface ResumeAnalysis {
  wordCount: number;
  lineCount: number;
  sections: { id: SectionId; label: string; found: boolean }[];
  contact: { email: boolean; phone: boolean; linkedin: boolean; github: boolean };
  bulletCount: number;
  actionVerbs: { verb: string; count: number }[];
  /** Share (0–1) of bullet/sentence lines that open with a strong action verb. */
  actionVerbLineRatio: number;
  weakPhrases: string[];
  metrics: { count: number; examples: string[] };
  hasDates: boolean;
  readability: Readability;
  warnings: Warning[];
}

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_CANDIDATE = /\+?\(?\d[\d\s().-]{8,18}\d/g;

/** A phone number is a digit run of 10–15 digits (country code optional), not a date range. */
function hasPhoneNumber(text: string): boolean {
  return (text.match(PHONE_CANDIDATE) ?? []).some((m) => {
    const digits = m.replace(/\D/g, "").length;
    return digits >= 10 && digits <= 15;
  });
}
const METRIC =
  /(?:\b\d[\d,.]*\s?(?:%|percent\b|x\b|k\b|m\b|million|billion|crore|lakh|users|customers|clients|hours|days|members|requests|projects|people|engineers|reports|deals)|[$₹€£]\s?\d)/i;
const DATE =
  /\b(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:19|20)\d{2}\b|\bpresent\b/i;
const DECORATIVE = /[★☆✔✓✗✘➤➢◆◇■□☐☑✅❖❯]|[\u{1F300}-\u{1FAFF}]/u;

function headingKey(line: string): string {
  return stripBullet(line)
    .toLowerCase()
    .replace(/[^a-z& ]/g, " ")
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim();
}

function detectSections(lines: string[]): Set<SectionId> {
  const found = new Set<SectionId>();
  for (const line of lines) {
    if (line.length > 45) continue;
    const key = headingKey(line);
    for (const id of Object.keys(SECTION_HEADINGS) as SectionId[]) {
      if (SECTION_HEADINGS[id].includes(key)) found.add(id);
    }
  }
  return found;
}

function firstWord(line: string): string {
  return (stripBullet(line).match(/[A-Za-z]+/)?.[0] ?? "").toLowerCase();
}

export function analyzeResume(input: string): ResumeAnalysis {
  const text = normalizeText(input);
  const lines = splitLines(text);
  const wordCount = countWords(text);
  const foundSections = detectSections(lines);

  const contact = {
    email: EMAIL.test(text),
    phone: hasPhoneNumber(text),
    linkedin: /linkedin\.com/i.test(text),
    github: /github\.com/i.test(text),
  };

  const bulletLines = lines.filter(isBulletLine);
  // Resumes without bullet markers: judge sentence-like lines instead.
  const contentLines =
    bulletLines.length >= 3
      ? bulletLines
      : lines.filter(
          (l) => countWords(l) >= 5 && !SECTION_HEADINGS.summary.includes(headingKey(l)),
        );

  const verbCounts = new Map<string, number>();
  for (const token of tokenize(text)) {
    if (ACTION_VERBS.has(token)) verbCounts.set(token, (verbCounts.get(token) ?? 0) + 1);
  }
  const actionVerbs = [...verbCounts.entries()]
    .map(([verb, count]) => ({ verb, count }))
    .sort((a, b) => b.count - a.count || a.verb.localeCompare(b.verb));

  const strongStarts = contentLines.filter((l) => ACTION_VERBS.has(firstWord(l))).length;
  const actionVerbLineRatio = contentLines.length
    ? strongStarts / contentLines.length
    : 0;

  const lower = text.toLowerCase();
  const weakPhrases = WEAK_PHRASES.filter((p) => lower.includes(p));

  const metricLines = lines.filter(
    (l) => METRIC.test(l) && !/^\W*(?:phone|tel|mobile)/i.test(l),
  );
  const metrics = {
    count: metricLines.length,
    examples: metricLines.slice(0, 5).map((l) => {
      const t = stripBullet(l);
      return t.length > 140 ? `${t.slice(0, 139).trimEnd()}…` : t;
    }),
  };

  const hasDates = DATE.test(text);
  const read = readability(text);

  const warnings: Warning[] = [];
  const add = (severity: Warning["severity"], message: string) =>
    warnings.push({ severity, message });

  if (wordCount < 150)
    add(
      "high",
      `The resume is very short (${wordCount} words). Most strong resumes have roughly 350–800 words.`,
    );
  else if (wordCount < 250)
    add(
      "medium",
      `The resume is fairly short (${wordCount} words). Consider adding detail on impact and tools used.`,
    );
  else if (wordCount > 1100)
    add(
      "medium",
      `The resume is long (${wordCount} words). One to two pages is the usual guidance.`,
    );

  if (!contact.email)
    add("high", "No email address detected. Add a professional email near the top.");
  if (!contact.phone) add("medium", "No phone number detected. Add one near the top.");
  if (!foundSections.has("experience") && !foundSections.has("projects")) {
    add(
      "high",
      'No "Experience" or "Projects" heading detected. Use a standard heading so systems can find your work history.',
    );
  }
  if (!foundSections.has("education")) add("medium", 'No "Education" heading detected.');
  if (!foundSections.has("skills"))
    add(
      "medium",
      'No "Skills" heading detected. A dedicated skills section helps keyword matching.',
    );
  if (bulletLines.length === 0 && wordCount > 100)
    add(
      "medium",
      "No bullet points detected. Short bullets are easier for people and software to read than long paragraphs.",
    );

  const avgLineLength = lines.length ? text.length / lines.length : 0;
  if (avgLineLength > 180)
    add(
      "medium",
      "Lines are very long on average, which suggests dense paragraphs. Break them into short bullets.",
    );
  if (DECORATIVE.test(text))
    add(
      "medium",
      "Decorative symbols or emoji were found. Some systems cannot read them, so prefer plain bullets.",
    );
  const tableLikeLines = lines.filter((l) => (l.match(/\|/g) ?? []).length >= 2).length;
  if (tableLikeLines >= 3 || /\t.*\t/.test(input))
    add(
      "medium",
      "Table- or column-like text was found. Multi-column layouts and tables can be read out of order by some systems.",
    );
  if (!hasDates)
    add("medium", "No dates detected. Add start and end dates to roles and education.");
  if (metrics.count === 0 && wordCount >= 100)
    add(
      "medium",
      "No measurable achievements detected. Add numbers where true (percentages, counts, time or money saved).",
    );
  if (weakPhrases.length > 0)
    add(
      "low",
      `Weak phrases found: ${weakPhrases.map((p) => `"${p}"`).join(", ")}. Start bullets with what you did instead.`,
    );
  if (contentLines.length >= 4 && actionVerbLineRatio < 0.3)
    add(
      "low",
      "Few bullets start with a strong action verb such as built, led or reduced.",
    );

  warnings.sort(
    (a, b) =>
      ({ high: 0, medium: 1, low: 2 })[a.severity] -
      { high: 0, medium: 1, low: 2 }[b.severity],
  );

  return {
    wordCount,
    lineCount: lines.length,
    sections: (Object.keys(SECTION_HEADINGS) as SectionId[]).map((id) => ({
      id,
      label: SECTION_LABELS[id],
      found: foundSections.has(id),
    })),
    contact,
    bulletCount: bulletLines.length,
    actionVerbs,
    actionVerbLineRatio,
    weakPhrases,
    metrics,
    hasDates,
    readability: read,
    warnings,
  };
}
