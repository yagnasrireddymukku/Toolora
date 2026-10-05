import { describe, expect, it } from "vitest";
import { analyzeJobDescription } from "./job";
import { matchResumeToJob } from "./match";
import { analyzeResume } from "./resume";
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_RESUME } from "./samples";
import { estimateScore } from "./score";
import { countTerm, readability, termRegex } from "./text";

describe("text helpers", () => {
  it("matches tech terms on whole-term boundaries", () => {
    expect(countTerm("I know Java and JavaScript", "java")).toBe(1);
    expect(countTerm("C++ and C# and .NET", "c++")).toBe(1);
    expect(countTerm("C++ and C# and .NET", "c#")).toBe(1);
    expect(countTerm("Built with Node.js, node.js again", "node.js")).toBe(2);
    expect("rust-lang".match(termRegex("rust"))).not.toBeNull();
    expect("trust".match(termRegex("rust"))).toBeNull();
  });

  it("computes readability for plain text", () => {
    const easy = readability("The cat sat. The dog ran. We had fun.");
    expect(easy.fleschReadingEase).toBeGreaterThan(80);
    expect(readability("").sentenceCount).toBe(0);
  });
});

describe("analyzeJobDescription", () => {
  const profile = analyzeJobDescription(SAMPLE_JOB_DESCRIPTION);

  it("classifies required and preferred skills using section headings", () => {
    expect(profile.requiredSkills).toEqual(
      expect.arrayContaining([
        "React",
        "TypeScript",
        "JavaScript",
        "REST APIs",
        "Git",
        "Jest",
      ]),
    );
    expect(profile.preferredSkills).toEqual(
      expect.arrayContaining(["Next.js", "GraphQL", "AWS", "CI/CD"]),
    );
    expect(profile.requiredSkills).not.toContain("Next.js");
  });

  it("ignores the company/benefits section", () => {
    expect(profile.keywords.map((k) => k.term)).not.toContain("fintech");
  });

  it("extracts experience, education and responsibilities", () => {
    expect(profile.experience.join(" ")).toMatch(/4\+ years/);
    expect(profile.education.join(" ")).toMatch(/Bachelor/);
    expect(profile.responsibilities.length).toBeGreaterThanOrEqual(3);
    expect(profile.responsibilities[0]).toMatch(/Design and build/);
  });

  it("groups skills by category and separates soft skills", () => {
    expect(profile.skillsByCategory["Programming languages"]).toContain("TypeScript");
    expect(profile.softSkills).toContain("Communication");
    expect(profile.technologies).toContain("React");
    expect(profile.technologies).not.toContain("Communication");
  });

  it("treats a post with no headings as required", () => {
    const p = analyzeJobDescription("We need someone who knows Python and SQL.");
    expect(p.requiredSkills).toEqual(expect.arrayContaining(["Python", "SQL"]));
  });

  it("handles empty and junk input", () => {
    expect(analyzeJobDescription("").skills).toEqual([]);
    expect(analyzeJobDescription("!!! ??? ...").keywords).toEqual([]);
  });
});

describe("analyzeResume", () => {
  const analysis = analyzeResume(SAMPLE_RESUME);

  it("detects sections and contact details", () => {
    const found = analysis.sections.filter((s) => s.found).map((s) => s.id);
    expect(found).toEqual(
      expect.arrayContaining(["summary", "experience", "education", "skills"]),
    );
    expect(analysis.contact).toEqual({
      email: true,
      phone: true,
      linkedin: true,
      github: true,
    });
  });

  it("finds measurable achievements and action verbs", () => {
    expect(analysis.metrics.count).toBeGreaterThanOrEqual(4);
    expect(analysis.actionVerbs.map((v) => v.verb)).toEqual(
      expect.arrayContaining(["built", "led"]),
    );
    expect(analysis.actionVerbLineRatio).toBeGreaterThan(0.5);
  });

  it("flags weak phrases", () => {
    expect(analysis.weakPhrases).toContain("worked on");
  });

  it("warns about a very short, contact-less resume", () => {
    const bad = analyzeResume("I am a hard worker. I like computers.");
    const messages = bad.warnings.map((w) => w.message).join(" ");
    expect(messages).toMatch(/very short/);
    expect(messages).toMatch(/email/);
    expect(bad.warnings[0].severity).toBe("high");
  });

  it("flags decorative symbols and tables", () => {
    const text =
      `Experience\n★ Did a thing\n| a | b |\n| c | d |\n| e | f |\n` +
      "word ".repeat(120);
    const messages = analyzeResume(text)
      .warnings.map((w) => w.message)
      .join(" ");
    expect(messages).toMatch(/Decorative symbols/);
    expect(messages).toMatch(/Table/);
  });

  it("is safe on empty input", () => {
    const empty = analyzeResume("");
    expect(empty.wordCount).toBe(0);
    expect(empty.warnings.length).toBeGreaterThan(0);
  });
});

describe("matchResumeToJob", () => {
  const match = matchResumeToJob(SAMPLE_RESUME, SAMPLE_JOB_DESCRIPTION)!;

  it("separates matched and missing keywords", () => {
    const matched = match.matched.map((k) => k.term);
    const missing = match.missing.map((k) => k.term);
    expect(matched).toEqual(
      expect.arrayContaining(["React", "TypeScript", "JavaScript", "Git", "Jest"]),
    );
    expect(missing).toEqual(expect.arrayContaining(["Next.js", "GraphQL", "AWS"]));
    expect(matched).not.toContain("AWS");
  });

  it("returns a bounded weighted percentage and category breakdown", () => {
    expect(match.matchPercent).toBeGreaterThan(40);
    expect(match.matchPercent).toBeLessThan(100);
    expect(
      match.byCategory.find((c) => c.category === "Programming languages")?.matched,
    ).toContain("TypeScript");
  });

  it("gives honest recommendations without encouraging stuffing", () => {
    const text = match.recommendations.join(" ");
    expect(text).toMatch(/only add what is true|genuinely have/i);
    expect(text).toMatch(/Keywords are only one signal/);
  });

  it("detects keyword stuffing", () => {
    const stuffed = `${SAMPLE_RESUME}\n${"React ".repeat(20)}`;
    const m = matchResumeToJob(stuffed, SAMPLE_JOB_DESCRIPTION)!;
    expect(m.overused.map((o) => o.term)).toContain("React");
    expect(m.recommendations.join(" ")).toMatch(/keyword stuffing/);
  });

  it("returns null when the job description has nothing to match", () => {
    expect(matchResumeToJob(SAMPLE_RESUME, "")).toBeNull();
  });

  it("scores a perfect copy of the JD at 100%", () => {
    expect(
      matchResumeToJob(SAMPLE_JOB_DESCRIPTION, SAMPLE_JOB_DESCRIPTION)!.matchPercent,
    ).toBe(100);
  });
});

describe("estimateScore", () => {
  it("is bounded and explains each component", () => {
    const analysis = analyzeResume(SAMPLE_RESUME);
    const withJob = estimateScore(
      analysis,
      matchResumeToJob(SAMPLE_RESUME, SAMPLE_JOB_DESCRIPTION),
    );
    expect(withJob.total).toBeGreaterThan(55);
    expect(withJob.total).toBeLessThanOrEqual(100);
    expect(withJob.components.map((c) => c.key)).toContain("keywords");
    for (const c of withJob.components) {
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(c.max);
      expect(c.detail.length).toBeGreaterThan(0);
    }
  });

  it("drops the keyword component without a job description and still totals out of 100", () => {
    const s = estimateScore(analyzeResume(SAMPLE_RESUME), null);
    expect(s.components.map((c) => c.key)).not.toContain("keywords");
    expect(s.total).toBeGreaterThan(50);
    expect(s.total).toBeLessThanOrEqual(100);
  });

  it("scores an empty resume low", () => {
    expect(estimateScore(analyzeResume(""), null).total).toBeLessThan(25);
  });
});
