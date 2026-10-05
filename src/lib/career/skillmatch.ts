import { SKILLS, type Skill } from "./skills";
import { escapeRegExp } from "./text";

interface CompiledSkill {
  skill: Skill;
  regex: RegExp;
}

let compiled: CompiledSkill[] | null = null;

function compile(): CompiledSkill[] {
  if (compiled) return compiled;
  compiled = SKILLS.map((skill) => {
    const terms = [skill.name, ...(skill.aliases ?? [])]
      .map((t) => escapeRegExp(t.toLowerCase()))
      // Longest first so "spring boot" wins over "spring".
      .sort((a, b) => b.length - a.length);
    return {
      skill,
      regex: new RegExp(`(?<![a-z0-9+#])(?:${terms.join("|")})(?![a-z0-9+#])`, "gi"),
    };
  });
  return compiled;
}

/** Number of times a skill (by name or alias) appears in `text`. */
export function countSkill(text: string, skill: Skill): number {
  const entry = compile().find((c) => c.skill === skill);
  if (!entry) return 0;
  return (text.match(entry.regex) ?? []).length;
}

/** All dictionary skills found in `text`, with occurrence counts. */
export function findSkills(text: string): { skill: Skill; count: number }[] {
  const found: { skill: Skill; count: number }[] = [];
  for (const { skill, regex } of compile()) {
    const count = (text.match(regex) ?? []).length;
    if (count > 0) found.push({ skill, count });
  }
  return found;
}

/** Lowercase word fragments covered by a skill's names, used to avoid duplicate keyword entries. */
export function skillTokens(skill: Skill): string[] {
  return [skill.name, ...(skill.aliases ?? [])]
    .flatMap((t) => t.toLowerCase().split(/[^a-z0-9+#.]+/))
    .filter(Boolean);
}
