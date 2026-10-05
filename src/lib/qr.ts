/** Payload builders and validation for the QR code generator. Pure functions. */

export type QrPayloadResult =
  { ok: true; payload: string } | { ok: false; error: string };

const ok = (payload: string): QrPayloadResult => ({ ok: true, payload });
const fail = (error: string): QrPayloadResult => ({ ok: false, error });

/** Practical limit well under the QR maximum (~2,900 bytes at level L). */
export const MAX_QR_TEXT = 1000;

export function buildUrlPayload(input: string): QrPayloadResult {
  const raw = input.trim();
  if (!raw) return fail("Enter a web address, for example https://example.com.");
  // Assume https when no scheme is typed ("example.com/menu").
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return fail("That does not look like a valid web address.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return fail(
      "Only http and https addresses are supported here. Use the Text option for other content.",
    );
  }
  if (!url.hostname.includes(".") && url.hostname !== "localhost") {
    return fail("That web address needs a domain, such as example.com.");
  }
  if (withScheme.length > MAX_QR_TEXT)
    return fail(`That address is too long. The limit is ${MAX_QR_TEXT} characters.`);
  return ok(url.href);
}

export function buildTextPayload(input: string): QrPayloadResult {
  if (!input.trim()) return fail("Enter some text to encode.");
  if (input.length > MAX_QR_TEXT)
    return fail(`That text is too long. The limit is ${MAX_QR_TEXT} characters.`);
  return ok(input);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function buildEmailPayload(
  address: string,
  subject = "",
  body = "",
): QrPayloadResult {
  const to = address.trim();
  if (!to) return fail("Enter an email address.");
  if (!EMAIL.test(to))
    return fail("Please enter a valid email address, like name@example.com.");
  const params: string[] = [];
  if (subject.trim()) params.push(`subject=${encodeURIComponent(subject.trim())}`);
  if (body.trim()) params.push(`body=${encodeURIComponent(body.trim())}`);
  const payload = `mailto:${to}${params.length ? `?${params.join("&")}` : ""}`;
  if (payload.length > MAX_QR_TEXT)
    return fail(
      `That message is too long. The limit is ${MAX_QR_TEXT} characters in total.`,
    );
  return ok(payload);
}

export function buildPhonePayload(input: string): QrPayloadResult {
  const cleaned = input.trim().replace(/[\s().-]/g, "");
  if (!cleaned) return fail("Enter a phone number.");
  if (!/^\+?\d{5,15}$/.test(cleaned)) {
    return fail(
      "Enter a phone number with 5 to 15 digits. Start with + for an international number.",
    );
  }
  return ok(`tel:${cleaned}`);
}

export type WifiSecurity = "WPA" | "WEP" | "nopass";

/** Escapes the characters that are special in the WIFI: format. */
export function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function buildWifiPayload(
  ssid: string,
  password: string,
  security: WifiSecurity,
  hidden: boolean,
): QrPayloadResult {
  if (!ssid.trim()) return fail("Enter the network name (SSID).");
  if (ssid.length > 32) return fail("A Wi-Fi network name can be at most 32 characters.");
  if (security !== "nopass") {
    if (!password) return fail("Enter the Wi-Fi password, or choose 'No password'.");
    if (security === "WPA" && (password.length < 8 || password.length > 63)) {
      return fail("A WPA password must be 8 to 63 characters long.");
    }
  }
  const parts = [`T:${security}`, `S:${escapeWifi(ssid)}`];
  if (security !== "nopass") parts.push(`P:${escapeWifi(password)}`);
  if (hidden) parts.push("H:true");
  return ok(`WIFI:${parts.join(";")};;`);
}

export type QrErrorCorrection = "L" | "M" | "Q" | "H";

export const QR_SIZES = [256, 384, 512, 768, 1024] as const;
