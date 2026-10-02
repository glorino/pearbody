import type { SignupRow } from "@/lib/db";

type Exportable = Pick<SignupRow, "email" | "name" | "source" | "created_at">;

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function buildCsv(rows: Exportable[]): string {
  const header = ["email", "name", "source", "joined_at"].map(csvCell).join(",");
  const lines = rows.map((row) =>
    [row.email, row.name ?? "", row.source ?? "", row.created_at].map(csvCell).join(","),
  );
  return [header, ...lines].join("\r\n");
}

export function downloadCsv(filename: string, rows: Exportable[]): void {
  const blob = new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
