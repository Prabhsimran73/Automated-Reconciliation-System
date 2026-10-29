// Utility formatters for Indian Currency, Dates, and Numbers

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  const num = Number(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return "0";
  return new Intl.NumberFormat("en-IN").format(num);
};

export const formatPercent = (val, decimals = 1) => {
  if (val === undefined || val === null || isNaN(val)) return "0.0%";
  return `${Number(val).toFixed(decimals)}%`;
};
