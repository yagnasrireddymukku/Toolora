import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-card border-line shadow-card border bg-white p-4 sm:p-6 ${className}`}
      {...props}
    />
  );
}
