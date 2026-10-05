export type SkillCategory =
  | "Programming languages"
  | "Frameworks and libraries"
  | "Databases and data"
  | "Cloud and DevOps"
  | "Tools and platforms"
  | "Methodologies"
  | "Soft skills"
  | "Business and domain";

export interface Skill {
  name: string;
  category: SkillCategory;
  /** Alternative spellings that count as the same skill. */
  aliases?: string[];
}

const s = (name: string, category: SkillCategory, aliases: string[] = []): Skill => ({
  name,
  category,
  aliases,
});

const LANG: SkillCategory = "Programming languages";
const FW: SkillCategory = "Frameworks and libraries";
const DB: SkillCategory = "Databases and data";
const CLOUD: SkillCategory = "Cloud and DevOps";
const TOOL: SkillCategory = "Tools and platforms";
const METHOD: SkillCategory = "Methodologies";
const SOFT: SkillCategory = "Soft skills";
const BIZ: SkillCategory = "Business and domain";

/**
 * Curated, deliberately conservative skill dictionary. Ambiguous short names
 * (e.g. "go", "r", "c") are only matched through unambiguous aliases.
 */
export const SKILLS: Skill[] = [
  s("JavaScript", LANG, ["js", "ecmascript", "es6"]),
  s("TypeScript", LANG),
  s("Python", LANG),
  s("Java", LANG),
  s("C++", LANG),
  s("C#", LANG, ["c sharp"]),
  s("Golang", LANG),
  s("Rust", LANG),
  s("PHP", LANG),
  s("Ruby", LANG),
  s("Swift", LANG),
  s("Kotlin", LANG),
  s("Scala", LANG),
  s("R programming", LANG),
  s("MATLAB", LANG),
  s("SQL", LANG),
  s("HTML", LANG, ["html5"]),
  s("CSS", LANG, ["css3"]),
  s("Bash", LANG, ["shell scripting"]),

  s("React", FW, ["react.js", "reactjs"]),
  s("Next.js", FW, ["nextjs"]),
  s("Angular", FW, ["angularjs"]),
  s("Vue", FW, ["vue.js", "vuejs"]),
  s("Node.js", FW, ["nodejs", "node"]),
  s("Express.js", FW, ["expressjs", "express js"]),
  s("Django", FW),
  s("Flask", FW),
  s("FastAPI", FW),
  s("Spring Boot", FW, ["spring"]),
  s(".NET", FW, ["dotnet", "asp.net"]),
  s("Laravel", FW),
  s("Ruby on Rails", FW, ["rails"]),
  s("Tailwind CSS", FW, ["tailwind"]),
  s("Bootstrap", FW),
  s("Redux", FW),
  s("jQuery", FW),
  s("GraphQL", FW),
  s("REST APIs", FW, ["rest api", "restful"]),
  s("Microservices", FW, ["microservice"]),
  s("TensorFlow", FW),
  s("PyTorch", FW),
  s("scikit-learn", FW, ["sklearn"]),
  s("Pandas", FW),
  s("NumPy", FW),

  s("PostgreSQL", DB, ["postgres"]),
  s("MySQL", DB),
  s("MongoDB", DB),
  s("Redis", DB),
  s("SQL Server", DB, ["mssql"]),
  s("Oracle", DB),
  s("SQLite", DB),
  s("Elasticsearch", DB),
  s("Snowflake", DB),
  s("BigQuery", DB),
  s("Hadoop", DB),
  s("Spark", DB, ["apache spark", "pyspark"]),
  s("Kafka", DB, ["apache kafka"]),
  s("Data analysis", DB, ["data analytics"]),
  s("Data modeling", DB, ["data modelling"]),
  s("ETL", DB),
  s("Machine learning", DB, ["ml"]),
  s("Deep learning", DB),
  s("NLP", DB, ["natural language processing"]),
  s("Statistics", DB, ["statistical analysis"]),
  s("Data visualization", DB, ["data visualisation"]),

  s("AWS", CLOUD, ["amazon web services"]),
  s("Azure", CLOUD, ["microsoft azure"]),
  s("Google Cloud", CLOUD, ["gcp", "google cloud platform"]),
  s("Docker", CLOUD),
  s("Kubernetes", CLOUD, ["k8s"]),
  s("Terraform", CLOUD),
  s("Ansible", CLOUD),
  s("Jenkins", CLOUD),
  s("CI/CD", CLOUD, [
    "continuous integration",
    "continuous delivery",
    "continuous deployment",
  ]),
  s("Linux", CLOUD),
  s("Git", CLOUD, ["github", "gitlab", "bitbucket"]),
  s("DevOps", CLOUD),
  s("Serverless", CLOUD),
  s("Cybersecurity", CLOUD, ["information security", "infosec"]),

  s("Excel", TOOL, ["microsoft excel", "ms excel", "advanced excel"]),
  s("Power BI", TOOL, ["powerbi"]),
  s("Tableau", TOOL),
  s("Jira", TOOL),
  s("Figma", TOOL),
  s("Photoshop", TOOL),
  s("Salesforce", TOOL),
  s("SAP", TOOL),
  s("Google Analytics", TOOL),
  s("SEO", TOOL, ["search engine optimization", "search engine optimisation"]),
  s("Postman", TOOL),
  s("Selenium", TOOL),
  s("Jest", TOOL),
  s("Confluence", TOOL),
  s("PowerPoint", TOOL, ["microsoft powerpoint", "ms powerpoint"]),
  s("Microsoft Word", TOOL, ["ms word"]),

  s("Agile", METHOD, ["agile methodology"]),
  s("Scrum", METHOD),
  s("Kanban", METHOD),
  s("Waterfall", METHOD),
  s("Test-driven development", METHOD, ["tdd"]),
  s("Unit testing", METHOD, ["unit tests"]),
  s("Code review", METHOD, ["code reviews"]),
  s("Object-oriented programming", METHOD, ["oop", "object oriented programming"]),
  s("Design patterns", METHOD),
  s("System design", METHOD),
  s("Six Sigma", METHOD),
  s("Lean manufacturing", METHOD, ["lean methodology", "lean six sigma"]),

  s("Communication", SOFT, [
    "communication skills",
    "verbal communication",
    "written communication",
  ]),
  s("Leadership", SOFT),
  s("Teamwork", SOFT, ["collaboration", "collaborative"]),
  s("Problem solving", SOFT, ["problem-solving"]),
  s("Critical thinking", SOFT),
  s("Time management", SOFT),
  s("Adaptability", SOFT),
  s("Mentoring", SOFT, ["mentorship", "coaching"]),
  s("Stakeholder management", SOFT, ["stakeholder communication"]),
  s("Presentation skills", SOFT),
  s("Negotiation", SOFT),
  s("Analytical skills", SOFT, ["analytical thinking"]),
  s("Attention to detail", SOFT),

  s("Project management", BIZ),
  s("Product management", BIZ),
  s("Business analysis", BIZ, ["business analyst"]),
  s("Financial analysis", BIZ),
  s("Budgeting", BIZ),
  s("Forecasting", BIZ),
  s("Accounting", BIZ),
  s("Auditing", BIZ),
  s("Sales", BIZ),
  s("Marketing", BIZ),
  s("Digital marketing", BIZ),
  s("Content writing", BIZ, ["copywriting"]),
  s("Customer service", BIZ, ["customer support"]),
  s("Recruitment", BIZ, ["talent acquisition"]),
  s("CRM", BIZ),
  s("Supply chain", BIZ),
  s("Operations management", BIZ),
  s("Compliance", BIZ),
  s("Risk management", BIZ),
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  "Programming languages",
  "Frameworks and libraries",
  "Databases and data",
  "Cloud and DevOps",
  "Tools and platforms",
  "Methodologies",
  "Soft skills",
  "Business and domain",
];

/** Strong, specific verbs that open good resume bullets. */
export const ACTION_VERBS = new Set(
  (
    "achieved analyzed analysed architected automated built championed collaborated completed configured consolidated coordinated created " +
    "cut debugged decreased delivered deployed designed developed directed drove eliminated engineered enhanced established evaluated " +
    "executed expanded generated grew guided implemented improved increased initiated integrated introduced launched led leveraged " +
    "maintained managed mentored migrated modernized negotiated optimized orchestrated organized owned partnered pioneered planned " +
    "produced programmed published reduced refactored released resolved restructured reviewed scaled secured shipped simplified " +
    "solved spearheaded standardized streamlined strengthened supervised tested trained transformed troubleshot upgraded validated wrote"
  ).split(" "),
);

/** Weak openers that hide what you actually did. */
export const WEAK_PHRASES = [
  "responsible for",
  "duties included",
  "worked on",
  "helped with",
  "helped to",
  "assisted with",
  "tasked with",
  "involved in",
  "participated in",
];

export function getSkill(name: string): Skill {
  const skill = SKILLS.find((k) => k.name === name);
  if (!skill) throw new Error(`Unknown skill: ${name}`);
  return skill;
}
