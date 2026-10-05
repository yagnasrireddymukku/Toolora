import Link from "@/components/ui/SiteLink";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-700 text-white hover:bg-brand-800",
  secondary: "border border-slate-300 bg-white text-ink hover:bg-slate-50",
  ghost: "text-ink-soft hover:bg-slate-100",
  danger: "border border-danger-700 bg-white text-danger-700 hover:bg-danger-50",
};

export function buttonClass(variant: Variant = "primary", extra = ""): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  variant?: Variant;
  children: ReactNode;
}

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  ...props
}: LinkButtonProps) {
  return <Link href={href} className={buttonClass(variant, className)} {...props} />;
}
