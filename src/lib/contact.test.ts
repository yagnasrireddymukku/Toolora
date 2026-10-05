import { describe, expect, it } from "vitest";
import { buildMailto, validateContact } from "./contact";

describe("contact form", () => {
  it("validates every field", () => {
    const errors = validateContact({ name: "", replyTo: "nope", message: "short" });
    expect(Object.keys(errors).sort()).toEqual(["message", "name", "replyTo"]);
    expect(
      validateContact({
        name: "Asha",
        replyTo: "a@b.co",
        message: "Hello there, a question.",
      }),
    ).toEqual({});
  });

  it("builds a mailto link and prevents header injection", () => {
    const url = buildMailto("hi@example.com", {
      name: "Asha\r\nBcc: evil@example.com",
      replyTo: "a@b.co",
      message: "Hello there, a question.",
    });
    expect(url.startsWith("mailto:hi@example.com?subject=")).toBe(true);
    const subject = decodeURIComponent(url.match(/subject=([^&]*)/)![1]);
    expect(subject).not.toMatch(/[\r\n]/);
  });
});
