import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { docxXmlToText, extractTextFromFile, MAX_FILE_BYTES } from "./extract";

function makeDocx(paragraphs: string[]): File {
  const xml =
    `<?xml version="1.0"?><w:document xmlns:w="x"><w:body>` +
    paragraphs.map((p) => `<w:p><w:r><w:t>${p}</w:t></w:r></w:p>`).join("") +
    `</w:body></w:document>`;
  const zip = zipSync({
    "word/document.xml": strToU8(xml),
    "[Content_Types].xml": strToU8("<x/>"),
  });
  return new File([zip as BlobPart], "resume.docx");
}

describe("docxXmlToText", () => {
  it("turns paragraphs into lines and decodes entities", () => {
    expect(
      docxXmlToText(
        "<w:p><w:r><w:t>R&amp;D &lt;lead&gt;</w:t></w:r></w:p><w:p><w:r><w:t>Next</w:t></w:r></w:p>",
      ),
    ).toBe("R&D <lead>\nNext\n");
  });
});

describe("extractTextFromFile", () => {
  it("reads plain text", async () => {
    const r = await extractTextFromFile(
      new File(["Hello world, this is my resume text."], "cv.txt"),
    );
    expect(r).toMatchObject({ ok: true, text: "Hello world, this is my resume text." });
  });

  it("reads DOCX", async () => {
    const r = await extractTextFromFile(
      makeDocx(["Asha Verma", "Frontend Engineer with React experience"]),
    );
    expect(r.ok && r.text).toBe("Asha Verma\nFrontend Engineer with React experience");
  });

  it("rejects unsupported types, empty and oversized files", async () => {
    const bad = await extractTextFromFile(new File(["x"], "photo.png"));
    expect(!bad.ok && bad.error).toMatch(/Unsupported file type/);
    const empty = await extractTextFromFile(new File([], "a.txt"));
    expect(!empty.ok && empty.error).toMatch(/empty/);
    const big = await extractTextFromFile(
      new File([new Uint8Array(MAX_FILE_BYTES + 1)], "a.txt"),
    );
    expect(!big.ok && big.error).toMatch(/too large/);
  });

  it("checks the real content, not just the extension", async () => {
    const fakePdf = await extractTextFromFile(
      new File(["just text pretending to be a pdf"], "x.pdf"),
    );
    expect(!fakePdf.ok && fakePdf.error).toMatch(/valid PDF/);
    const fakeDocx = await extractTextFromFile(
      new File(["not a zip file at all"], "x.docx"),
    );
    expect(!fakeDocx.ok && fakeDocx.error).toMatch(/valid DOCX/);
    const binaryTxt = await extractTextFromFile(
      new File([new Uint8Array([72, 0, 1, 2, 3])], "x.txt"),
    );
    expect(!binaryTxt.ok && binaryTxt.error).toMatch(/plain-text/);
  });

  it("reports a damaged DOCX without throwing", async () => {
    const r = await extractTextFromFile(
      new File([new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3])], "x.docx"),
    );
    expect(!r.ok && r.error).toMatch(/could not be read/);
  });
});
