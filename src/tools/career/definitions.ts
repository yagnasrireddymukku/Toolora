import type { ToolDefinition } from "@/lib/tools/types";

const PRIVACY_FAQ = {
  q: "Is my resume uploaded or stored?",
  a: "No. Analysis runs entirely in your browser. Pasted text and uploaded files are read on your device and are not sent to Toolora, a server or an AI service.",
};

export const CAREER_TOOLS: ToolDefinition[] = [
  {
    slug: "ats-resume-checker",
    category: "career",
    name: "ATS Resume Checker",
    h1: "ATS Resume Checker",
    description:
      "Get an estimated ATS analysis of your resume: keyword match against a job, sections, formatting issues, action verbs, measurable results and readability.",
    intro:
      "Paste or upload your resume, optionally add a job description, and get a transparent, estimated analysis with specific things to improve. Everything runs in your browser.",
    keywords: [
      "ats",
      "resume",
      "cv",
      "applicant tracking system",
      "resume checker",
      "resume score",
      "keywords",
      "job match",
      "resume scanner",
    ],
    popular: true,
    addedAt: "2026-10-05",
    related: [
      "resume-keyword-matcher",
      "job-description-analyzer",
      "ctc-to-inhand-calculator",
    ],
    howItWorks: [
      "Paste your resume text, or upload a PDF, DOCX or TXT file. The file is read in your browser.",
      "Optionally paste a job description to compare keywords. Without one, you still get section, formatting and writing checks.",
      "Choose Check my resume to see an estimated score, how it was built, and a list of specific issues.",
      "Copy or download the report, fix what applies to you, and run the check again.",
    ],
    formula: {
      title: "How the estimated score is built",
      body: [
        "The score is a transparent heuristic out of 100: job keyword match 45, standard sections 15, contact details 5, action verbs and measurable results 15, readability and length 10, and formatting and completeness 10. Without a job description, the keyword part is removed and the rest is rescaled to 100.",
        "Keyword match weights required skills 3×, preferred skills 2× and other repeated terms 1×. Skills come from a built-in dictionary of common technical, business and soft skills, so skills outside that dictionary may not be recognised.",
        "This is not the output of any real applicant tracking system. Companies use different, proprietary software, so treat the score as a guide to improve clarity and relevance, not a prediction.",
      ],
    },
    example: {
      title: "Worked example",
      body: [
        "A frontend developer pastes a resume and a job posting that asks for React, TypeScript, Jest, Next.js and GraphQL. The resume mentions the first three, so those count as matches and Next.js and GraphQL are listed as missing.",
        "The report also notes that two bullets start with 'worked on' and 'helped with', which hide what the person actually did, and suggests rewriting them with a strong verb and a number, such as 'Built … reducing load time by 35%'.",
      ],
    },
    tips: [
      "Use standard headings such as Experience, Education and Skills so software can find each section.",
      "Prefer a simple single-column layout. Tables, text boxes and graphics can be read out of order.",
      "Start bullets with action verbs and add numbers where they are true.",
      "Mirror the job's wording only where it honestly describes your work. Never add skills you do not have, and avoid repeating keywords.",
      "Save as a text-based PDF or DOCX, not a scanned image.",
    ],
    limitations: [
      "The analysis is an estimate based on text only. It cannot see fonts, columns, images, headers or footers.",
      "Scanned or image-only PDFs have no readable text and cannot be analysed.",
      "The skills dictionary is broad but not exhaustive, so niche tools and domain skills may not be detected.",
      "Scores reflect keyword overlap and general guidance. They do not predict whether you will be shortlisted.",
    ],
    faqs: [
      {
        q: "What is an ATS?",
        a: "An applicant tracking system is software employers use to collect and sort job applications. Many parse your resume into fields and let recruiters search by keyword.",
      },
      {
        q: "Is this score what a real ATS would give me?",
        a: "No. Every company configures its own system, and the real ones are proprietary. This tool gives an estimated analysis based on keyword overlap and common formatting guidance so you can spot obvious problems.",
      },
      {
        q: "What score should I aim for?",
        a: "Rather than chasing a number, use the list of issues and missing keywords to make your resume clearer and more relevant to each role. A well-targeted, honest resume with quantified results matters more than a high estimate.",
      },
      {
        q: "Which file formats are supported?",
        a: "PDF (with selectable text), DOCX and TXT, up to 5 MB. Older .doc files and scanned PDFs are not supported. You can always paste your text instead.",
      },
      PRIVACY_FAQ,
    ],
  },
  {
    slug: "job-description-analyzer",
    category: "career",
    name: "Job Description Analyzer",
    h1: "Job Description Analyzer",
    description:
      "Break a job posting into required and preferred skills, experience and education requirements, responsibilities, tools and the keywords worth reflecting in your resume.",
    intro:
      "Paste a job description to see what the employer is really asking for: required versus preferred skills, years of experience, education, tools and the main responsibilities.",
    keywords: [
      "job description",
      "jd",
      "job posting",
      "requirements",
      "skills",
      "keywords",
      "responsibilities",
      "job analysis",
    ],
    popular: false,
    addedAt: "2026-10-05",
    related: ["resume-keyword-matcher", "ats-resume-checker", "salary-hike-calculator"],
    howItWorks: [
      "Paste the full job description, including the requirements and responsibilities sections.",
      "Choose Analyze job description. The tool reads the section headings to separate required from preferred items.",
      "Review the skills, experience, education, responsibilities and keywords, then copy or download the analysis.",
      "Use the result to tailor your resume truthfully, or paste your resume into the keyword matcher to compare.",
    ],
    formula: {
      title: "How it analyses the text",
      body: [
        "Section headings such as Requirements, Responsibilities, Nice to have and About us tell the tool which lines describe must-haves, duties, extras and company marketing. Lines inside 'About us' or 'Benefits' are ignored.",
        "Skills are matched against a built-in dictionary of programming languages, frameworks, data, cloud, tools, methods, soft and business skills. A skill is preferred only if it appears in a nice-to-have context, otherwise it is treated as required.",
        "Experience and education come from lines mentioning years or degrees. Other keywords are plain words and two-word phrases that repeat, after removing common filler words.",
      ],
    },
    example: {
      title: "Worked example",
      body: [
        "A posting lists 'React and TypeScript' under Requirements and 'Next.js and GraphQL' under Nice to have, plus '4+ years of experience'.",
        "The analyzer reports React and TypeScript as required, Next.js and GraphQL as preferred, and '4+ years' under experience requirements.",
      ],
    },
    tips: [
      "Paste the whole posting. Headings are what let the tool tell required from preferred.",
      "Treat 'preferred' skills as a bonus: apply even if you lack some of them.",
      "Use the keyword list to choose accurate wording, not to stuff your resume.",
    ],
    limitations: [
      "Detection depends on how the posting is written. Unusual headings can lead to a skill being treated as required.",
      "Only skills in the built-in dictionary are recognised by name. Other terms appear as repeated keywords.",
      "Postings are not always accurate about what the job really needs.",
    ],
    faqs: [
      {
        q: "Does this send the job description anywhere?",
        a: "No. The analysis runs in your browser and nothing is uploaded.",
      },
      {
        q: "How does it decide what is required and what is preferred?",
        a: "It looks at section headings and phrases such as 'nice to have', 'preferred', 'bonus' and 'a plus'. Skills found elsewhere are treated as required.",
      },
      {
        q: "Should I add every keyword to my resume?",
        a: "No. Add only skills and experience you truly have, in context. Listing keywords you cannot back up will not help in an interview.",
      },
    ],
  },
  {
    slug: "resume-keyword-matcher",
    category: "career",
    name: "Resume Keyword Matcher",
    h1: "Resume Keyword Matcher",
    description:
      "Compare your resume with a job description to see matching and missing keywords, a weighted match percentage, skills by category and honest recommendations.",
    intro:
      "Find out which of a job's keywords your resume already covers and which are missing, grouped by skill category, without encouraging keyword stuffing.",
    keywords: [
      "keyword matcher",
      "resume match",
      "job match",
      "missing keywords",
      "resume keywords",
      "tailor resume",
      "skills gap",
    ],
    popular: false,
    addedAt: "2026-10-05",
    related: ["ats-resume-checker", "job-description-analyzer", "percentage-calculator"],
    howItWorks: [
      "Paste or upload your resume, and paste the job description.",
      "Choose Match keywords. The tool extracts the job's skills and recurring terms and checks each one against your resume.",
      "Review matching keywords with how often they appear, the missing ones, and a breakdown by skill category.",
      "Follow the recommendations: add only what is true, in context, and avoid repetition.",
    ],
    formula: {
      title: "How the match percentage is calculated",
      body: [
        "Match % = weight of keywords found ÷ weight of all keywords × 100. Required skills weigh 3, preferred skills 2 and other recurring terms 1.",
        "A keyword counts as found when it appears in your resume as a whole word or phrase, including common aliases for skills (for example 'k8s' for Kubernetes). 'Java' is not matched inside 'JavaScript'.",
        "Keywords repeated 8 or more times, or making up over 3% of your words, are flagged as possible keyword stuffing.",
      ],
    },
    example: {
      title: "Worked example",
      body: [
        "A job asks for React, TypeScript and Jest (required, weight 3 each) and Next.js (preferred, weight 2). Your resume has React, TypeScript and Jest but not Next.js.",
        "Found weight = 9 out of 11, so the match is 82%. Next.js is listed as missing and the tool suggests adding it only if you have genuinely used it.",
      ],
    },
    tips: [
      "Tailor a separate resume version for each kind of role instead of one generic file.",
      "Show a keyword in a bullet with context and results, not only in a skills list.",
      "If a required skill is missing and you do not have it, mention related experience or learning honestly.",
    ],
    limitations: [
      "This is an estimate using plain keyword overlap, not the algorithm of any real hiring system.",
      "It cannot judge the quality, recency or depth of your experience.",
      "Synonyms outside the built-in aliases (for example different names for the same duty) are not recognised.",
    ],
    faqs: [
      {
        q: "Will adding all the missing keywords raise my chances?",
        a: "Not necessarily. Recruiters and hiring managers read resumes too, and unsupported claims show up quickly in interviews. Add keywords only where they accurately describe your work.",
      },
      {
        q: "What counts as keyword stuffing?",
        a: "Repeating the same term many times, or hiding keyword lists in tiny or white text. The tool flags terms used very often so you can tidy them up.",
      },
      PRIVACY_FAQ,
    ],
  },
];
