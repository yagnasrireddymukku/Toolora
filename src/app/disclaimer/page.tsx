import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { buildMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Disclaimer",
  description:
    "Toolora results are estimates for general guidance. Read about grading, salary and tax, ATS resume analysis and the accuracy of our calculators.",
  path: "/disclaimer/",
});

export default function DisclaimerPage() {
  return (
    <StaticPage title="Disclaimer" path="/disclaimer/" updated="5 October 2026">
      <p>
        {SITE_NAME} tools are built to be accurate and transparent, but every result is an
        estimate based on the values you enter and the assumptions stated on each tool
        page.
      </p>

      <h2>Grades and attendance</h2>
      <p>
        Grade-point scales, CGPA-to-percentage conversions and attendance rules vary
        between universities and boards. Built-in scales are common defaults, not any
        institution&rsquo;s official table. Your institution&rsquo;s published rules
        always take precedence.
      </p>

      <h2>Salary and tax</h2>
      <p>
        Take-home pay depends on your employer&rsquo;s salary structure, applicable laws,
        tax regime, deductions and other personal factors. The salary calculators show
        their assumptions and are not official tax or payroll advice. Consult your
        employer or a qualified tax professional for exact figures.
      </p>

      <h2>Resume and ATS analysis</h2>
      <p>
        Applicant tracking systems are proprietary and differ between employers. The ATS
        Resume Checker and related tools provide an estimated analysis based on keyword
        overlap and general formatting guidance. The score does not represent any specific
        company&rsquo;s system and does not predict hiring outcomes.
      </p>

      <h2>Other tools</h2>
      <p>
        JSON formatting and QR code generation are provided for convenience. Please verify
        generated output, especially QR codes, before using it in print or in critical
        settings.
      </p>

      <h2>External links</h2>
      <p>
        We are not responsible for the content or practices of third-party sites we may
        link to.
      </p>
    </StaticPage>
  );
}
