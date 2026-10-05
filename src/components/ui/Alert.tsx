import type { ReactNode } from "react";

type Tone = "info" | "success" | "warning" | "error";

const TONES: Record<Tone, { box: string; label: string; icon: string }> = {
  info: { box: "border-brand-200 bg-brand-50 text-brand-900", label: "Note", icon: "ℹ" },
  success: { box: "border-green-300 bg-ok-50 text-ok-700", label: "Success", icon: "✓" },
  warning: {
    box: "border-amber-300 bg-warn-50 text-warn-700",
    label: "Warning",
    icon: "!",
  },
  error: {
    box: "border-red-300 bg-danger-50 text-danger-700",
    label: "Error",
    icon: "⚠",
  },
};

interface AlertProps {
  tone?: Tone;
  title?: string;
  children: ReactNode;
}

/** Errors use role="alert", others role="status". The label text means colour is never the only cue. */
export function Alert({ tone = "info", title, children }: AlertProps) {
  const t = TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border p-3 text-sm ${t.box}`}
    >
      <p className="font-semibold">
        <span aria-hidden="true">{t.icon} </span>
        {title ?? t.label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
