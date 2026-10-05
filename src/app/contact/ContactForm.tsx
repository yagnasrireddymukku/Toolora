"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { buildMailto, validateContact, type ContactErrors } from "@/lib/contact";

/**
 * The site is a static export with no mail server, so this opens the visitor's own
 * email app addressed to us with the message pre-filled. Nothing is stored or sent by the site.
 */
export function ContactForm({ email }: { email: string }) {
  const [values, setValues] = useState({ name: "", replyTo: "", message: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [opened, setOpened] = useState(false);

  function set(field: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setOpened(false);
  }

  return (
    <form
      noValidate
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const found = validateContact(values);
        setErrors(found);
        if (Object.keys(found).length > 0) return;
        window.location.href = buildMailto(email, values);
        setOpened(true);
      }}
    >
      <TextField
        label="Your name"
        autoComplete="name"
        value={values.name}
        error={errors.name}
        maxLength={80}
        onChange={(e) => set("name", e.target.value)}
      />
      <TextField
        label="Your email address"
        type="email"
        autoComplete="email"
        value={values.replyTo}
        error={errors.replyTo}
        maxLength={120}
        onChange={(e) => set("replyTo", e.target.value)}
      />
      <TextAreaField
        label="Message"
        rows={6}
        value={values.message}
        error={errors.message}
        maxLength={2000}
        onChange={(e) => set("message", e.target.value)}
      />
      {opened && (
        <Alert tone="success" title="Your email app should now be open">
          Review the message and press send there. If nothing opened, email us directly at{" "}
          <a className="underline" href={`mailto:${email}`}>
            {email}
          </a>
          .
        </Alert>
      )}
      <Button type="submit">Open in my email app</Button>
    </form>
  );
}
