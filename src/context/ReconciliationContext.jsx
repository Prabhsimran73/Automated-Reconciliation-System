// React Context for Reconciliation State Management
// BCA Minor Project 2026

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialBankTransactions, initialAccountingRecords, defaultSettings, monthlyReconciliationHistory } from '../data/mockData';
import { runReconciliationEngine } from '../utils/reconciliationEngine';
import confetti from 'canvas-confetti';

const ReconciliationContext = createContext(null);

export const ReconciliationProvider = ({ children }) => {
  const [bankTransactions, setBankTransactions] = useState(() => {
    const saved = localStorage.getItem('recon_bank_txns');
    return saved ? JSON.parse(saved) : initialBankTransactions;
  });

  const [accountingRecords, setAccountingRecords] = useState(() => {
    const saved = localStorage.getItem('recon_acc_records');
    return saved ? JSON.parse(saved) : initialAccountingRecords;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('recon_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [resolvedDiscrepancies, setResolvedDiscrepancies] = useState(() => {
    const saved = localStorage.getItem('recon_resolved_discrepancies');
    return saved ? JSON.parse(saved) : {};
  });

  const [reconciliationResults, setReconciliationResults] = useState(() => {
    // Initial run on mount
    const savedBank = localStorage.getItem('recon_bank_txns');
    const savedAcc = localStorage.getItem('recon_acc_records');
    const savedSet = localStorage.getItem('recon_settings');
    const savedResolved = localStorage.getItem('recon_resolved_discrepancies');
    let resolvedMap = savedResolved ? JSON.parse(savedResolved) : {};

    const baseResults = runReconciliationEngine(
      savedBank ? JSON.parse(savedBank) : initialBankTransactions,
      savedAcc ? JSON.parse(savedAcc) : initialAccountingRecords,
      savedSet ? JSON.parse(savedSet) : defaultSettings
    );

    let mergedDiscrepancies = baseResults.discrepancies.map(d => {
      if (resolvedMap[d.id]) {
        return { ...d, ...resolvedMap[d.id] };
      }
      return d;
    });

    let pendingCount = mergedDiscrepancies.filter(d => d.status !== 'Resolved').length;

    // Requirement: Whenever user opens website, if all discrepancies are resolved (0 Pending),
    // automatically unresolve/reset them so there are always active discrepancies to solve!
    if (pendingCount === 0 && baseResults.discrepancies.length > 0) {
      localStorage.removeItem('recon_resolved_discrepancies');
      resolvedMap = {};
      mergedDiscrepancies = baseResults.discrepancies.map(d => ({ ...d, status: 'Pending' }));
      pendingCount = mergedDiscrepancies.length;
    }

    return {
      ...baseResults,
      discrepancies: mergedDiscrepancies,
      stats: {
        ...baseResults.stats,
        discrepancies: pendingCount
      }
    };
  });

  const [isReconciling, setIsReconciling] = useState(false);
  const [reconciliationProgress, setReconciliationProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [lastReconciliationDate, setLastReconciliationDate] = useState(() => {
    return localStorage.getItem('recon_last_date') || new Date().toISOString();
  });

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      type: 'info',
      title: 'System Ready',
      message: 'Bank feed and accounting ledgers loaded with 22 bank transactions & 20 ledger records.',
      time: 'Just now',
      read: false
    },
    {
      id: 'notif-2',
      type: 'warning',
      title: 'Discrepancy Flagged',
      message: '₹2,000 variance detected for Synergy Office Supplies (REF-IMPS-77312).',
      time: '5 mins ago',
      read: false
    }
  ]);

  const [recentActivities, setRecentActivities] = useState([
    { id: 'act-1', date: '2026-08-01', bankTxn: 'TXN1001', accountingRecord: 'ACC1001', amount: 50000, status: 'Matched' },
    { id: 'act-2', date: '2026-08-02', bankTxn: 'TXN1002', accountingRecord: 'ACC1002', amount: 8500, status: 'Matched' },
    { id: 'act-3', date: '2026-08-03', bankTxn: 'TXN1003', accountingRecord: 'ACC1003', amount: 14500, status: 'Discrepancy' },
    { id: 'act-4', date: '2026-08-04', bankTxn: 'TXN1004', accountingRecord: 'ACC1004', amount: 120000, status: 'Matched' },
    { id: 'act-5', date: '2026-08-05', bankTxn: 'TXN1005', accountingRecord: 'ACC1005', amount: 350000, status: 'Matched' },
    { id: 'act-6', date: '2026-08-06', bankTxn: 'TXN1006', accountingRecord: 'N/A', amount: 1250, status: 'Discrepancy' }
  ]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('recon_bank_txns', JSON.stringify(bankTransactions));
  }, [bankTransactions]);

  useEffect(() => {
    localStorage.setItem('recon_acc_records', JSON.stringify(accountingRecords));
  }, [accountingRecords]);

  useEffect(() => {
    localStorage.setItem('recon_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('recon_resolved_discrepancies', JSON.stringify(resolvedDiscrepancies));
  }, [resolvedDiscrepancies]);

  // Run Reconciliation Simulation
  const steps = [
    { name: 'Preparing transactions...', detail: 'Validating data schema, dates and currency formats' },
    { name: 'Comparing records...', detail: 'Cross-referencing bank statements with general ledger' },
    { name: 'Checking amounts...', detail: 'Verifying credits against debits & detecting numerical variances' },
    { name: 'Checking references...', detail: 'Hashing NEFT, UPI, RTGS and Cheque reference identifiers' },
    { name: 'Finalizing reconciliation...', detail: 'Generating confidence score matrix and discrepancy ledger' }
  ];

  const runReconciliation = async (overrideSettings = null) => {
    if (isReconciling) return;
    setIsReconciling(true);
    setReconciliationProgress(5);
    setCurrentStepIndex(0);

    const activeSettings = overrideSettings || settings;

    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);
      const stepProgress = Math.round(((i + 1) / steps.length) * 100);
      setReconciliationProgress(stepProgress);
      // Wait for realistic visual feedback
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Execute core engine
    const results = runReconciliationEngine(bankTransactions, accountingRecords, activeSettings);

    // Preserve previously resolved discrepancies so resolutions don't revert to Pending
    const mergedDiscrepancies = results.discrepancies.map(d => {
      if (resolvedDiscrepancies[d.id]) {
        return {
          ...d,
          ...resolvedDiscrepancies[d.id]
        };
      }
      return d;
    });

    const pendingCount = mergedDiscrepancies.filter(d => d.status !== 'Resolved').length;

    const finalResults = {
      ...results,
      discrepancies: mergedDiscrepancies,
      stats: {
        ...results.stats,
        discrepancies: pendingCount
      }
    };

    setReconciliationResults(finalResults);
    const now = new Date().toISOString();
    setLastReconciliationDate(now);
    localStorage.setItem('recon_last_date', now);

    // Update bank & accounting record statuses based on matches and resolutions
    const matchedBankIds = new Set(results.matchedPairs.map(m => m.bankTxnId));
    const pendingDiscBankIds = new Set(
      mergedDiscrepancies.filter(d => d.status !== 'Resolved').map(d => d.bankTxnId)
    );
    const resolvedBankIds = new Set(
      mergedDiscrepancies.filter(d => d.status === 'Resolved').map(d => d.bankTxnId)
    );

    setBankTransactions(prev => prev.map(txn => {
      if (matchedBankIds.has(txn.id)) return { ...txn, status: 'Matched' };
      if (resolvedBankIds.has(txn.id)) return { ...txn, status: 'Resolved' };
      if (pendingDiscBankIds.has(txn.id)) return { ...txn, status: 'Discrepancy' };
      return { ...txn, status: 'Unmatched' };
    }));

    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore in non-browser env
    }

    // Add Notification
    addNotification({
      type: 'success',
      title: 'Reconciliation Completed',
      message: `Processed ${finalResults.stats.totalProcessed} records with ${finalResults.stats.matchRate}% Match Rate. ${pendingCount} active discrepancies pending.`
    });

    setIsReconciling(false);
    return finalResults;
  };

  const resolveDiscrepancy = (discrepancyId, resolutionDetails = {}) => {
    const resolutionData = {
      status: 'Resolved',
      resolutionAction: resolutionDetails.action || 'Manual Adjustment',
      resolutionNotes: resolutionDetails.notes || 'Resolved by Administrator',
      resolvedAt: new Date().toISOString()
    };

    setResolvedDiscrepancies(prev => ({
      ...prev,
      [discrepancyId]: resolutionData
    }));

    setReconciliationResults(prev => {
      const updatedDiscrepancies = prev.discrepancies.map(item => {
        if (item.id === discrepancyId) {
          return {
            ...item,
            ...resolutionData
          };
        }
        return item;
      });

      const pendingCount = updatedDiscrepancies.filter(d => d.status !== 'Resolved').length;

      return {
        ...prev,
        discrepancies: updatedDiscrepancies,
        stats: {
          ...prev.stats,
          discrepancies: pendingCount
        }
      };
    });

    // Also update linked transaction statuses in records
    const target = reconciliationResults?.discrepancies?.find(d => d.id === discrepancyId);
    if (target) {
      if (target.bankTxnId && target.bankTxnId !== 'N/A') {
        setBankTransactions(prev => prev.map(t => t.id === target.bankTxnId ? { ...t, status: 'Resolved' } : t));
      }
      if (target.accRecordId && target.accRecordId !== 'N/A') {
        setAccountingRecords(prev => prev.map(a => a.id === target.accRecordId ? { ...a, status: 'Resolved' } : a));
      }
    }

    addNotification({
      type: 'info',
      title: 'Discrepancy Resolved',
      message: `Discrepancy ${discrepancyId} was marked as Resolved (${resolutionDetails.action || 'Manual adjustment'}).`
    });
  };

  /**
   * Unresolve (Undo) a specific discrepancy back to Pending
   */
  const unresolveDiscrepancy = (discrepancyId) => {
    setResolvedDiscrepancies(prev => {
      const next = { ...prev };
      delete next[discrepancyId];
      localStorage.setItem('recon_resolved_discrepancies', JSON.stringify(next));
      return next;
    });

    setReconciliationResults(prev => {
      const updatedDiscrepancies = prev.discrepancies.map(item => {
        if (item.id === discrepancyId) {
          const { resolutionAction, resolutionNotes, resolvedAt, ...cleanItem } = item;
          return {
            ...cleanItem,
            status: 'Pending'
          };
        }
        return item;
      });

      const pendingCount = updatedDiscrepancies.filter(d => d.status !== 'Resolved').length;

      return {
        ...prev,
        discrepancies: updatedDiscrepancies,
        stats: {
          ...prev.stats,
          discrepancies: pendingCount
        }
      };
    });

    // Revert linked bank transaction or accounting record status back to Discrepancy
    const target = reconciliationResults?.discrepancies?.find(d => d.id === discrepancyId);
    if (target) {
      if (target.bankTxnId && target.bankTxnId !== 'N/A') {
        setBankTransactions(prev => prev.map(t => t.id === target.bankTxnId ? { ...t, status: 'Discrepancy' } : t));
      }
      if (target.accRecordId && target.accRecordId !== 'N/A') {
        setAccountingRecords(prev => prev.map(a => a.id === target.accRecordId ? { ...a, status: 'Discrepancy' } : a));
      }
    }

    addNotification({
      type: 'warning',
      title: 'Discrepancy Reverted',
      message: `Discrepancy ${discrepancyId} has been un-resolved and set back to Pending for review.`
    });
  };

  /**
   * Unresolve all discrepancies so the user can solve them anytime
   */
  const unresolveAllDiscrepancies = () => {
    localStorage.removeItem('recon_resolved_discrepancies');
    setResolvedDiscrepancies({});

    setReconciliationResults(prev => {
      const updatedDiscrepancies = prev.discrepancies.map(item => {
        const { resolutionAction, resolutionNotes, resolvedAt, ...cleanItem } = item;
        return {
          ...cleanItem,
          status: 'Pending'
        };
      });

      return {
        ...prev,
        discrepancies: updatedDiscrepancies,
        stats: {
          ...prev.stats,
          discrepancies: updatedDiscrepancies.length
        }
      };
    });

    setBankTransactions(prev => prev.map(t => t.discrepancyReason ? { ...t, status: 'Discrepancy' } : t));
    setAccountingRecords(prev => prev.map(a => a.discrepancyReason ? { ...a, status: 'Discrepancy' } : a));

    addNotification({
      type: 'info',
      title: 'Discrepancies Ready to Solve',
      message: 'All discrepancies have been un-resolved and restored to Pending.'
    });
  };

  const addBankTransaction = (txn) => {
    const newTxn = {
      id: `TXN${1000 + bankTransactions.length + 1}`,
      date: txn.date || new Date().toISOString().split('T')[0],
      description: txn.description || 'General Bank Entry',
      amount: Number(txn.amount) || 0,
      type: txn.type || 'Credit',
      reference: txn.reference || `REF-MANUAL-${Math.floor(10000 + Math.random() * 90000)}`,
      bankAccount: 'HDFC Bank - Current A/c 50200012345678',
      status: 'Unmatched',
      notes: txn.notes || 'Manual user entry'
    };
    setBankTransactions(prev => [newTxn, ...prev]);
    addNotification({
      type: 'info',
      title: 'Bank Transaction Added',
      message: `Added ${newTxn.id} (${newTxn.reference}) for ₹${newTxn.amount}.`
    });
  };

  const addAccountingRecord = (rec) => {
    const isDebit = rec.type === 'Debit';
    const amount = Number(rec.amount) || 0;
    const newRec = {
      id: `ACC${1000 + accountingRecords.length + 1}`,
      date: rec.date || new Date().toISOString().split('T')[0],
      description: rec.description || 'General Ledger Entry',
      debit: isDebit ? amount : 0,
      credit: !isDebit ? amount : 0,
      reference: rec.reference || `REF-ACC-${Math.floor(10000 + Math.random() * 90000)}`,
      accountHead: rec.accountHead || 'General Expenses / Income',
      status: 'Unmatched',
      notes: rec.notes || 'Manual user entry'
    };
    setAccountingRecords(prev => [newRec, ...prev]);
    addNotification({
      type: 'info',
      title: 'Accounting Record Added',
      message: `Added ${newRec.id} for ₹${amount}.`
    });
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    addNotification({
      type: 'info',
      title: 'Settings Updated',
      message: 'Reconciliation matching parameters have been saved.'
    });
  };

  const addNotification = ({ type = 'info', title, message }) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 15)]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const resetDemoData = () => {
    localStorage.removeItem('recon_bank_txns');
    localStorage.removeItem('recon_acc_records');
    localStorage.removeItem('recon_settings');
    localStorage.removeItem('recon_last_date');
    localStorage.removeItem('recon_resolved_discrepancies');
    setResolvedDiscrepancies({});
    setBankTransactions(initialBankTransactions);
    setAccountingRecords(initialAccountingRecords);
    setSettings(defaultSettings);
    const initialRes = runReconciliationEngine(initialBankTransactions, initialAccountingRecords, defaultSettings);
    setReconciliationResults(initialRes);
    addNotification({
      type: 'info',
      title: 'Demo Data Reset',
      message: 'All bank statements, ledger entries, settings and resolutions have been restored to defaults.'
    });
  };

  return (
    <ReconciliationContext.Provider
      value={{
        bankTransactions,
        accountingRecords,
        settings,
        reconciliationResults,
        isReconciling,
        reconciliationProgress,
        currentStepIndex,
        reconciliationSteps: steps,
        lastReconciliationDate,
        notifications,
        recentActivities,
        monthlyHistory: monthlyReconciliationHistory,
        runReconciliation,
        resolveDiscrepancy,
        unresolveDiscrepancy,
        unresolveAllDiscrepancies,
        addBankTransaction,
        addAccountingRecord,
        updateSettings,
        resetDemoData,
        addNotification,
        markAllNotificationsRead,
        clearNotification
      }}
    >
      {children}
    </ReconciliationContext.Provider>
  );
};

export const useReconciliation = () => {
  const context = useContext(ReconciliationContext);
  if (!context) {
    throw new Error('useReconciliation must be used within a ReconciliationProvider');
  }
  return context;
};
