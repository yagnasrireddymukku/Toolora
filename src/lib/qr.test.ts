import { describe, expect, it } from "vitest";
import {
  buildEmailPayload,
  buildPhonePayload,
  buildTextPayload,
  buildUrlPayload,
  buildWifiPayload,
  escapeWifi,
  MAX_QR_TEXT,
} from "./qr";

const payload = (r: { ok: boolean; payload?: string; error?: string }) =>
  r.ok ? r.payload : r.error;

describe("URL payload", () => {
  it("accepts and normalises web addresses", () => {
    expect(payload(buildUrlPayload("https://example.com/a?b=1"))).toBe(
      "https://example.com/a?b=1",
    );
    expect(payload(buildUrlPayload("  example.com/menu "))).toBe(
      "https://example.com/menu",
    );
  });
  it("rejects dangerous or invalid schemes and addresses", () => {
    for (const bad of [
      "javascript:alert(1)",
      "data:text/html,hi",
      "ftp://example.com",
      "not a url",
      "",
      "http://nodot",
    ]) {
      expect(buildUrlPayload(bad).ok, bad).toBe(false);
    }
  });
  it("enforces a length limit", () => {
    expect(buildUrlPayload(`https://example.com/${"a".repeat(MAX_QR_TEXT)}`).ok).toBe(
      false,
    );
  });
});

describe("text payload", () => {
  it("requires text and enforces the limit", () => {
    expect(buildTextPayload("  ").ok).toBe(false);
    expect(payload(buildTextPayload("Hello"))).toBe("Hello");
    expect(buildTextPayload("x".repeat(MAX_QR_TEXT + 1)).ok).toBe(false);
  });
});

describe("email payload", () => {
  it("builds mailto links with encoded subject and body", () => {
    expect(payload(buildEmailPayload("a@b.co"))).toBe("mailto:a@b.co");
    expect(payload(buildEmailPayload("a@b.co", "Hi there", "Line & more"))).toBe(
      "mailto:a@b.co?subject=Hi%20there&body=Line%20%26%20more",
    );
  });
  it("validates the address", () => {
    expect(buildEmailPayload("nope").ok).toBe(false);
    expect(buildEmailPayload("").ok).toBe(false);
  });
});

describe("phone payload", () => {
  it("normalises separators", () => {
    expect(payload(buildPhonePayload("+91 98765-43210"))).toBe("tel:+919876543210");
    expect(payload(buildPhonePayload("(022) 1234 5678"))).toBe("tel:02212345678");
  });
  it("rejects invalid numbers", () => {
    for (const bad of ["", "abc", "123", "1".repeat(16), "+"])
      expect(buildPhonePayload(bad).ok, bad).toBe(false);
  });
});

describe("Wi-Fi payload", () => {
  it("builds the standard WIFI: string", () => {
    expect(payload(buildWifiPayload("Home", "secret123", "WPA", false))).toBe(
      "WIFI:T:WPA;S:Home;P:secret123;;",
    );
    expect(payload(buildWifiPayload("Cafe", "", "nopass", false))).toBe(
      "WIFI:T:nopass;S:Cafe;;",
    );
    expect(payload(buildWifiPayload("Hidden", "password1", "WPA", true))).toBe(
      "WIFI:T:WPA;S:Hidden;P:password1;H:true;;",
    );
  });
  it("escapes special characters", () => {
    expect(escapeWifi('a;b,c:d"e\\f')).toBe('a\\;b\\,c\\:d\\"e\\\\f');
    expect(payload(buildWifiPayload("My;Net", "pa:ss;word", "WPA", false))).toBe(
      "WIFI:T:WPA;S:My\\;Net;P:pa\\:ss\\;word;;",
    );
  });
  it("validates fields", () => {
    expect(buildWifiPayload("", "x", "WPA", false).ok).toBe(false);
    expect(buildWifiPayload("Net", "", "WPA", false).ok).toBe(false);
    expect(buildWifiPayload("Net", "short", "WPA", false).ok).toBe(false);
    expect(buildWifiPayload("x".repeat(33), "password1", "WPA", false).ok).toBe(false);
    expect(buildWifiPayload("Net", "abc", "WEP", false).ok).toBe(true);
  });
});
