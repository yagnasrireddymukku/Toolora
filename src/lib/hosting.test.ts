import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const htaccess = readFileSync(join(root, "public/.htaccess"), "utf8");
const serveJson = JSON.parse(readFileSync(join(root, "e2e/serve.json"), "utf8")) as {
  headers: { headers: { key: string; value: string }[] }[];
};

function header(name: string): string | undefined {
  return serveJson.headers[0].headers.find((h) => h.key === name)?.value;
}

describe("hosting configuration", () => {
  it("e2e server sends the same CSP as production .htaccess (so tests prove the app works under it)", () => {
    const fromHtaccess = /Content-Security-Policy "([^"]+)"/.exec(htaccess)?.[1];
    expect(fromHtaccess).toBeDefined();
    expect(header("Content-Security-Policy")).toBe(fromHtaccess);
  });

  it("sets the core security headers", () => {
    for (const h of [
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Strict-Transport-Security",
    ]) {
      expect(htaccess).toContain(h);
    }
  });

  it("locks down dangerous CSP directives", () => {
    const csp = header("Content-Security-Policy")!;
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).not.toMatch(/script-src[^;]*\*(?!\.)/); // no bare wildcard script sources
    expect(csp).not.toMatch(/(?<!wasm-)unsafe-eval/); // wasm-unsafe-eval (PDF decoder) is allowed; plain unsafe-eval is not
  });

  it("serves .mjs as JavaScript (required by the PDF worker) and has a 404 page and no listings", () => {
    expect(htaccess).toMatch(/AddType text\/javascript \.js \.mjs/);
    expect(htaccess).toContain("ErrorDocument 404 /404.html");
    expect(htaccess).toContain("Options -Indexes");
  });
});
