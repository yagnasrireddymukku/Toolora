"use client";

import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextAreaField } from "@/components/ui/Field";
import { ResetIcon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Spinner";
import { extractTextFromFile, MAX_FILE_BYTES } from "@/lib/career/extract";
import { MAX_TEXT_LENGTH } from "@/lib/career/text";
import { formatNumber } from "@/lib/format";

interface TextInputPanelProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  example?: string;
  allowUpload?: boolean;
  rows?: number;
}

/** Textarea with optional local file upload, example loader and clear button. */
export function TextInputPanel({
  label,
  value,
  onChange,
  hint,
  error,
  example,
  allowUpload,
  rows = 12,
}: TextInputPanelProps) {
  const fileId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [fileError, setFileError] = useState("");
  const [fileNote, setFileNote] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setFileError("");
    setFileNote("");
    const result = await extractTextFromFile(file);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    if (!result.ok) {
      setFileError(result.error);
      return;
    }
    onChange(result.text);
    setFileNote(
      `Read ${file.name} in your browser.${result.truncated ? ` Only the first ${formatNumber(MAX_TEXT_LENGTH)} characters are analysed.` : ""} Check the text below for mistakes.`,
    );
  }

  return (
    <div className="space-y-3">
      <TextAreaField
        label={label}
        rows={rows}
        value={value}
        error={error}
        hint={hint}
        onChange={(e) => {
          onChange(e.target.value);
          setFileNote("");
        }}
        spellCheck={false}
        className="font-mono text-sm"
      />
      <div className="flex flex-wrap items-center gap-2">
        {allowUpload && (
          <>
            <input
              ref={fileRef}
              id={fileId}
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <label
              htmlFor={fileId}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 has-[:focus-visible]:outline-3"
            >
              Upload PDF, DOCX or TXT
            </label>
          </>
        )}
        {example && (
          <Button
            variant="secondary"
            onClick={() => {
              onChange(example);
              setFileNote("");
              setFileError("");
            }}
          >
            Load example
          </Button>
        )}
        <Button
          variant="ghost"
          disabled={!value}
          onClick={() => {
            onChange("");
            setFileNote("");
            setFileError("");
          }}
        >
          <ResetIcon />
          Clear
        </Button>
        {busy && <Spinner label="Reading file" />}
      </div>
      {allowUpload && (
        <p className="text-ink-muted text-sm">
          Files are read in your browser and are never uploaded. Maximum{" "}
          {MAX_FILE_BYTES / (1024 * 1024)} MB.
        </p>
      )}
      {fileError && (
        <Alert tone="error" title="Could not read the file">
          {fileError}
        </Alert>
      )}
      {fileNote && <Alert tone="success">{fileNote}</Alert>}
    </div>
  );
}

export function PrivacyNote() {
  return (
    <Alert tone="info" title="Private by design">
      Your text is analysed in your browser. Nothing is sent to a server or an AI service.
    </Alert>
  );
}

export function KeywordList({
  items,
  empty,
}: {
  items: { label: string; note?: string }[];
  empty: string;
}) {
  if (items.length === 0) return <p className="text-ink-muted text-sm">{empty}</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((i) => (
        <li
          key={i.label}
          className="text-ink rounded-full border border-slate-300 bg-white px-3 py-1 text-sm"
        >
          {i.label}
          {i.note && <span className="text-ink-muted"> · {i.note}</span>}
        </li>
      ))}
    </ul>
  );
}

export function PlainList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-ink-muted text-sm">{empty}</p>;
  return (
    <ul className="text-ink-soft list-disc space-y-1 pl-5 text-sm">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

export function ResultBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg bg-white p-4">
      <h3 className="text-ink mb-2 font-semibold">{title}</h3>
      {children}
    </section>
  );
}
