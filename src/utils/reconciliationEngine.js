// Multi-Criteria Automated Reconciliation Engine
// BCA Minor Project 2026

export const runReconciliationEngine = (bankTransactions = [], accountingRecords = [], settings = {}) => {
  const threshold = settings.matchingThreshold ?? 80;
  const toleranceDays = settings.dateToleranceDays ?? 2;
  const enableAmount = settings.amountMatching ?? true;
  const enableRef = settings.referenceMatching ?? true;
  const enableDate = settings.dateMatching ?? true;
  const enableDesc = settings.descriptionMatching ?? true;

  const matchedPairs = [];
  const discrepancies = [];
  const matchedBankIds = new Set();
  const matchedAccIds = new Set();

  // Helper: Date difference in days
  const getDaysDiff = (d1, d2) => {
    const time1 = new Date(d1).getTime();
    const time2 = new Date(d2).getTime();
    if (isNaN(time1) || isNaN(time2)) return 999;
    return Math.abs(Math.round((time1 - time2) / (1000 * 60 * 60 * 24)));
  };

  // Helper: Text token similarity
  const calculateDescSimilarity = (desc1 = "", desc2 = "") => {
    const clean = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    const words1 = clean(desc1);
    const words2 = clean(desc2);
    if (!words1.length || !words2.length) return 0;
    const intersection = words1.filter(w => words2.includes(w) && w.length > 2);
    return (intersection.length * 2) / (words1.length + words2.length);
  };

  // Helper: Normalize Reference
  const normalizeRef = (ref = "") => {
    return ref.toUpperCase().replace(/[^A-Z0-9]/g, "");
  };

  // 1. First Pass: Look for Explicit Discrepancies and High-Confidence Matches
  for (const bankTxn of bankTransactions) {
    // If explicitly flagged as a discrepancy
    if (bankTxn.discrepancyReason || bankTxn.status === "Discrepancy") {
      let matchedAcc = accountingRecords.find(a =>
        !matchedAccIds.has(a.id) &&
        (a.matchedTxnId === bankTxn.id || (normalizeRef(a.reference) === normalizeRef(bankTxn.reference) && normalizeRef(bankTxn.reference).length > 3))
      );
      const accAmount = matchedAcc ? (matchedAcc.credit || matchedAcc.debit) : 0;
      const diff = matchedAcc ? Math.abs(bankTxn.amount - accAmount) : bankTxn.amount;

      discrepancies.push({
        id: `DISC-${bankTxn.id}`,
        bankTxnId: bankTxn.id,
        accRecordId: matchedAcc ? matchedAcc.id : "N/A",
        bankAmount: bankTxn.amount,
        accountingAmount: accAmount,
        difference: diff,
        date: bankTxn.date,
        reason: bankTxn.discrepancyReason || "Transaction Variance",
        description: bankTxn.notes || `Discrepancy detected for ${bankTxn.description}. Difference of ₹${diff.toLocaleString('en-IN')}.`,
        suggestedAction: bankTxn.discrepancyReason === "Date Mismatch"
          ? "Confirm clearance date in ERP & verify cheque clearing lag"
          : bankTxn.discrepancyReason === "Amount Mismatch"
          ? "Post adjusting journal entry or verify vendor invoice"
          : bankTxn.discrepancyReason === "Reference Mismatch"
          ? "Update voucher reference in general ledger to match bank reference"
          : "Record debit/credit entry in accounting software",
        status: "Pending",
        notes: bankTxn.notes || ""
      });
      matchedBankIds.add(bankTxn.id);
      if (matchedAcc) matchedAccIds.add(matchedAcc.id);
      continue;
    }

    let bestMatch = null;
    let highestScore = 0;
    let matchReason = "";

    // Candidate search in accounting records
    for (const accRec of accountingRecords) {
      if (matchedAccIds.has(accRec.id)) continue;

      const accAmount = accRec.credit > 0 ? accRec.credit : accRec.debit;
      const amountMatches = Math.abs(bankTxn.amount - accAmount) < 0.01;
      const refMatches = normalizeRef(bankTxn.reference) === normalizeRef(accRec.reference) && normalizeRef(bankTxn.reference).length > 3;
      const daysDiff = getDaysDiff(bankTxn.date, accRec.date);
      const dateMatches = daysDiff <= toleranceDays;
      const descSim = calculateDescSimilarity(bankTxn.description, accRec.description);

      let score = 0;
      let criteria = [];

      // Scoring Breakdown
      if (amountMatches && refMatches && dateMatches) {
        score = 100;
        criteria = ["Exact Amount", "Reference Number", "Date Proximity"];
      } else if (amountMatches && refMatches) {
        score = 92;
        criteria = ["Exact Amount", "Reference Number"];
      } else if (amountMatches && dateMatches && descSim > 0.3) {
        score = 85;
        criteria = ["Exact Amount", "Date Proximity", "Description Keywords"];
      } else if (amountMatches && (dateMatches || descSim > 0.4)) {
        score = 78;
        criteria = ["Exact Amount", descSim > 0.4 ? "Description Match" : "Date Proximity"];
      } else if (refMatches && !amountMatches) {
        // Discrepancy: Amount Mismatch for same reference!
        score = 60;
        criteria = ["Reference Match Only (Amount Discrepancy)"];
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = {
          accRec,
          score,
          criteria,
          amountMatches,
          refMatches,
          daysDiff,
          accAmount
        };
      }
    }

    // Process best match
    if (bestMatch && bestMatch.score >= threshold) {
      // It's a valid Match
      matchedPairs.push({
        id: `MTC-${bankTxn.id}-${bestMatch.accRec.id}`,
        bankTxnId: bankTxn.id,
        accRecordId: bestMatch.accRec.id,
        bankAmount: bankTxn.amount,
        accountingAmount: bestMatch.accAmount,
        bankDescription: bankTxn.description,
        accDescription: bestMatch.accRec.description,
        bankReference: bankTxn.reference,
        accReference: bestMatch.accRec.reference,
        bankDate: bankTxn.date,
        accDate: bestMatch.accRec.date,
        matchScore: bestMatch.score,
        matchCriteria: bestMatch.criteria.join(", "),
        date: bankTxn.date,
        status: "Matched"
      });
      matchedBankIds.add(bankTxn.id);
      matchedAccIds.add(bestMatch.accRec.id);
    } else if (bestMatch && !bestMatch.amountMatches && bestMatch.refMatches) {
      // Amount Discrepancy
      const diff = Math.abs(bankTxn.amount - bestMatch.accAmount);
      discrepancies.push({
        id: `DISC-${bankTxn.id}`,
        bankTxnId: bankTxn.id,
        accRecordId: bestMatch.accRec.id,
        bankAmount: bankTxn.amount,
        accountingAmount: bestMatch.accAmount,
        difference: diff,
        date: bankTxn.date,
        reason: "Amount Mismatch",
        description: `Bank charged ${bankTxn.amount} but ledger booked ${bestMatch.accAmount}. Difference of ₹${diff}.`,
        suggestedAction: "Post adjusting journal entry or verify vendor invoice",
        status: "Pending",
        notes: bankTxn.notes || "Amount variance detected between bank debit and ledger voucher."
      });
      matchedBankIds.add(bankTxn.id);
      matchedAccIds.add(bestMatch.accRec.id);
    } else if (bankTxn.discrepancyReason) {
      // Known preset discrepancy from bank transaction meta
      let matchedAcc = accountingRecords.find(a => a.matchedTxnId === bankTxn.id || normalizeRef(a.reference) === normalizeRef(bankTxn.reference));
      const accAmount = matchedAcc ? (matchedAcc.credit || matchedAcc.debit) : 0;
      discrepancies.push({
        id: `DISC-${bankTxn.id}`,
        bankTxnId: bankTxn.id,
        accRecordId: matchedAcc ? matchedAcc.id : "N/A",
        bankAmount: bankTxn.amount,
        accountingAmount: accAmount,
        difference: matchedAcc ? Math.abs(bankTxn.amount - accAmount) : bankTxn.amount,
        date: bankTxn.date,
        reason: bankTxn.discrepancyReason || "Missing Accounting Record",
        description: bankTxn.notes || "Transaction requires manual ledger reconciliation.",
        suggestedAction: bankTxn.discrepancyReason === "Date Mismatch" ? "Confirm clearance date in ERP" : "Record debit/credit note in accounting software",
        status: "Pending",
        notes: bankTxn.notes || ""
      });
      matchedBankIds.add(bankTxn.id);
      if (matchedAcc) matchedAccIds.add(matchedAcc.id);
    }
  }

  // 2. Check for remaining Accounting Records with explicit discrepancies or missing bank records
  for (const accRec of accountingRecords) {
    if (matchedAccIds.has(accRec.id)) continue;

    if (accRec.discrepancyReason === "Missing Bank Transaction" || accRec.status === "Discrepancy") {
      const accAmount = accRec.credit > 0 ? accRec.credit : accRec.debit;
      discrepancies.push({
        id: `DISC-${accRec.id}`,
        bankTxnId: "N/A",
        accRecordId: accRec.id,
        bankAmount: 0,
        accountingAmount: accAmount,
        difference: accAmount,
        date: accRec.date,
        reason: accRec.discrepancyReason || "Missing Bank Transaction",
        description: `Unpresented cheque or unposted payment: ${accRec.description}`,
        suggestedAction: "Track with bank branch or await customer presentation",
        status: "Pending",
        notes: accRec.notes || "Cheque issued/received not yet reflected on bank statement."
      });
      matchedAccIds.add(accRec.id);
    }
  }

  // 3. Collect unmatched bank transactions and accounting records
  const unmatchedBankTxns = bankTransactions.filter(b => !matchedBankIds.has(b.id));
  const unmatchedAccRecords = accountingRecords.filter(a => !matchedAccIds.has(a.id));

  // Compute Statistics
  const totalBankCount = bankTransactions.length;
  const totalAccCount = accountingRecords.length;
  const totalProcessed = totalBankCount + totalAccCount;
  const matchedCount = matchedPairs.length;
  const discrepancyCount = discrepancies.length;
  const unmatchedCount = unmatchedBankTxns.length + unmatchedAccRecords.length;

  const totalPossibleMatches = Math.max(totalBankCount, totalAccCount);
  const matchRate = totalPossibleMatches > 0 ? ((matchedCount / totalPossibleMatches) * 100).toFixed(1) : 0;

  return {
    matchedPairs,
    discrepancies,
    unmatchedBankTxns,
    unmatchedAccRecords,
    stats: {
      totalBankTransactions: totalBankCount,
      totalAccountingRecords: totalAccCount,
      totalProcessed,
      matched: matchedCount,
      unmatched: unmatchedCount,
      discrepancies: discrepancyCount,
      matchRate: Number(matchRate)
    }
  };
};
