export type CategoryId =
  "education" | "career" | "salary" | "developer" | "pdf" | "image" | "utility";

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface ToolContent {
  /** Short steps explaining how to use the tool. */
  howItWorks: string[];
  formula?: { title: string; body: string[] };
  example: { title: string; body: string[] };
  tips: string[];
  limitations?: string[];
  faqs: Faq[];
}

export interface ToolDefinition extends ToolContent {
  slug: string;
  category: CategoryId;
  name: string;
  /** H1 and meta title base. */
  h1: string;
  /** One-sentence summary used on cards, search and meta description. */
  description: string;
  /** Longer intro shown under the H1. */
  intro: string;
  /** Extra search terms (not shown). */
  keywords: string[];
  popular?: boolean;
  /** ISO date the tool shipped; drives "recently added". */
  addedAt: string;
  related: string[];
}
