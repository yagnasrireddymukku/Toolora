import { describe, expect, it } from "vitest";
import { TOOL_COMPONENTS } from "@/tools/components";
import { buildMetadata, serializeJsonLd } from "./seo";
import { getActiveCategories, getTool, TOOLS, toolPath } from "./tools/registry";
import { searchTools } from "./tools/search";

describe("tool registry integrity", () => {
  it("has unique slugs and a component for every tool", () => {
    const slugs = TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const t of TOOLS)
      expect(TOOL_COMPONENTS[`${t.category}/${t.slug}`]).toBeDefined();
  });

  it("only references related tools that exist", () => {
    for (const t of TOOLS) {
      for (const r of t.related)
        expect(
          TOOLS.some((x) => x.slug === r),
          `${t.slug} -> ${r}`,
        ).toBe(true);
    }
  });

  it("gives every tool unique, well-sized metadata and content", () => {
    const descriptions = new Set<string>();
    for (const t of TOOLS) {
      expect(descriptions.has(t.description)).toBe(false);
      descriptions.add(t.description);
      expect(t.description.length).toBeGreaterThan(50);
      expect(t.description.length).toBeLessThanOrEqual(170);
      expect(t.faqs.length).toBeGreaterThanOrEqual(2);
      expect(t.howItWorks.length).toBeGreaterThan(0);
      expect(t.example.body.length).toBeGreaterThan(0);
      expect(t.tips.length).toBeGreaterThan(0);
    }
  });

  it("builds clean SEO URLs and lookups", () => {
    for (const t of TOOLS) {
      expect(toolPath(t)).toMatch(/^\/tools\/[a-z]+\/[a-z0-9-]+\/$/);
      expect(getTool(t.category, t.slug)).toBe(t);
    }
    expect(getActiveCategories().length).toBeGreaterThan(0);
  });
});

describe("searchTools", () => {
  it("matches by name, keyword and category, case-insensitively", () => {
    expect(searchTools(TOOLS, "CGPA")[0].slug).toBe("cgpa-calculator");
    expect(searchTools(TOOLS, "bunk").map((t) => t.slug)).toContain(
      "attendance-calculator",
    );
    expect(searchTools(TOOLS, "education").length).toBeGreaterThan(1);
  });
  it("requires every term to match", () => {
    expect(searchTools(TOOLS, "cgpa zzzz")).toHaveLength(0);
  });
  it("returns nothing for blank queries", () => {
    expect(searchTools(TOOLS, "   ")).toHaveLength(0);
  });
});

describe("SEO helpers", () => {
  it("emits canonical, Open Graph and Twitter metadata", () => {
    const m = buildMetadata({ title: "T", description: "D", path: "/tools/x/y/" });
    expect(m.alternates?.canonical).toMatch(/\/tools\/x\/y\/$/);
    expect(m.openGraph?.title).toBe("T");
    expect(m.twitter?.title).toBe("T");
  });
  it("escapes < in JSON-LD", () => {
    expect(serializeJsonLd({ a: "</script><script>alert(1)</script>" })).not.toContain(
      "</script>",
    );
  });
});
