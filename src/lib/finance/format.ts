export function formatCurrency(amount: number, currency = "ZMW") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export const SOURCE_LABELS: Record<string, string> = {
  LIPILA_MOMO: "Lipila · Mobile Money",
  LIPILA_CARD: "Lipila · Card",
  CASH: "Cash",
  IN_PERSON: "In person",
  BANK_TRANSFER: "Bank transfer",
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  SUCCESSFUL: "Successful",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};
