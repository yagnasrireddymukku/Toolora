import type { ToolDefinition } from "@/lib/tools/types";

export const EDUCATION_TOOLS: ToolDefinition[] = [
  {
    slug: "cgpa-calculator",
    category: "education",
    name: "CGPA Calculator",
    h1: "CGPA Calculator",
    description:
      "Calculate your CGPA from subject credits and grades, or from semester SGPAs, with a full step-by-step breakdown.",
    intro:
      "Work out your Cumulative Grade Point Average from your subjects, or combine your semester SGPAs. Pick a grading scale, see exactly how the result is calculated, then copy or share it.",
    keywords: [
      "cgpa",
      "gpa",
      "grade point",
      "cumulative",
      "marks",
      "university",
      "college",
      "semester",
      "percentage",
    ],
    popular: true,
    addedAt: "2026-10-05",
    related: ["sgpa-calculator", "percentage-calculator", "attendance-calculator"],
    howItWorks: [
      "Choose a calculation method: from individual subjects, or from your semester SGPAs.",
      "For subjects, select your grading scale and enter each subject's credits and grade. Use the custom option to type grade points your university assigns.",
      "For semesters, enter each semester's SGPA and its total credits.",
      "Choose Calculate to see your CGPA, the working, and an approximate percentage on 10-point scales.",
    ],
    formula: {
      title: "CGPA formula",
      body: [
        "CGPA = Σ(credits × grade points) ÷ Σ(credits). Each subject counts in proportion to its credits, so a 4-credit subject affects the result twice as much as a 2-credit one.",
        "When you already have semester SGPAs, CGPA = Σ(SGPA × semester credits) ÷ Σ(semester credits). The two methods give the same answer when the SGPAs are not rounded.",
        "The approximate percentage shown for 10-point scales uses CGPA × 9.5, a conversion many universities use. Yours may differ, so confirm with your institution.",
      ],
    },
    example: {
      title: "Worked example",
      body: [
        "Semester 1 SGPA is 8.2 over 22 credits and semester 2 SGPA is 8.8 over 24 credits.",
        "(8.2 × 22 + 8.8 × 24) ÷ (22 + 24) = (180.4 + 211.2) ÷ 46 = 391.6 ÷ 46 = 8.51 CGPA.",
      ],
    },
    tips: [
      "Include every graded subject. Leave out audit or pass/fail subjects only if your university excludes them from CGPA.",
      "Use credits from your marksheet, not the number of hours per week.",
      "If your university's letter grades map to different points, use the custom option and enter its points.",
      "Don't average SGPAs without weighting them by credits unless every semester has identical credits.",
    ],
    limitations: [
      "Built-in scales are common defaults, not any one university's official table.",
      "Some universities drop the lowest grade, apply grace marks or treat repeated subjects specially. This tool does not model those rules.",
      "The percentage conversion is an approximation. Only your university's official formula is authoritative.",
    ],
    faqs: [
      {
        q: "What is CGPA?",
        a: "CGPA stands for Cumulative Grade Point Average. It is the credit-weighted average of the grade points you have earned across all completed semesters.",
      },
      {
        q: "How is CGPA different from SGPA?",
        a: "SGPA covers a single semester, while CGPA covers all semesters so far. CGPA is effectively the credit-weighted average of your SGPAs.",
      },
      {
        q: "How do I convert CGPA to percentage?",
        a: "Many Indian universities multiply a 10-point CGPA by 9.5. Others use different formulas, so use the one published by your university when you need an official figure.",
      },
      {
        q: "Does this calculator store my marks?",
        a: "No. The calculation runs in your browser and nothing you enter is sent to a server.",
      },
    ],
  },
  {
    slug: "sgpa-calculator",
    category: "education",
    name: "SGPA Calculator",
    h1: "SGPA Calculator",
    description:
      "Calculate your semester SGPA from subject credits and grade points, with a clear calculation breakdown.",
    intro:
      "Enter this semester's subjects with their credits and grades to get your Semester Grade Point Average, along with the full working.",
    keywords: ["sgpa", "semester", "gpa", "grade point", "credits", "result", "marks"],
    popular: true,
    addedAt: "2026-10-05",
    related: ["cgpa-calculator", "percentage-calculator", "attendance-calculator"],
    howItWorks: [
      "Select your grading scale, or choose custom to type grade points directly.",
      "Add a row for each subject and enter its credits and grade. Remove rows you do not need.",
      "Choose Calculate SGPA. Empty rows are skipped, and incomplete rows are highlighted.",
      "Review the breakdown table, then copy or share the result.",
    ],
    formula: {
      title: "SGPA formula",
      body: [
        "SGPA = Σ(credits × grade points) ÷ Σ(credits), summed over the subjects of one semester.",
        "Subjects with more credits carry more weight. A subject with zero credits would not affect the result, so credits must be greater than 0.",
      ],
    },
    example: {
      title: "Worked example",
      body: [
        "Data Structures: 4 credits, grade O (10). Databases: 3 credits, A+ (9). Networks: 3 credits, B (6). Lab: 2 credits, A (8).",
        "Weighted points = 4×10 + 3×9 + 3×6 + 2×8 = 40 + 27 + 18 + 16 = 101. Total credits = 12. SGPA = 101 ÷ 12 = 8.42.",
      ],
    },
    tips: [
      "Check the grade-point table on your marksheet. Letter grades are not mapped the same way everywhere.",
      "Enter lab and elective credits too if they count toward your SGPA.",
      "Keep this semester's SGPA and credits handy: you will need them to compute CGPA.",
    ],
    limitations: [
      "Built-in scales are common defaults, not a specific university's official table.",
      "Grace marks, moderation and special rules for failed or repeated subjects are not modelled.",
    ],
    faqs: [
      {
        q: "What is SGPA?",
        a: "SGPA is the Semester Grade Point Average: the credit-weighted average of grade points earned in a single semester.",
      },
      {
        q: "Do failed subjects count in SGPA?",
        a: "That depends on your university. Many include them with 0 grade points; some exclude them until cleared. Enter the grade your university uses.",
      },
      {
        q: "Can I use grade points that are not on the list?",
        a: "Yes. Choose the custom option and type the grade points for each subject.",
      },
    ],
  },
  {
    slug: "percentage-calculator",
    category: "education",
    name: "Percentage Calculator",
    h1: "Percentage Calculator",
    description:
      "Calculate a percentage of a number, increases, decreases, percentage change, percentage difference and marks percentage.",
    intro:
      "Six everyday percentage calculations in one place. Each result shows the working so you can check it.",
    keywords: [
      "percentage",
      "percent",
      "increase",
      "decrease",
      "difference",
      "marks",
      "discount",
      "change",
    ],
    popular: true,
    addedAt: "2026-10-05",
    related: ["cgpa-calculator", "sgpa-calculator", "attendance-calculator"],
    howItWorks: [
      "Pick the type of percentage calculation from the tabs.",
      "Enter the two values. Commas are fine, so 1,50,000 works.",
      "Choose Calculate to see the answer and the working.",
    ],
    formula: {
      title: "Formulas used",
      body: [
        "Percentage of a number: X% of Y = X ÷ 100 × Y.",
        "Increase or decrease by a percentage: new value = value × (1 ± percentage ÷ 100).",
        "Percentage change: (new − old) ÷ |old| × 100. Percentage difference: |a − b| ÷ ((|a| + |b|) ÷ 2) × 100.",
        "Marks percentage: marks obtained ÷ total marks × 100.",
      ],
    },
    example: {
      title: "Worked examples",
      body: [
        "15% of 200 = 15 ÷ 100 × 200 = 30.",
        "432 marks out of 500 = 432 ÷ 500 × 100 = 86.4%.",
        "A price rising from 50 to 75 is a (75 − 50) ÷ 50 × 100 = 50% increase.",
      ],
    },
    tips: [
      "Use % change when one value is the clear starting point, and % difference when neither is.",
      "A 50% increase followed by a 50% decrease does not return to the start. The decrease applies to the larger number.",
      "For marks, make sure the total is the maximum possible marks for that exam.",
    ],
    limitations: ["Results are rounded to at most four decimal places for display."],
    faqs: [
      {
        q: "What is the difference between percentage change and percentage difference?",
        a: "Percentage change measures movement from an old value to a new value, so direction matters. Percentage difference compares two values symmetrically using their average, so order does not matter.",
      },
      {
        q: "Why can't I calculate a percentage change from 0?",
        a: "Any change from zero is infinitely large in percentage terms, so there is no meaningful percentage. Use the absolute difference instead.",
      },
      {
        q: "How do I calculate a discount?",
        a: "Use Decrease by %. Enter the original price and the discount percentage to get the price after discount.",
      },
    ],
  },
  {
    slug: "attendance-calculator",
    category: "education",
    name: "Attendance Calculator",
    h1: "Attendance Calculator",
    description:
      "Find your attendance percentage, how many classes you can still miss, or how many you must attend to reach the required percentage.",
    intro:
      "Enter the classes held and attended, plus your required percentage. You will see where you stand and exactly how many classes you can miss or need to attend.",
    keywords: [
      "attendance",
      "classes",
      "75%",
      "bunk",
      "shortage",
      "college",
      "school",
      "percentage",
    ],
    popular: true,
    addedAt: "2026-10-05",
    related: ["percentage-calculator", "cgpa-calculator", "sgpa-calculator"],
    howItWorks: [
      "Enter the total classes held so far and how many you attended.",
      "Enter the required attendance percentage (75% by default).",
      "Choose Calculate attendance to see your percentage and how many classes you can still miss, or must attend in a row to recover.",
    ],
    formula: {
      title: "Formulas and assumptions",
      body: [
        "Current attendance = attended ÷ total × 100.",
        "Classes you can miss: the largest m where attended ÷ (total + m) ≥ required ÷ 100, which gives m = ⌊100 × attended ÷ required − total⌋.",
        "Classes you must attend: the smallest x where (attended + x) ÷ (total + x) ≥ required ÷ 100, which gives x = ⌈(required × total − 100 × attended) ÷ (100 − required)⌉.",
        "Assumption: every future class is counted in the total, and you attend all of the next x classes (or miss the next m).",
      ],
    },
    example: {
      title: "Worked examples",
      body: [
        "50 classes held, 42 attended, 75% required: attendance is 84%. 42 ÷ (50 + 6) = 75%, so you can miss 6 more classes.",
        "40 classes held, 24 attended (60%), 75% required: attend the next 24 classes in a row, since (24 + 24) ÷ (40 + 24) = 75%.",
      ],
    },
    tips: [
      "Check whether your institution counts medical leave or duty leave as attended.",
      "Recalculate as the term progresses. The number of classes you can miss shrinks as you use them.",
      "Keep a small buffer instead of aiming for exactly the minimum.",
    ],
    limitations: [
      "Institution-specific rules (condonation, subject-wise minimums, leave policies) are not modelled.",
      "A requirement of 100% cannot be reached again after a missed class.",
    ],
    faqs: [
      {
        q: "How is attendance percentage calculated?",
        a: "Divide the classes you attended by the total classes held, then multiply by 100.",
      },
      {
        q: "How many classes can I miss and still keep 75%?",
        a: "It depends on your current numbers. Enter them above. The tool finds the largest number of additional missed classes that keeps you at or above the requirement.",
      },
      {
        q: "Does this include classes that have not happened yet?",
        a: "Only classes already held. Missed or attended future classes are added to the total as they happen, which is exactly what the 'can miss' and 'must attend' figures assume.",
      },
    ],
  },
];
