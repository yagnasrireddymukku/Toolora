import Link from "@/components/ui/SiteLink";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { categoryPath, getActiveCategories } from "@/lib/tools/registry";

const COMPANY_LINKS = [
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
  { href: "/privacy-policy/", label: "Privacy Policy" },
  { href: "/terms-of-service/", label: "Terms of Service" },
  { href: "/disclaimer/", label: "Disclaimer" },
];

const LINK =
  "inline-flex min-h-11 items-center text-sm text-ink-soft hover:text-brand-700 hover:underline";

export function Footer() {
  return (
    <footer className="border-line bg-surface mt-16 border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="text-lg font-bold">{SITE_NAME}</p>
          <p className="text-ink-muted mt-1 text-sm">{SITE_TAGLINE}</p>
          <p className="text-ink-muted mt-3 max-w-md text-sm">
            Free tools that run in your browser. Your inputs stay on your device unless a
            tool says otherwise.
          </p>
        </div>
        <nav aria-label="Tool categories">
          <p className="font-semibold">Categories</p>
          <ul className="mt-2">
            {getActiveCategories().map((c) => (
              <li key={c.id}>
                <Link href={categoryPath(c.id)} className={LINK}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Company and legal">
          <p className="font-semibold">Company</p>
          <ul className="mt-2">
            {COMPANY_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={LINK}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-line text-ink-muted border-t py-4 text-center text-sm">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
