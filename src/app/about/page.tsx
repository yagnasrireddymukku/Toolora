import type { Metadata } from "next";
import Link from "@/components/ui/SiteLink";
import { StaticPage } from "@/components/layout/StaticPage";
import { buildMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "About Toolora",
  description:
    "Toolora is a collection of free, private, browser-based tools for students, job seekers, professionals and developers. Learn what we build and how we think about it.",
  path: "/about/",
});

export default function AboutPage() {
  return (
    <StaticPage title={`About ${SITE_NAME}`} path="/about/" intro={SITE_TAGLINE}>
      <p>
        {SITE_NAME} is a growing set of free online tools for study, work and everyday
        tasks: grade and attendance calculators for students, resume and job-description
        analysis for job seekers, salary calculators for professionals, and small
        utilities for developers.
      </p>

      <h2>What we believe</h2>
      <ul>
        <li>
          <strong>Private by default.</strong> Tools run in your browser. The marks,
          salary figures, resumes, JSON and QR content you enter are processed on your
          device and are not uploaded to a {SITE_NAME} server.
        </li>
        <li>
          <strong>Show the working.</strong> Every calculator explains its formula, shows
          a worked example and states its assumptions, so you can check the result
          yourself.
        </li>
        <li>
          <strong>Honest about limits.</strong> Where an answer depends on your university
          or employer, such as grading tables or salary structures, we say so rather than
          presenting a guess as fact.
        </li>
        <li>
          <strong>Simple and fast.</strong> No sign-up, no clutter, and pages that work on
          any phone, tablet or computer.
        </li>
      </ul>

      <h2>Explore</h2>
      <p>
        Browse <Link href="/tools/">all tools</Link>, or read our{" "}
        <Link href="/privacy-policy/">privacy policy</Link> and{" "}
        <Link href="/disclaimer/">disclaimer</Link>. Spotted a mistake or have an idea for
        a tool? <Link href="/contact/">Get in touch</Link>.
      </p>
    </StaticPage>
  );
}
