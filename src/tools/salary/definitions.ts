import type { ToolDefinition } from "@/lib/tools/types";

export const SALARY_TOOLS: ToolDefinition[] = [
  {
    slug: "ctc-to-inhand-calculator",
    category: "salary",
    name: "CTC to In-Hand Salary Calculator",
    h1: "CTC to In-Hand Salary Calculator",
    description:
      "Estimate your monthly in-hand salary from annual CTC with a transparent breakdown of basic, HRA, PF, professional tax and income tax.",
    intro:
      "Turn an annual CTC into an estimated monthly take-home figure. Every assumption is visible and adjustable, so you can match it to your offer letter.",
    keywords: [
      "ctc",
      "in hand",
      "inhand",
      "take home",
      "salary",
      "pf",
      "provident fund",
      "tax",
      "net salary",
      "monthly salary",
      "offer",
    ],
    popular: true,
    addedAt: "2026-10-05",
    related: [
      "salary-hike-calculator",
      "percentage-calculator",
      "job-description-analyzer",
    ],
    howItWorks: [
      "Enter your annual CTC. If part of it is variable pay, enter only the fixed part.",
      "Set basic pay as a percentage of CTC and HRA as a percentage of basic. Defaults of 40% and 40% are common but vary by employer.",
      "Tick which employer contributions are inside your CTC: employer PF, gratuity and other benefits such as insurance.",
      "Enter professional tax and any other monthly deductions, then choose how income tax should be handled.",
      "Choose Calculate to see monthly and annual figures, then copy, share or download the breakdown as CSV.",
    ],
    formula: {
      title: "How the calculation works",
      body: [
        "Gross salary = CTC − employer PF − gratuity − other employer benefits. Basic = CTC × basic %. HRA = basic × HRA %. Special allowance is the balancing figure, so earnings always add up to gross.",
        "Employee PF = 12% of basic (or of the ₹15,000/month wage ceiling if you choose that option). Employer PF uses the same wage.",
        "In-hand salary = gross − employee PF − professional tax − other deductions − income tax, shown per year and divided by 12 for the monthly figure.",
        "Income tax (estimate mode) uses the new tax regime: taxable income is gross less the ₹75,000 standard deduction, taxed on the new-regime slabs, with the section 87A rebate (nil tax up to ₹12 lakh taxable income, with marginal relief just above it) and 4% cess. The slabs are shown on this page as assumptions and can change with each Budget.",
      ],
    },
    example: {
      title: "Worked example",
      body: [
        "CTC ₹12,00,000, basic 40% and HRA 40% of basic, with employer PF inside CTC.",
        "Basic = ₹4,80,000. HRA = ₹1,92,000. Employer PF = 12% × ₹4,80,000 = ₹57,600, so gross = ₹11,42,400 and special allowance = ₹4,70,400.",
        "Taxable income = ₹11,42,400 − ₹75,000 = ₹10,67,400, which is within the ₹12 lakh rebate limit, so estimated tax is nil. Deductions are employee PF ₹57,600 and professional tax ₹2,400 (₹200 × 12).",
        "In-hand = ₹11,42,400 − ₹57,600 − ₹2,400 = ₹10,82,400 per year, about ₹90,200 per month.",
      ],
    },
    tips: [
      "Check your offer letter for the exact basic, HRA and special allowance. Use those percentages here.",
      "Ask whether PF is calculated on full basic or the ₹15,000 ceiling. It changes take-home noticeably.",
      "If you follow the old tax regime or know your TDS, choose 'I will enter my yearly tax'.",
      "Variable pay and joining bonuses are usually taxed when paid and are not part of monthly pay.",
    ],
    limitations: [
      "This is an estimate, not payroll software or tax advice. Employers structure pay differently.",
      "Tax is estimated for a resident individual under 60 on the new regime only. Old-regime deductions (80C, HRA exemption and so on) are not modelled.",
      "Reimbursements, LTA, NPS, bonuses, perquisites, surcharge on very high incomes and state-specific rules are not included.",
      "Tax slabs and limits change over time. Verify against current official rules.",
    ],
    faqs: [
      {
        q: "What is the difference between CTC and in-hand salary?",
        a: "CTC is the total yearly cost to your employer, including benefits you do not receive as cash such as employer PF and gratuity. In-hand salary is the amount credited to your bank account after deductions like employee PF, professional tax and income tax.",
      },
      {
        q: "Why is my actual salary different from this estimate?",
        a: "Employers decide how CTC is split and which benefits are included. Tax deductions also depend on your declarations and regime. Use your payslip or offer letter for exact numbers, and adjust the inputs here to match.",
      },
      {
        q: "Is employer PF part of CTC?",
        a: "At most companies, yes. The employer's 12% PF contribution is counted inside CTC, so it reduces your gross salary. The tool lets you switch this off if your CTC excludes it.",
      },
      {
        q: "Is this tax advice?",
        a: "No. It is a general estimate based on stated assumptions. For advice about your own tax position, speak to a qualified tax professional.",
      },
    ],
  },
  {
    slug: "salary-hike-calculator",
    category: "salary",
    name: "Salary Hike Calculator",
    h1: "Salary Hike Calculator",
    description:
      "Work out your new salary, hike amount and monthly and annual difference from a hike percentage, or find the percentage from two salaries.",
    intro:
      "See what a raise is really worth. Enter your salary and the hike percentage to get your new salary and the difference per month and per year, or work backwards from an offer.",
    keywords: [
      "salary hike",
      "increment",
      "raise",
      "appraisal",
      "hike percentage",
      "new salary",
      "offer comparison",
      "pay rise",
    ],
    popular: true,
    addedAt: "2026-10-05",
    related: [
      "ctc-to-inhand-calculator",
      "percentage-calculator",
      "resume-keyword-matcher",
    ],
    howItWorks: [
      "Choose whether you are entering annual or monthly salary.",
      "Enter your current salary and the hike percentage to get the new salary, or switch tabs and enter the new salary to find the hike percentage.",
      "Choose Calculate to see the hike amount and the monthly and annual difference, then copy or share it.",
    ],
    formula: {
      title: "Formulas",
      body: [
        "New salary = current salary × (1 + hike % ÷ 100). Hike amount = new salary − current salary.",
        "Hike % from two salaries = (new − current) ÷ current × 100. Monthly figures are annual figures ÷ 12.",
      ],
    },
    example: {
      title: "Worked example",
      body: [
        "Current salary ₹10,00,000 per year with a 12% hike: hike amount = ₹1,20,000 and new salary = ₹11,20,000.",
        "That is ₹10,000 more per month (₹1,20,000 ÷ 12), before tax and deductions.",
      ],
    },
    tips: [
      "Compare the hike on fixed pay, not total CTC, if part of your CTC is variable.",
      "A higher gross salary does not raise take-home by the same amount because tax slabs apply. Use the CTC calculator to estimate the net effect.",
      "When comparing offers, convert both to the same period (annual or monthly) first.",
    ],
    limitations: [
      "Figures are gross, before tax, PF and other deductions.",
      "The tool treats the hike as applying to the whole salary.",
    ],
    faqs: [
      {
        q: "How is a salary hike percentage calculated?",
        a: "Subtract the old salary from the new salary, divide by the old salary, then multiply by 100.",
      },
      {
        q: "Does this show my in-hand increase?",
        a: "No. It shows the gross change. For estimated take-home pay use the CTC to in-hand calculator with your new CTC.",
      },
      {
        q: "Can I enter monthly salary?",
        a: "Yes. Choose Monthly in the selector. The tool converts it to annual figures and also shows monthly values.",
      },
    ],
  },
];
