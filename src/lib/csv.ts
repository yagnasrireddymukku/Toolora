/** Minimal CSV writer with RFC 4180 quoting and spreadsheet-formula injection protection. */

function cell(value: string | number): string {
  let text = String(value);
  // Prevent Excel/Sheets from executing cells that start with a formula character.
  if (/^[=+\-@\t\r]/.test(text) && typeof value === "string") text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: (string | number)[][]): string {
  return rows.map((r) => r.map(cell).join(",")).join("\r\n");
}
