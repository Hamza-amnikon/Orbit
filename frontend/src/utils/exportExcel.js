import { loadXlsx } from "./exportLibraries";

export async function exportRowsToExcel(rows, columns, fileName, sheetName = "Data") {
  const XLSX = await loadXlsx();
  const worksheet = XLSX.utils.json_to_sheet(
    rows.map((row) => Object.fromEntries(columns.map(([label, key]) => [label, typeof key === "function" ? key(row) : row[key] ?? ""])))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
}
