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

/**
 * Uses the Web Share API where available (including files when the browser can share
 * them), otherwise copies the text to the clipboard.
 */
export async function shareContent(data: {
  title: string;
  text: string;
  url?: string;
  files?: File[];
}): Promise<ShareOutcome> {
  if (typeof navigator.share === "function") {
    const withFiles = data.files?.length && navigator.canShare?.({ files: data.files });
    const payload = withFiles
      ? { title: data.title, text: data.text, files: data.files }
      : { title: data.title, text: data.text, url: data.url };
    try {
      await navigator.share(payload);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError")
        return "cancelled";
      // otherwise fall back to copy
    }
  }
  const text = [data.text, data.url].filter(Boolean).join("\n");
  return (await copyText(text)) ? "copied" : "failed";
}

/** Decodes a base64 data URL (e.g. a canvas/QR PNG) into a Blob without using fetch. */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = /data:([^;]+);base64/.exec(header)?.[1] ?? "application/octet-stream";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
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
