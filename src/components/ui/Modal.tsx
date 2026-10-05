"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  label: string;
  /** "drawer" slides in from the right edge; "center" is a top-aligned panel. */
  variant?: "drawer" | "center";
  children: ReactNode;
}

/**
 * Accessible modal built on the native <dialog> element: focus is trapped,
 * Escape closes it, and focus returns to the opener. Page scroll is locked while open.
 */
export function Modal({
  open,
  onClose,
  label,
  variant = "center",
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // React's autoFocus runs before the dialog is open, so move focus explicitly.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
    document.body.classList.toggle("scroll-locked", open);
    return () => document.body.classList.remove("scroll-locked");
  }, [open]);

  const position =
    variant === "drawer"
      ? "ml-auto mr-0 h-full max-h-full w-[min(20rem,90vw)] rounded-none"
      : "mx-auto mt-[10vh] w-[min(40rem,94vw)] max-h-[80vh] rounded-card";

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`${position} text-ink bg-white p-0 shadow-xl`}
    >
      {open && children}
    </dialog>
  );
}
