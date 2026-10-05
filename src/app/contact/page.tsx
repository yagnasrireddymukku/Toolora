import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { Alert } from "@/components/ui/Alert";
import { buildMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/site";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = buildMetadata({
  title: "Contact Toolora",
  description:
    "Contact the Toolora team to report a problem, suggest a new tool or ask a question about how a calculator works.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact"
      path="/contact/"
      intro="Found a mistake, have a question, or want a tool we don't have yet? We'd like to hear from you."
    >
      <p>
        When reporting a problem, please tell us which tool you were using and what you
        entered. Please do not include passwords or other sensitive personal information
        in your message.
      </p>
      {CONTACT_EMAIL ? (
        <ContactForm email={CONTACT_EMAIL} />
      ) : (
        <div className="mt-6">
          <Alert tone="warning" title="Contact address not configured">
            The site owner has not set a contact email yet (NEXT_PUBLIC_CONTACT_EMAIL).
          </Alert>
        </div>
      )}
    </StaticPage>
  );
}
