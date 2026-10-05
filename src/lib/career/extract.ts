import { unzipSync } from "fflate";
import { MAX_TEXT_LENGTH, normalizeText } from "./text";

/** Upload limits. Files are read in the browser and never sent anywhere. */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_DOCX_XML_BYTES = 20 * 1024 * 1024;
const MAX_PDF_PAGES = 12;

export type ExtractResult =
  { ok: true; text: string; truncated: boolean } | { ok: false; error: string };

const fail = (error: string): ExtractResult => ({ ok: false, error });

type FileKind = "pdf" | "docx" | "txt";

function detectKind(name: string): FileKind | null {
  const ext = name.toLowerCase().split(".").pop();
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  if (ext === "txt" || ext === "md") return "txt";
  return null;
}

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((b, i) => bytes[i] === b);
}

const XML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

/** Converts WordprocessingML (document.xml) into plain text with paragraph breaks. */
export function docxXmlToText(xml: string): string {
  return xml
    .replace(/<w:tab\s*\/>/g, " ")
    .replace(/<w:(?:br|cr)\s*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) => {
      if (e.startsWith("#x")) return String.fromCodePoint(parseInt(e.slice(2), 16));
      if (e.startsWith("#")) return String.fromCodePoint(parseInt(e.slice(1), 10));
      return XML_ENTITIES[e.toLowerCase()] ?? "";
    });
}

async function extractDocx(bytes: Uint8Array): Promise<string> {
  // Only inflate the one part we need, and refuse oversized parts (zip-bomb guard).
  const files = unzipSync(bytes, {
    filter: (f) => f.name === "word/document.xml" && f.originalSize <= MAX_DOCX_XML_BYTES,
  });
  const part = files["word/document.xml"];
  if (!part) throw new Error("missing document body");
  return docxXmlToText(new TextDecoder("utf-8").decode(part));
}

async function extractPdf(bytes: Uint8Array): Promise<string> {
  // Loaded on demand so the PDF engine is only downloaded when someone uploads a PDF.
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const task = pdfjs.getDocument({ data: bytes });
  const doc = await task.promise;
  try {
    const pages = Math.min(doc.numPages, MAX_PDF_PAGES);
    const out: string[] = [];
    for (let p = 1; p <= pages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      let line = "";
      let lastY: number | null = null;
      for (const item of content.items) {
        if (!("str" in item)) continue;
        const y = item.transform[5] as number;
        if (lastY !== null && Math.abs(y - lastY) > 2) {
          out.push(line);
          line = "";
        }
        line +=
          (line && !line.endsWith(" ") && !item.str.startsWith(" ") ? " " : "") +
          item.str;
        lastY = y;
      }
      if (line) out.push(line);
      out.push("");
    }
    return out.join("\n");
  } finally {
    await task.destroy();
  }
}

export async function extractTextFromFile(file: File): Promise<ExtractResult> {
  if (file.size === 0) return fail("That file is empty.");
  if (file.size > MAX_FILE_BYTES) {
    return fail(
      `That file is too large. The limit is ${MAX_FILE_BYTES / (1024 * 1024)} MB.`,
    );
  }
  const kind = detectKind(file.name);
  if (!kind) {
    return fail(
      "Unsupported file type. Upload a PDF, DOCX or TXT file, or paste your text instead.",
    );
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    return fail(
      "The file could not be read. Please try again or paste your text instead.",
    );
  }

  // Check the real content, not just the file name or the browser-reported MIME type.
  if (kind === "pdf" && !startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
    return fail("This file does not look like a valid PDF.");
  }
  if (kind === "docx" && !startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])) {
    return fail(
      "This file does not look like a valid DOCX document. Older .doc files are not supported.",
    );
  }
  if (kind === "txt" && bytes.subarray(0, 1024).includes(0)) {
    return fail("This does not look like a plain-text file.");
  }

  try {
    const raw =
      kind === "txt"
        ? new TextDecoder("utf-8").decode(bytes)
        : kind === "docx"
          ? await extractDocx(bytes)
          : await extractPdf(bytes);
    const truncated = raw.length > MAX_TEXT_LENGTH;
    const text = normalizeText(raw);
    if (text.length < 20) {
      return fail(
        kind === "pdf"
          ? "No readable text was found. Scanned or image-only PDFs cannot be read, and many applicant tracking systems cannot read them either. Paste your text instead."
          : "No readable text was found in this file.",
      );
    }
    return { ok: true, text, truncated };
  } catch {
    return fail(
      "This file could not be read. It may be damaged or password-protected. Try another file or paste your text.",
    );
  }
}
