/** Browser-only helpers for copy / share / download. All handle unsupported environments. */

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path (permissions denied, insecure context, etc.)
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

/** Uses the Web Share API where available, otherwise copies the text to the clipboard. */
export async function shareContent(data: {
  title: string;
  text: string;
  url?: string;
}): Promise<ShareOutcome> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share(data);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError")
        return "cancelled";
      // otherwise fall back to copy
    }
  }
  const payload = [data.text, data.url].filter(Boolean).join("\n");
  return (await copyText(payload)) ? "copied" : "failed";
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(
  filename: string,
  content: string,
  mime = "text/plain",
): void {
  downloadBlob(filename, new Blob([content], { type: `${mime};charset=utf-8` }));
}
