// CSV Export Utility for Reconciliation Reports
// BCA Minor Project 2026

export const downloadCSV = (filename, rows, headers) => {
  if (!rows || !rows.length) return;

  const headerRow = headers.map(h => `"${h.label}"`).join(",");
  const dataRows = rows.map(row => {
    return headers.map(h => {
      const val = row[h.key] !== undefined && row[h.key] !== null ? row[h.key] : "";
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    }).join(",");
  });

  const csvContent = [headerRow, ...dataRows].join("\r\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportMatchedTransactionsCSV = (matchedPairs) => {
  const headers = [
    { label: "Match ID", key: "id" },
    { label: "Bank Txn ID", key: "bankTxnId" },
    { label: "Accounting Record ID", key: "accRecordId" },
    { label: "Bank Amount (INR)", key: "bankAmount" },
    { label: "Accounting Amount (INR)", key: "accountingAmount" },
    { label: "Match Score (%)", key: "matchScore" },
    { label: "Match Criteria", key: "matchCriteria" },
    { label: "Transaction Date", key: "date" },
    { label: "Bank Description", key: "bankDescription" },
    { label: "Ledger Description", key: "accDescription" },
    { label: "Status", key: "status" }
  ];

  downloadCSV(`Matched_Transactions_Report_${new Date().toISOString().split("T")[0]}.csv`, matchedPairs, headers);
};

export const exportDiscrepanciesCSV = (discrepancies) => {
  const headers = [
    { label: "Discrepancy ID", key: "id" },
    { label: "Bank Txn ID", key: "bankTxnId" },
    { label: "Accounting ID", key: "accRecordId" },
    { label: "Bank Amount (INR)", key: "bankAmount" },
    { label: "Accounting Amount (INR)", key: "accountingAmount" },
    { label: "Variance / Difference (INR)", key: "difference" },
    { label: "Discrepancy Reason", key: "reason" },
    { label: "Description & Details", key: "description" },
    { label: "Suggested Action", key: "suggestedAction" },
    { label: "Status", key: "status" },
    { label: "Date", key: "date" }
  ];

  downloadCSV(`Discrepancy_Audit_Report_${new Date().toISOString().split("T")[0]}.csv`, discrepancies, headers);
};

export const exportFullReconciliationReport = (bankTxns, accRecords, matches, discrepancies, stats) => {
  const summaryHeaders = [
    { label: "Metric", key: "metric" },
    { label: "Value", key: "value" }
  ];

  const summaryData = [
    { metric: "Report Generated On", value: new Date().toLocaleString("en-IN") },
    { metric: "Total Bank Transactions", value: stats.totalBankTransactions },
    { metric: "Total Accounting Records", value: stats.totalAccountingRecords },
    { metric: "Total Records Processed", value: stats.totalProcessed },
    { metric: "Matched Transactions", value: stats.matched },
    { metric: "Unmatched Records", value: stats.unmatched },
    { metric: "Total Discrepancies", value: stats.discrepancies },
    { metric: "Reconciliation Match Rate", value: `${stats.matchRate}%` }
  ];

  downloadCSV(`Full_Reconciliation_Summary_${new Date().toISOString().split("T")[0]}.csv`, summaryData, summaryHeaders);
};
