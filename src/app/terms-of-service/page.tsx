import type { Metadata } from "next";
import Link from "@/components/ui/SiteLink";
import { StaticPage } from "@/components/layout/StaticPage";
import { buildMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "The terms for using Toolora: free tools provided as-is for general information, acceptable use, and limits of liability.",
  path: "/terms-of-service/",
});

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms of Service"
      path="/terms-of-service/"
      updated="5 October 2026"
    >
      <p>
        By using {SITE_NAME} you agree to these terms. If you do not agree, please do not
        use the site.
      </p>

      <h2>Use of the tools</h2>
      <p>
        {SITE_NAME} provides free online tools for general informational purposes. You may
        use them for personal, educational and commercial purposes, provided you follow
        these terms and the law.
      </p>

      <h2>No professional advice</h2>
      <p>
        Results are estimates produced from the values you enter and the stated
        assumptions. They are not academic, financial, tax, legal or career advice, and
        are not official. Always confirm important figures with your university, employer
        or a qualified professional. See the <Link href="/disclaimer/">disclaimer</Link>.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not attempt to disrupt, overload or probe the security of the site.</li>
        <li>Do not use the site to break the law or infringe others&rsquo; rights.</li>
        <li>Do not scrape the site at a rate that affects other users.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        You keep ownership of anything you enter. Because tools run in your browser, we do
        not receive it. You are responsible for having the right to use any content (for
        example a resume) that you process with a tool.
      </p>

      <h2>Availability and changes</h2>
      <p>
        The site and tools are provided &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo;. We may change, suspend or remove tools at any time, and we do
        not guarantee uninterrupted or error-free operation.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {SITE_NAME} and its operators are not
        liable for any loss or damage arising from your use of, or reliance on, the site
        or its results. Nothing in these terms limits liability that cannot be limited by
        law.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms. Continued use after an update means you accept the new
        terms. Questions? Visit the <Link href="/contact/">contact page</Link>.
      </p>
    </StaticPage>
  );
}
