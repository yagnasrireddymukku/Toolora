/** Shared text helpers for the resume and job-description tools. Pure and browser/Node safe. */

/** Maximum characters analysed. Protects the browser from pathological input. */
export const MAX_TEXT_LENGTH = 60_000;

export function normalizeText(input: string): string {
  return input
    .slice(0, MAX_TEXT_LENGTH)
    .replace(/\r\n?/g, "\n")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[   ]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

const BULLET_PREFIX = /^\s*(?:[-*•●▪◦‣–—>]|\d{1,2}[.)])\s+/;

export function isBulletLine(line: string): boolean {
  return BULLET_PREFIX.test(line);
}

export function stripBullet(line: string): string {
  return line.replace(BULLET_PREFIX, "").trim();
}

export const STOPWORDS = new Set(
  (
    "a about above after again against all also am an and any are as at be because been before being below between both but by " +
    "can could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is it its " +
    "just me more most my no nor not now of off on once only or other our out over own same she should so some such than that the their them then " +
    "there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours " +
    "etc eg ie via per within across among amongst upon using use used"
  ).split(" "),
);

/** Words that appear in almost every job post and carry no matching value. */
export const JOB_NOISE = new Set(
  (
    "experience experienced work working works team teams ability able strong good great excellent knowledge understanding skills skill " +
    "required requirements requirement preferred plus bonus years year role roles position job candidate candidates looking join company " +
    "responsibilities responsibility including include includes related relevant etc etc. should must will can may need needs needed " +
    "well new help helps support supports ensure ensuring provide providing make making take taking part full time apply " +
    "opportunity environment business customer customers people person best high level based across within one two three " +
    "degree bachelor bachelors master masters qualification qualifications minimum equivalent demonstrated proven " +
    "seeking hire hiring salary benefits employer equal employment description duties day days like using use used"
  ).split(" "),
);

/** Lowercased word tokens, keeping tech-style tokens such as c++, c#, node.js, .net. */
export function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9][a-z0-9+#.]*[a-z0-9+#]|[a-z0-9]/g);
  if (!matches) return [];
  return matches.map((t) => t.replace(/\.+$/, "")).filter(Boolean);
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Case-insensitive whole-term matcher. Uses explicit boundaries instead of \b so that
 * terms like "c++", "c#" and ".net" match and "java" does not match "javascript".
 */
export function termRegex(term: string): RegExp {
  return new RegExp(
    `(?<![a-z0-9+#])${escapeRegExp(term.toLowerCase())}(?![a-z0-9+#])`,
    "gi",
  );
}

export function countTerm(text: string, term: string): number {
  return (text.match(termRegex(term)) ?? []).length;
}

export function countWords(text: string): number {
  return text.trim() === "" ? 0 : (text.trim().match(/\S+/g) ?? []).length;
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return w.length === 0 ? 0 : 1;
  const groups = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "")
    .match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups?.length ?? 1);
}

export interface Readability {
  /** Flesch Reading Ease (higher = easier). Roughly 0–100. */
  fleschReadingEase: number;
  avgWordsPerSentence: number;
  sentenceCount: number;
  label: "Very easy" | "Easy" | "Standard" | "Fairly difficult" | "Difficult";
}

export function readability(text: string): Readability {
  // Treat each line / sentence as a unit: resumes use bullets rather than full stops.
  const units = text
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => /[a-z]/i.test(s));
  const words = text.match(/[A-Za-z][A-Za-z'-]*/g) ?? [];
  const sentenceCount = Math.max(1, units.length);
  if (words.length === 0) {
    return {
      fleschReadingEase: 0,
      avgWordsPerSentence: 0,
      sentenceCount: 0,
      label: "Difficult",
    };
  }
  const syllables = words.reduce((s, w) => s + countSyllables(w), 0);
  const asl = words.length / sentenceCount;
  const asw = syllables / words.length;
  const score = Math.max(0, Math.min(100, 206.835 - 1.015 * asl - 84.6 * asw));
  const label =
    score >= 80
      ? "Very easy"
      : score >= 60
        ? "Easy"
        : score >= 40
          ? "Standard"
          : score >= 25
            ? "Fairly difficult"
            : "Difficult";
  return {
    fleschReadingEase: Math.round(score),
    avgWordsPerSentence: Math.round(asl * 10) / 10,
    sentenceCount,
    label,
  };
}
