export interface ContactValues {
  name: string;
  replyTo: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (values.name.trim().length < 2) errors.name = "Please enter your name.";
  if (!EMAIL_PATTERN.test(values.replyTo.trim())) {
    errors.replyTo = "Please enter a valid email address, like name@example.com.";
  }
  if (values.message.trim().length < 10)
    errors.message = "Please write a message of at least 10 characters.";
  return errors;
}

/** Strips CR/LF so user text can never inject extra mail headers into the mailto URL. */
function singleLine(text: string): string {
  return text.replace(/[\r\n]+/g, " ").trim();
}

export function buildMailto(to: string, values: ContactValues): string {
  const subject = `Toolora message from ${singleLine(values.name)}`;
  const body = `${values.message.trim()}\n\n--\n${singleLine(values.name)} <${singleLine(values.replyTo)}>`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
