"use client";

import Link from "@/components/ui/SiteLink";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";
import { SearchPanel } from "./SearchPanel";
import { SITE_NAME } from "@/lib/site";
import type { NavCategory } from "@/lib/tools/registry";
import type { SearchEntry } from "@/lib/tools/search";

const NAV_LINKS = [
  { href: "/tools/", label: "Tools" },
  { href: "/#categories", label: "Categories" },
  { href: "/#popular", label: "Popular" },
  { href: "/about/", label: "About" },
];

const ICON_BUTTON =
  "inline-flex size-11 items-center justify-center rounded-lg text-ink-soft hover:bg-slate-100";

export function Header({
  categories,
  searchIndex,
}: {
  categories: NavCategory[];
  searchIndex: SearchEntry[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  // Close any open overlay after navigation (route change or hash link).
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMenuOpen(false);
      setSearchOpen(false);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <header className="border-line sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link
          href="/"
          className="text-ink flex min-h-11 items-center gap-2 text-xl font-bold"
        >
          <span
            aria-hidden="true"
            className="bg-brand-700 inline-flex size-8 items-center justify-center rounded-lg text-white"
          >
            T
          </span>
          {SITE_NAME}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-ink-soft inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-slate-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className={ICON_BUTTON}
            aria-label="Search tools"
            aria-haspopup="dialog"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            className={`${ICON_BUTTON} md:hidden`}
            aria-label="Open menu"
            aria-haspopup="dialog"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      <Modal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        label="Menu"
        variant="drawer"
      >
        <div className="flex h-full flex-col overflow-y-auto p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">Menu</span>
            <button
              type="button"
              className={ICON_BUTTON}
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-4">
            <ul className="space-y-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-11 items-center rounded-lg px-3 font-medium hover:bg-slate-100"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-ink-muted mt-6 px-3 text-xs font-semibold tracking-wide uppercase">
              Categories
            </p>
            <ul className="mt-1 space-y-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={c.path}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-11 items-center rounded-lg px-3 hover:bg-slate-100"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Modal>

      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} label="Search tools">
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Search tools</h2>
            <button
              type="button"
              className={ICON_BUTTON}
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>
          <SearchPanel
            index={searchIndex}
            autoFocus
            onNavigate={() => setSearchOpen(false)}
          />
        </div>
      </Modal>
    </header>
  );
}
