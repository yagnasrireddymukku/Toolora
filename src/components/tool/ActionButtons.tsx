"use client";

import { useEffect, useRef, useState } from "react";
import { copyText, downloadText, shareContent } from "@/lib/browser";
import { Button } from "@/components/ui/Button";
import { CheckIcon, CopyIcon, DownloadIcon, ShareIcon } from "@/components/ui/icons";

/** Shows a short message for screen readers and sighted users, then clears it. */
function useFlash(ms = 2500) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function flash(next: string) {
    setMessage(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), ms);
  }
  return { message, flash };
}

function LiveMessage({ message }: { message: string }) {
  return (
    <span role="status" aria-live="polite" className="text-ok-700 text-sm font-medium">
      {message}
    </span>
  );
}

interface CopyButtonProps {
  text: string;
  label?: string;
  disabled?: boolean;
}

export function CopyButton({ text, label = "Copy", disabled }: CopyButtonProps) {
  const { message, flash } = useFlash();
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        disabled={disabled || !text}
        onClick={async () => {
          flash(
            (await copyText(text))
              ? "Copied to clipboard"
              : "Copy is not supported here. Select the text and copy manually.",
          );
        }}
      >
        {message === "Copied to clipboard" ? <CheckIcon /> : <CopyIcon />}
        {label}
      </Button>
      <LiveMessage message={message} />
    </span>
  );
}

interface ShareButtonProps {
  title: string;
  text: string;
  /** Defaults to the current page URL. */
  url?: string;
  disabled?: boolean;
}

export function ShareButton({ title, text, url, disabled }: ShareButtonProps) {
  const { message, flash } = useFlash();
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        disabled={disabled || !text}
        onClick={async () => {
          const outcome = await shareContent({
            title,
            text,
            url: url ?? window.location.href,
          });
          if (outcome === "copied")
            flash("Sharing is not available, so the result was copied instead");
          else if (outcome === "failed")
            flash("Could not share or copy. Please copy the result manually.");
        }}
      >
        <ShareIcon />
        Share
      </Button>
      <LiveMessage message={message} />
    </span>
  );
}

interface DownloadButtonProps {
  filename: string;
  content: string;
  mime?: string;
  label?: string;
  disabled?: boolean;
}

export function DownloadTextButton({
  filename,
  content,
  mime,
  label = "Download",
  disabled,
}: DownloadButtonProps) {
  return (
    <Button
      variant="secondary"
      disabled={disabled || !content}
      onClick={() => downloadText(filename, content, mime)}
    >
      <DownloadIcon />
      {label}
    </Button>
  );
}
