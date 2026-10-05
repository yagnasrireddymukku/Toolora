import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { SearchPanel } from "@/components/layout/SearchPanel";
import { getSearchIndex } from "@/lib/tools/registry";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-brand-700 font-semibold">404</p>
      <h1 className="mt-2 text-3xl font-bold">We couldn&rsquo;t find that page</h1>
      <p className="text-ink-soft mt-3">
        The link may be out of date. Search for a tool below or head back to the homepage.
      </p>
      <div className="mt-6 text-left">
        <SearchPanel index={getSearchIndex()} />
      </div>
      <div className="mt-6">
        <LinkButton href="/">Go to homepage</LinkButton>
      </div>
    </div>
  );
}
