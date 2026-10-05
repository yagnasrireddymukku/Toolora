import type { Metadata } from "next";
import Link from "@/components/ui/SiteLink";
import { StaticPage } from "@/components/layout/StaticPage";
import { buildMetadata } from "@/lib/seo";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How Toolora handles your information: tools run in your browser, we don't collect the data you enter, and analytics and advertising are optional and disclosed.",
  path: "/privacy-policy/",
});

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy" path="/privacy-policy/" updated="5 October 2026">
      <p>
        This policy explains what information {SITE_NAME} handles and why. We aim to
        collect as little as possible.
      </p>

      <h2>Information you enter into tools</h2>
      <p>
        All current {SITE_NAME} tools, including the calculators, the resume and job
        description tools, the JSON formatter and the QR code generator, run entirely in
        your browser. What you type or upload is processed on your device. It is not sent
        to, stored on or logged by a {SITE_NAME} server. Closing or refreshing the page
        discards it.
      </p>
      <p>
        If we ever add a feature that sends your input to a server or an external service
        (for example an AI feature), the tool will say so clearly before you use it.
      </p>

      <h2>Information collected automatically</h2>
      <p>
        Our web host may keep standard server logs (such as IP address, time and requested
        page) for security and reliability. We do not use these logs to identify
        individual visitors.
      </p>

      <h2>Analytics</h2>
      <p>
        If analytics is enabled, we use Google Analytics to understand which pages are
        used and how the site performs. It uses cookies or similar technologies and
        collects usage data such as pages viewed, approximate location and device type. It
        never receives what you type into a tool. The site works normally if you block
        analytics.
      </p>

      <h2>Advertising</h2>
      <p>
        We may show ads through Google AdSense in future. If we do, Google and its
        partners may use cookies to show personalised ads based on your visits to this and
        other sites. You can manage ad personalisation in your Google ad settings. This
        page will be updated, and a consent notice shown where the law requires one,
        before advertising starts.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        {SITE_NAME} itself does not set cookies. Cookies may be set by analytics or
        advertising providers if those are enabled.
      </p>

      <h2>Contact form</h2>
      <p>
        The contact form opens your own email app with a pre-filled message. We receive
        your message and email address only if you send it.
      </p>

      <h2>Children</h2>
      <p>
        {SITE_NAME} is not directed at children under 13 and we do not knowingly collect
        their personal information.
      </p>

      <h2>Your rights and questions</h2>
      <p>
        Depending on where you live you may have rights to access or delete personal data
        we hold. Because we do not collect the data you enter into tools, there is usually
        nothing to delete. Questions about this policy can be sent through the{" "}
        <Link href="/contact/">contact page</Link>
        {CONTACT_EMAIL ? ` or to ${CONTACT_EMAIL}` : ""}.
      </p>

      <h2>Changes</h2>
      <p>We will update the date above when this policy changes.</p>
    </StaticPage>
  );
}
