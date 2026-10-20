export function invoicePayment(row) {
  const total = Math.round(Number(row.total || 0) * 100);
  const paid = Math.round(Number(row.paid || 0) * 100);
  const credited = Math.round(Number(row.credited || 0) * 100);
  const remaining = (total - paid - credited) / 100;
  const status = row.status !== "Issued" ? row.status : total === 0 ? "No payment due" : remaining <= 0
    ? credited > 0 ? "Settled with credits" : "Fully Paid"
    : paid > 0 ? "Partially Paid" : "Unpaid";
  return { total: total / 100, paid: paid / 100, credited: credited / 100, remaining, status };
}
