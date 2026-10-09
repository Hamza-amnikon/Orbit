export function parseStatementCsv(text) {
  const rows = []; let row = []; let cell = ""; let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"') { if (quoted && text[index + 1] === '"') { cell += '"'; index++; } else quoted = !quoted; }
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index++;
      row.push(cell); if (row.some(value => value.trim())) rows.push(row); row = []; cell = "";
    } else cell += char;
  }
  if (quoted) throw new Error("CSV contains an unclosed quote.");
  row.push(cell); if (row.some(value => value.trim())) rows.push(row);
  const headers = rows.shift()?.map(value => value.replace(/^\uFEFF/, "").trim().toLowerCase()) || [];
  const required = ["date", "reference", "direction", "amount"];
  if (required.some(header => !headers.includes(header))) throw new Error("CSV columns must include Date, Reference, Direction, Amount.");
  if (rows.length > 2000) throw new Error("Import at most 2,000 statement lines.");
  return rows.map((values, index) => {
    const get = key => (values[headers.indexOf(key)] || "").trim(); const date = get("date"); const amount = Number(get("amount"));
    const direction = { moneyin: "MoneyIn", moneyout: "MoneyOut" }[get("direction").toLowerCase().replaceAll(" ", "")];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date || !get("reference") || !direction || !Number.isFinite(amount) || amount <= 0 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001) throw new Error(`Invalid statement line ${index + 2}. Use YYYY-MM-DD dates, MoneyIn/MoneyOut, and positive amounts with two decimals.`);
    return { date, reference: get("reference"), direction, amount };
  });
}
